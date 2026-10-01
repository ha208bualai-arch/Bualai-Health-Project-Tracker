import React, { useState, useMemo } from 'react';
import {
  X,
  Send,
  Smartphone,
  Settings,
  History,
  CheckCircle,
  Copy,
  Check,
  ShieldCheck,
  Building,
  User,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  OfficerProfile,
  ProjectTimelineItem,
  LineBotConfig,
  SystemNotification,
} from '../types';
import {
  generateProjectTimelineFlexMessage,
  generateExecutiveDigestFlexMessage,
  LineMessageLog,
} from '../utils/lineService';
import { soundEffects } from '../utils/audio';

interface LineOAManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  officers: OfficerProfile[];
  projects: ProjectTimelineItem[];
  preselectedOfficer?: OfficerProfile | null;
  preselectedProject?: ProjectTimelineItem | null;
  onNewNotification: (notif: SystemNotification) => void;
  config: LineBotConfig;
  setConfig: (config: LineBotConfig) => void;
}

export const LineOAManagerModal: React.FC<LineOAManagerModalProps> = ({
  isOpen,
  onClose,
  officers,
  projects,
  preselectedOfficer,
  preselectedProject,
  onNewNotification,
  config,
  setConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'dispatcher' | 'history' | 'settings'>('dispatcher');

  const [recipientType, setRecipientType] = useState<'EXECUTIVE' | 'OFFICER' | 'ALL'>(
    preselectedOfficer?.isExecutive ? 'EXECUTIVE' : preselectedOfficer ? 'OFFICER' : 'OFFICER'
  );
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(
    preselectedOfficer?.id || officers[1]?.id || ''
  );
  const [templateType, setTemplateType] = useState<'PROJECT_TIMELINE_ALERT' | 'EXECUTIVE_DIGEST'>(
    'PROJECT_TIMELINE_ALERT'
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    preselectedProject?.id || projects[0]?.id || ''
  );
  const [urgency, setUrgency] = useState<'ปกติ' | 'ด่วน' | 'ด่วนที่สุด'>('ด่วน');

  const [messageLogs, setMessageLogs] = useState<LineMessageLog[]>([
    {
      id: 'log-1',
      timestamp: 'วันนี้ 09:30 น.',
      recipientName: 'นางสาวประภัสสร คณะรัฐ',
      recipientLineId: 'U_EXECUTIVE_PRAPASSORN',
      recipientRole: 'รักษาการ ผอ.รพ.บัวลาย / ประธาน คปสอ.',
      templateType: 'EXECUTIVE_DIGEST',
      title: 'สรุปสถานะโครงการตามระยะเวลาดำเนินการ ประจำสัปดาห์',
      status: 'SENT',
      previewText: 'รายงานความคืบหน้า 22 โครงการ ตามไตรมาส 1-4',
      flexJson: '{}',
    },
    {
      id: 'log-2',
      timestamp: 'วันนี้ 08:45 น.',
      recipientName: 'นายเสริมพันธุ์ ประกอบผล',
      recipientLineId: 'U_SERMPHAN_LAB',
      recipientRole: 'กลุ่มงานเทคนิคการแพทย์',
      templateType: 'PROJECT_TIMELINE_ALERT',
      title: 'แจ้งเตือนระยะเวลา: โครงการตรวจประเมินระบบคุณภาพ LAB',
      status: 'SENT',
      previewText: 'กำหนดดำเนินการในไตรมาส 2 (ม.ค. - มิ.ย. 2570)',
      flexJson: '{}',
    },
  ]);

  const [copiedJson, setCopiedJson] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Current active project
  const currentProject = useMemo(() => {
    return (
      projects.find((p) => p.id === selectedProjectId) ||
      preselectedProject ||
      projects[0]
    );
  }, [selectedProjectId, preselectedProject, projects]);

  // Active recipient
  const activeRecipient = useMemo(() => {
    if (recipientType === 'EXECUTIVE') {
      return officers.find((o) => o.isExecutive) || officers[0];
    }
    if (recipientType === 'OFFICER') {
      return officers.find((o) => o.id === selectedOfficerId) || officers[1];
    }
    return {
      name: 'ผู้รับผิดชอบโครงการทุกคน (Broadcast)',
      role: 'คณะทำงานสาธารณสุข รพ.บัวลาย & คปสอ. บัวลาย',
      lineUserId: 'BROADCAST_ALL',
    };
  }, [recipientType, selectedOfficerId, officers]);

  // Generated Flex Message Payload
  const flexMessage = useMemo(() => {
    if (templateType === 'EXECUTIVE_DIGEST') {
      let completed = 0;
      let inProgress = 0;
      let delayed = 0;

      projects.forEach((p) => {
        if (p.status === 'COMPLETED') completed++;
        else if (p.status === 'IN_PROGRESS') inProgress++;
        else if (p.status === 'DELAYED') delayed++;
      });

      return generateExecutiveDigestFlexMessage({
        hospitalName: 'โรงพยาบาลบัวลาย & คปสอ. บัวลาย',
        reportPeriod: 'รอบรายงานไตรมาส 1 (ต.ค. - ธ.ค. 2569)',
        totalProjects: projects.length,
        completedProjects: completed,
        inProgressProjects: inProgress,
        delayedProjects: delayed,
        actionUrl: window.location.href,
      });
    }

    if (!currentProject) return null;

    const qLabels: string[] = [];
    if (currentProject.quarters.q1) qLabels.push('ตม.1');
    if (currentProject.quarters.q2) qLabels.push('ตม.2');
    if (currentProject.quarters.q3) qLabels.push('ตม.3');
    if (currentProject.quarters.q4) qLabels.push('ตม.4');

    const statusMap = {
      COMPLETED: { text: '✓ สำเร็จแล้ว', color: '#059669' },
      IN_PROGRESS: { text: '⏳ กำลังดำเนินการ', color: '#d97706' },
      DELAYED: { text: '⚠️ ล่าช้ากว่ากำหนด', color: '#dc2626' },
      NOT_STARTED: { text: '⚪ รอเริ่มตามแผน', color: '#64748b' },
    };

    return generateProjectTimelineFlexMessage({
      hospitalName: currentProject.orgType === 'HOSPITAL' ? 'รพ.บัวลาย' : 'คปสอ. บัวลาย',
      projectTitle: currentProject.title,
      timelineText: currentProject.timelineText,
      targetMonths: currentProject.targetMonths,
      quarterLabel: qLabels.join(', ') || 'ตามแผน',
      responsiblePerson: currentProject.responsiblePerson,
      statusText: statusMap[currentProject.status].text,
      statusColor: statusMap[currentProject.status].color,
      urgency: urgency === 'ด่วนที่สุด' ? '🚨 ด่วนที่สุด' : urgency === 'ด่วน' ? '⚠️ เร่งรัด' : '📌 แจ้งเตือน',
      progressPercent: currentProject.progressPercent,
      actionUrl: window.location.href,
    });
  }, [templateType, currentProject, projects, urgency]);

  const handleSendLine = () => {
    setIsSending(true);
    soundEffects.playChime('line');

    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);

      const newLog: LineMessageLog = {
        id: `log-${Date.now()}`,
        timestamp: 'เมื่อสักครู่',
        recipientName: activeRecipient?.name || 'ผู้รับผิดชอบ',
        recipientLineId: activeRecipient?.lineUserId || 'U_USER',
        recipientRole: activeRecipient?.role || 'คณะทำงาน',
        templateType,
        title:
          templateType === 'EXECUTIVE_DIGEST'
            ? 'สรุปรายงานผู้บริหารประจำสัปดาห์'
            : currentProject?.title || 'แจ้งเตือนโครงการ',
        status: 'SENT',
        previewText:
          templateType === 'EXECUTIVE_DIGEST'
            ? 'สรุปสถานะโครงการตามระยะเวลา 22 โครงการ'
            : `แจ้งเตือนระยะเวลาดำเนินการ: ${currentProject?.timelineText}`,
        flexJson: JSON.stringify(flexMessage, null, 2),
      };

      setMessageLogs([newLog, ...messageLogs]);

      onNewNotification({
        id: `notif-${Date.now()}`,
        timestamp: 'เมื่อสักครู่',
        title: `📲 ส่งข้อความ LINE แจ้งเตือนสำเร็จ: ${activeRecipient?.name}`,
        message: `ส่งแจ้งเตือนโครงการ "${currentProject?.title}" ระยะเวลา: ${currentProject?.timelineText}`,
        type: 'SUCCESS',
        targetRecipient: activeRecipient?.name || 'ผู้รับผิดชอบ',
        recipientRole: recipientType,
        read: false,
        sentToLine: true,
      });

      setTimeout(() => {
        setSendSuccess(false);
      }, 3000);
    }, 600);
  };

  const handleCopyJson = () => {
    if (flexMessage) {
      navigator.clipboard.writeText(JSON.stringify(flexMessage, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white border-2 border-emerald-600/30 rounded-3xl w-full max-w-5xl my-4 overflow-hidden shadow-2xl flex flex-col max-h-[92vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar - Deep Emerald Green */}
        <div className="px-6 py-5 border-b-2 border-emerald-900/40 flex items-center justify-between bg-[#064E3B] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
              LINE
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                ศูนย์ส่งข้อความแจ้งเตือนผ่าน LINE Official Account (LINE OA)
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200 font-medium">
                แจ้งเตือนชื่อโครงการและระยะเวลาดำเนินการตามกำหนดเวลาให้ผู้บริหารและผู้รับผิดชอบ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1 p-1 bg-emerald-900/90 border border-emerald-700/60 rounded-xl text-xs sm:text-sm font-bold">
              <button
                onClick={() => setActiveTab('dispatcher')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'dispatcher' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-200 hover:text-white'
                }`}
              >
                ส่งข้อความ & จำลอง
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'history' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-200 hover:text-white'
                }`}
              >
                ประวัติส่ง ({messageLogs.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'settings' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-200 hover:text-white'
                }`}
              >
                ตั้งค่า Bot API
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-bold text-emerald-100 hover:text-white rounded-xl hover:bg-emerald-900/80 border border-emerald-700/60 transition-colors cursor-pointer flex items-center gap-1"
              title="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
              <span>ปิด</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {activeTab === 'dispatcher' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-6 space-y-4">
                {/* 1. Recipient */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    1. เลือกผู้รับข้อความแจ้งเตือน (Recipient)
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRecipientType('EXECUTIVE')}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                        recipientType === 'EXECUTIVE'
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-2xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <User className="w-4 h-4 text-teal-700" />
                      <span>ผู้บริหาร (ผอ.รพ.)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipientType('OFFICER')}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                        recipientType === 'OFFICER'
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-2xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Building className="w-4 h-4 text-teal-700" />
                      <span>ผู้รับผิดชอบโครงการ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipientType('ALL')}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                        recipientType === 'ALL'
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-2xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Send className="w-4 h-4 text-teal-700" />
                      <span>บรอดแคสต์ทุกคน</span>
                    </button>
                  </div>

                  {recipientType === 'OFFICER' && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        รายชื่อผู้รับผิดชอบ:
                      </label>
                      <select
                        value={selectedOfficerId}
                        onChange={(e) => setSelectedOfficerId(e.target.value)}
                        className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                      >
                        {officers
                          .filter((o) => !o.isExecutive)
                          .map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.name} - {o.department}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {recipientType === 'EXECUTIVE' && (
                    <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900">
                      <strong>ผู้รับ:</strong> นางสาวประภัสสร คณะรัฐ (รักษาการ ผอ.รพ.บัวลาย / ประธาน คปสอ.)
                    </div>
                  )}
                </div>

                {/* 2. Project Selection */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    2. เลือกโครงการและระยะเวลาที่ต้องการแจ้งเตือน
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTemplateType('PROJECT_TIMELINE_ALERT')}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                        templateType === 'PROJECT_TIMELINE_ALERT'
                          ? 'bg-teal-50 text-teal-900 border-teal-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      แจ้งเตือนกำหนดเวลาโครงการ
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplateType('EXECUTIVE_DIGEST')}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                        templateType === 'EXECUTIVE_DIGEST'
                          ? 'bg-teal-50 text-teal-900 border-teal-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      รายงานสรุปภาพรวมผู้บริหาร
                    </button>
                  </div>

                  {templateType === 'PROJECT_TIMELINE_ALERT' && (
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        เลือกชื่อโครงการ (22 โครงการ):
                      </label>
                      <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                      >
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.orgType === 'HOSPITAL' ? 'รพ.' : 'คปสอ.'}] {p.title} ({p.timelineText})
                          </option>
                        ))}
                      </select>

                      {currentProject && (
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                          <div className="font-semibold text-slate-900">{currentProject.title}</div>
                          <div className="text-teal-800 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            <span>ระยะเวลาดำเนินการ: {currentProject.timelineText}</span>
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            ช่วงกำหนด: {currentProject.targetMonths} · ผู้รับผิดชอบ: {currentProject.responsiblePerson}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs text-slate-600">ระดับความเร่งด่วน:</span>
                    <div className="flex items-center gap-2">
                      {(['ปกติ', 'ด่วน', 'ด่วนที่สุด'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setUrgency(lvl)}
                          className={`px-2.5 py-1 text-xs rounded-md border cursor-pointer transition-colors ${
                            urgency === lvl
                              ? lvl === 'ด่วนที่สุด'
                                ? 'bg-red-500 text-white border-red-600 font-bold'
                                : lvl === 'ด่วน'
                                ? 'bg-amber-500 text-white border-amber-600 font-bold'
                                : 'bg-slate-700 text-white border-slate-800 font-bold'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Send Button */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>ปลายทาง: <strong className="text-slate-800">{activeRecipient?.name}</strong></span>
                    <span className="font-mono text-[11px] text-emerald-700 font-medium">✓ LINE Webhook Ready</span>
                  </div>

                  <button
                    onClick={handleSendLine}
                    disabled={isSending}
                    className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>กำลังส่งข้อความผ่าน LINE API...</span>
                      </>
                    ) : sendSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-200" />
                        <span>ส่งแจ้งเตือนเรียบร้อยแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>ส่งข้อความแจ้งเตือนผ่าน LINE OA ทันที</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleCopyJson}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedJson ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">คัดลอก JSON แล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>คัดลอก Flex JSON ไปใช้ใน LINE Official Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Exact Smartphone LINE Simulator */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-slate-700" />
                  <span>ตัวอย่างมุมมองแจ้งเตือนบนแอปพลิเคชัน LINE</span>
                </div>

                {/* Smartphone Device Frame */}
                <div className="w-[340px] sm:w-[370px] bg-slate-900 rounded-[36px] p-3 shadow-2xl border-4 border-slate-800">
                  <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700"></div>
                  </div>

                  <div className="bg-[#788e9f] rounded-[24px] overflow-hidden flex flex-col h-[520px]">
                    {/* LINE Header */}
                    <div className="bg-[#243542] px-4 py-2.5 text-white flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-teal-800 border border-teal-400 flex items-center justify-center font-bold text-xs text-white shrink-0">
                          <img
                            src="/src/assets/images/health_project_plan_logo_1790846956963.jpg"
                            alt="LINE OA Bot Avatar"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="font-bold text-[10px] hidden [img[style*='display: none']~&]:inline">BL</span>
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight flex items-center gap-1">
                            <span>รพ.บัวลาย & คปสอ. OA</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                          </div>
                          <div className="text-[10px] text-slate-300 leading-none">
                            ระบบติดตามแผนงาน 2570
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">09:41</div>
                    </div>

                    {/* Chat Bubble */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      <div className="text-center">
                        <span className="px-2 py-0.5 rounded-full bg-black/20 text-white text-[10px]">
                          วันนี้ 09:41 น.
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs border border-emerald-500">
                          <img
                            src="/src/assets/images/line_oa_bot_avatar_1790845658533.jpg"
                            alt="BOT"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="font-bold text-[9px] hidden [img[style*='display: none']~&]:inline">BOT</span>
                        </div>

                        {/* Flex Card */}
                        <div className="max-w-[270px] sm:max-w-[290px] rounded-2xl overflow-hidden shadow-lg border border-black/10 bg-white">
                          {templateType === 'EXECUTIVE_DIGEST' ? (
                            <div>
                              <div className="bg-slate-900 text-white p-3 space-y-1">
                                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                                  📊 Executive Report
                                </div>
                                <div className="text-sm font-bold leading-tight">
                                  สรุปโครงการตามระยะเวลาดำเนินการ
                                </div>
                                <div className="text-[11px] text-slate-300">
                                  ปีงบประมาณ 2570 · ไตรมาส 1 (ต.ค. - ธ.ค. 2569)
                                </div>
                              </div>
                              <div className="p-3 text-xs space-y-2 text-slate-700 bg-white">
                                <div className="grid grid-cols-2 gap-2 text-center">
                                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                                    <div className="text-[10px] text-emerald-700">สำเร็จตามแผน</div>
                                    <div className="text-sm font-bold text-emerald-800 font-mono">6 โครงการ</div>
                                  </div>
                                  <div className="p-2 rounded-lg bg-teal-50 border border-teal-100">
                                    <div className="text-[10px] text-teal-700">กำลังทำ (ตม.1)</div>
                                    <div className="text-sm font-bold text-teal-800 font-mono">16 โครงการ</div>
                                  </div>
                                </div>
                                <div className="pt-2">
                                  <button
                                    onClick={onClose}
                                    className="w-full py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold text-center hover:bg-slate-800 transition-colors"
                                  >
                                    เปิดดูไทม์ไลน์โครงการในระบบ
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="bg-teal-700 text-white p-3 space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span>🏥 {currentProject?.orgType === 'HOSPITAL' ? 'รพ.บัวลาย' : 'คปสอ. บัวลาย'}</span>
                                  <span className="font-bold text-amber-300">
                                    {urgency === 'ด่วนที่สุด' ? '🚨 ด่วนที่สุด' : '⚠️ เร่งรัด'}
                                  </span>
                                </div>
                                <div className="text-xs sm:text-sm font-bold leading-tight">
                                  {currentProject?.title}
                                </div>
                              </div>
                              <div className="p-3 text-xs space-y-2 text-slate-700 bg-white">
                                <div className="space-y-1.5 text-[11px]">
                                  <div>
                                    <span className="text-slate-500 block">ระยะเวลาดำเนินการ:</span>
                                    <span className="font-bold text-teal-800">
                                      {currentProject?.timelineText}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block">ช่วงเดือนที่กำหนด:</span>
                                    <span className="text-slate-800 font-medium">
                                      {currentProject?.targetMonths}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">ผู้รับผิดชอบ:</span>
                                    <span className="font-semibold text-slate-800">
                                      {currentProject?.responsiblePerson}
                                    </span>
                                  </div>
                                </div>
                                <div className="pt-2 border-t border-slate-100">
                                  <button
                                    onClick={onClose}
                                    className="w-full py-1.5 rounded-lg bg-teal-700 text-white text-xs font-semibold text-center hover:bg-teal-800 transition-colors"
                                  >
                                    เปิดระบบเพื่ออัปเดตผลงาน
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1f2d37] p-2 flex items-center gap-2 shrink-0">
                      <div className="flex-1 bg-[#2b3c48] rounded-full px-3 py-1 text-xs text-slate-400">
                        พิมพ์ข้อความโต้ตอบ...
                      </div>
                      <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                        <Send className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  ประวัติการส่งแจ้งเตือนผ่าน LINE Official Account
                </h3>
                <span className="text-xs text-slate-500">
                  รวม {messageLogs.length} ข้อความ
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs divide-y divide-slate-100">
                {messageLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {log.status === 'SENT' ? 'ส่งแล้ว' : 'จำลอง'}
                        </span>
                        <span className="font-semibold text-slate-900">{log.recipientName}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">{log.recipientRole}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">{log.timestamp}</span>
                    </div>

                    <div className="text-sm font-medium text-slate-800">{log.title}</div>
                    <div className="text-xs text-slate-500">{log.previewText}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  การเชื่อมต่อ LINE Messaging API & Webhook
                </h3>
                <p className="text-xs text-slate-500">
                  กำหนดค่า Channel Access Token จาก LINE Developers Console เพื่อส่งข้อความ Push API ไปยังผู้บริหารและบุคลากรจริง
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Channel Access Token (Long-Lived):
                    </label>
                    <input
                      type="password"
                      value={config.channelAccessToken}
                      onChange={(e) =>
                        setConfig({ ...config, channelAccessToken: e.target.value })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Channel Secret:
                    </label>
                    <input
                      type="password"
                      value={config.channelSecret}
                      onChange={(e) =>
                        setConfig({ ...config, channelSecret: e.target.value })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Webhook URL (สำหรับตั้งค่าใน LINE Developers):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={config.webhookUrl}
                        className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-mono text-xs"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(config.webhookUrl);
                        }}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg cursor-pointer"
                      >
                        คัดลอก
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoAlertEnabled}
                        onChange={(e) =>
                          setConfig({ ...config, autoAlertEnabled: e.target.checked })
                        }
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span className="font-medium text-slate-800">
                        เปิดการแจ้งเตือนอัตโนมัติเมื่อใกล้สิ้นสุดไตรมาส (15 วันล่วงหน้า)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      soundEffects.playChime('success');
                      setActiveTab('dispatcher');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 cursor-pointer"
                  >
                    บันทึกการตั้งค่า
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
