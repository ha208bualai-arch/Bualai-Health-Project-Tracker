import React, { useMemo } from 'react';
import { Building, Send, Clock, User, CheckCircle2 } from 'lucide-react';
import { OfficerProfile, ProjectTimelineItem, ProjectStatus } from '../types';

interface OfficersDirectoryViewProps {
  officers: OfficerProfile[];
  projects: ProjectTimelineItem[];
  onSendLineToOfficer: (officer: OfficerProfile) => void;
  onSelectProjectForUpdate: (project: ProjectTimelineItem) => void;
  onQuickStatusChange?: (project: ProjectTimelineItem, newStatus: ProjectStatus) => void;
}

export const OfficersDirectoryView: React.FC<OfficersDirectoryViewProps> = ({
  officers,
  projects,
  onSendLineToOfficer,
  onSelectProjectForUpdate,
  onQuickStatusChange,
}) => {
  // Aggregate projects per officer
  const officerData = useMemo(() => {
    return officers.map((officer) => {
      const assignedProjects = projects.filter((p) =>
        p.responsiblePerson.includes(officer.name.replace('นางสาว', '').replace('น.ส.', '').trim()) ||
        officer.name.includes(p.responsiblePerson.replace('นางสาว', '').replace('น.ส.', '').trim())
      );

      let completedCount = 0;
      let inProgressCount = 0;
      let delayedCount = 0;

      assignedProjects.forEach((p) => {
        if (p.status === 'COMPLETED') completedCount++;
        else if (p.status === 'IN_PROGRESS') inProgressCount++;
        else if (p.status === 'DELAYED') delayedCount++;
      });

      return {
        officer,
        assignedProjects,
        completedCount,
        inProgressCount,
        delayedCount,
      };
    });
  }, [officers, projects]);

  const executive = officerData.find((o) => o.officer.isExecutive);
  const regularOfficers = officerData.filter((o) => !o.officer.isExecutive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
          ผู้บริหารและผู้รับผิดชอบโครงการตามระยะเวลา
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">
          รายชื่อผู้รับผิดชอบและโครงการที่ต้องกำกับติดตามตามระยะเวลาที่กำหนด (ปีงบประมาณ 2570)
        </p>
      </div>

      {/* Executive Card - Deep Emerald Green with Mint Pastel */}
      {executive && (
        <div className="bg-gradient-to-r from-[#064E3B] to-emerald-900 text-white rounded-3xl p-6 sm:p-7 shadow-md border-2 border-emerald-700/80">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-emerald-900/90 border-2 border-emerald-300 flex items-center justify-center font-extrabold text-2xl text-emerald-200 shrink-0 shadow-sm relative">
                <img
                  src="/src/assets/images/executive_dr_avatar_1790845648517.jpg"
                  alt="นางสาวประภัสสร คณะรัฐ รักษาการ ผอ.รพ.บัวลาย"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="font-extrabold text-xl leading-none hidden [img[style*='display: none']~&]:inline">ผอ</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-500/25 text-emerald-200 border border-emerald-300/40">
                    ผู้บริหารสูงสุด
                  </span>
                  <span className="text-xs sm:text-sm text-emerald-200 font-mono font-bold">LINE ID: {executive.officer.lineUserId}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {executive.officer.name}
                </h2>
                <p className="text-sm sm:text-base text-emerald-100 font-bold">
                  {executive.officer.role}
                </p>
                <div className="text-xs sm:text-sm text-emerald-200/90 flex flex-wrap items-center gap-3 pt-1 font-medium">
                  <span>กำกับติดตามความก้าวหน้าโครงการตามระยะเวลา</span>
                  <span>·</span>
                  <span>อนุมัติโครงการ: นพ.สสจ. นครราชสีมา</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSendLineToOfficer(executive.officer)}
                className="px-5 py-3 text-sm font-extrabold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-300 rounded-2xl transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-98"
              >
                <Send className="w-4 h-4 text-emerald-800" />
                <span>ส่งสรุปภาพรวมผู้บริหารผ่าน LINE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Officers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {regularOfficers.map(({ officer, assignedProjects, completedCount, inProgressCount, delayedCount }) => (
          <div
            key={officer.id}
            className="bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center font-extrabold text-emerald-950 text-base">
                    {officer.name.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-950 leading-snug">
                      {officer.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-snug">
                      {officer.department}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 text-xs font-extrabold rounded-xl border ${
                    officer.orgType === 'HOSPITAL'
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                      : 'bg-teal-100 text-teal-950 border-teal-300'
                  }`}
                >
                  {officer.orgType === 'HOSPITAL' ? '🏥 รพ.บัวลาย' : '🏛️ คปสอ.'}
                </span>
              </div>

              {/* Status summary */}
              <div className="mt-4 py-2.5 px-3.5 bg-emerald-50 rounded-2xl flex items-center justify-between text-xs sm:text-sm border border-emerald-200 font-bold">
                <span className="text-slate-700">โครงการในความรับผิดชอบ:</span>
                <span className="font-extrabold text-emerald-950 font-mono text-base">
                  {assignedProjects.length} โครงการ
                </span>
              </div>

              {/* Projects & Timelines list */}
              <div className="mt-4 space-y-2.5">
                <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                  ชื่อโครงการและระยะเวลา:
                </div>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  {assignedProjects.map((p) => (
                    <div key={p.id} className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                      <div className="font-extrabold text-slate-950 leading-snug">
                        {p.title}
                      </div>
                      <div className="text-xs font-extrabold text-emerald-950 flex flex-wrap items-center justify-between gap-1.5 mt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{p.timelineText}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {onQuickStatusChange && (
                            <select
                              value={p.status}
                              onChange={(e) => onQuickStatusChange(p, e.target.value as ProjectStatus)}
                              className="text-[11px] font-bold p-1 bg-white border border-emerald-300 rounded-lg text-emerald-950 cursor-pointer shadow-2xs hover:bg-emerald-50"
                              title="เปลี่ยนสถานะโครงการทันที"
                            >
                              <option value="NOT_STARTED">⏳ รอเริ่ม</option>
                              <option value="IN_PROGRESS">🔄 ดำเนินการ</option>
                              <option value="COMPLETED">✅ สำเร็จ</option>
                              <option value="DELAYED">⚠️ ล่าช้า</option>
                            </select>
                          )}

                          <button
                            type="button"
                            onClick={() => onSelectProjectForUpdate(p)}
                            className="px-2 py-0.5 text-xs font-bold text-emerald-950 bg-white border border-emerald-300 rounded-md hover:bg-emerald-100 cursor-pointer shadow-2xs"
                          >
                            อัปเดตผล
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onSendLineToOfficer(officer)}
                className="w-full py-2.5 px-3 text-sm font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-300 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
              >
                <Send className="w-4 h-4 text-emerald-700" />
                <span>ส่งแจ้งเตือน LINE เตือนกำหนดเวลา</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
