import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ProjectTimelineItem, ProjectStatus } from '../types';
import { soundEffects } from '../utils/audio';

interface ProjectUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectTimelineItem;
  onSave: (updatedProject: ProjectTimelineItem) => void;
  onSendLineAlert?: (project: ProjectTimelineItem) => void;
}

export const ActivityUpdateModal: React.FC<ProjectUpdateModalProps> = ({
  isOpen,
  onClose,
  project,
  onSave,
  onSendLineAlert,
}) => {
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [progressPercent, setProgressPercent] = useState<number>(project.progressPercent);
  const [notes, setNotes] = useState<string>(project.notes || '');
  const [targetMonths, setTargetMonths] = useState<string>(project.targetMonths || '');
  const [notifyLineOnSave, setNotifyLineOnSave] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sync state whenever the target project changes
  useEffect(() => {
    setStatus(project.status);
    setProgressPercent(project.progressPercent);
    setNotes(project.notes || '');
    setTargetMonths(project.targetMonths || '');
    setNotifyLineOnSave(false);
    setSavedSuccess(false);
  }, [project]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const statusDefinitions: {
    key: ProjectStatus;
    label: string;
    description: string;
    icon: string;
    bgActive: string;
    textActive: string;
    borderActive: string;
    defaultPct: number;
  }[] = [
    {
      key: 'NOT_STARTED',
      label: 'รอเริ่มตามแผน',
      description: 'ยังไม่ถึงกำหนดเวลาหรืออยู่ระหว่างเตรียมการ',
      icon: '⏳',
      bgActive: 'bg-slate-100',
      textActive: 'text-slate-900',
      borderActive: 'border-slate-500 ring-2 ring-slate-400',
      defaultPct: 0,
    },
    {
      key: 'IN_PROGRESS',
      label: 'กำลังดำเนินการ',
      description: 'โครงการเริ่มปฏิบัติงานแล้วตามกำหนดเวลา',
      icon: '🔄',
      bgActive: 'bg-emerald-100',
      textActive: 'text-emerald-950',
      borderActive: 'border-emerald-600 ring-2 ring-emerald-500',
      defaultPct: 50,
    },
    {
      key: 'COMPLETED',
      label: 'เสร็จสมบูรณ์',
      description: 'ดำเนินโครงการเสร็จสิ้นครบถ้วน 100%',
      icon: '✅',
      bgActive: 'bg-green-100',
      textActive: 'text-green-950',
      borderActive: 'border-green-600 ring-2 ring-green-500',
      defaultPct: 100,
    },
    {
      key: 'DELAYED',
      label: 'ล่าช้ากว่ากำหนด',
      description: 'เกินกำหนดระยะเวลาที่ระบุ หรือติดปัญหาอุปสรรค',
      icon: '⚠️',
      bgActive: 'bg-amber-100',
      textActive: 'text-amber-950',
      borderActive: 'border-amber-600 ring-2 ring-amber-500',
      defaultPct: 30,
    },
  ];

  const handleStatusSelect = (newStatus: ProjectStatus, defaultPct: number) => {
    setStatus(newStatus);
    if (newStatus === 'COMPLETED' && progressPercent < 100) {
      setProgressPercent(100);
    } else if (newStatus === 'NOT_STARTED' && progressPercent > 0) {
      setProgressPercent(0);
    } else if (newStatus === 'IN_PROGRESS' && progressPercent === 0) {
      setProgressPercent(defaultPct);
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const updated: ProjectTimelineItem = {
      ...project,
      status: status, // Guarantee explicitly selected status
      progressPercent: progressPercent,
      notes: notes.trim(),
      targetMonths: targetMonths.trim(),
    };

    // 1. Save data to parent state / storage
    onSave(updated);

    // 2. Play audible confirmation
    soundEffects.playChime('success');

    // 3. Send LINE alert if checked
    if (notifyLineOnSave && onSendLineAlert) {
      onSendLineAlert(updated);
    }

    // 4. Show success indicator & close smoothly
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const currentStatusObj = statusDefinitions.find((s) => s.key === status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white border-2 border-emerald-600/30 rounded-3xl w-full max-w-xl my-4 overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Deep Emerald Green with Pastel Mint */}
        <div className="px-6 py-5 border-b border-emerald-900/40 flex items-center justify-between bg-[#064E3B] text-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-emerald-900/90 text-emerald-200 border border-emerald-700/60 font-bold">
                {project.code}
              </span>
              <span className="text-sm font-semibold text-emerald-200">
                {project.orgType === 'HOSPITAL' ? '🏥 โรงพยาบาลบัวลาย' : '🏛️ คปสอ. บัวลาย'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>อัปเดตผลงาน & เปลี่ยนสถานะโครงการ</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-bold text-emerald-100 hover:text-white rounded-xl hover:bg-emerald-900/80 border border-emerald-700/60 transition-colors cursor-pointer flex items-center gap-1.5"
            title="ปิดหน้าต่าง (ESC)"
          >
            <X className="w-5 h-5" />
            <span>ปิด</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 sm:p-7 space-y-5 text-sm">
          {/* Project Info Banner - Pastel Mint Green */}
          <div className="p-4 bg-emerald-50/90 border-2 border-emerald-200 rounded-2xl space-y-2 shadow-2xs">
            <div className="font-bold text-emerald-950 text-base sm:text-lg leading-snug">
              {project.title}
            </div>
            <div className="text-emerald-900 font-bold flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>ระยะเวลาดำเนินการ: {project.timelineText}</span>
            </div>
            <div className="text-slate-700 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-200/70">
              <span>ผู้รับผิดชอบ: <strong className="text-emerald-950 font-bold">{project.responsiblePerson}</strong></span>
              <span className="text-emerald-800 font-mono font-semibold">ช่วงเป้าหมาย: {project.targetMonths}</span>
            </div>
          </div>

          {/* Status Selection - 4 LARGE prominent interactive cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-950 text-base flex items-center gap-2">
                <span>เลือกสถานะโครงการ (คลิกเพื่อเปลี่ยนสถานะ):</span>
              </label>
              <span className="text-xs sm:text-sm font-bold text-emerald-800 px-2.5 py-0.5 bg-emerald-100 rounded-lg">
                สถานะที่เลือก: {currentStatusObj?.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {statusDefinitions.map(({ key, label, description, icon, bgActive, textActive, borderActive, defaultPct }) => {
                const isSelected = status === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleStatusSelect(key, defaultPct)}
                    className={`p-3.5 text-left rounded-2xl border-2 transition-all cursor-pointer relative flex items-start gap-3 ${
                      isSelected
                        ? `${bgActive} ${textActive} ${borderActive} shadow-md scale-101`
                        : 'border-slate-200 bg-white hover:bg-emerald-50/50 text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-base leading-snug">{label}</div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-snug">
                        {description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Percent Slider */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-950 text-sm sm:text-base">
                ความก้าวหน้าการดำเนินโครงการ:
              </label>
              <span className="font-mono font-bold text-emerald-950 text-xl px-3 py-1 rounded-xl bg-emerald-200/80 border border-emerald-300">
                {progressPercent}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progressPercent}
              onChange={(e) => {
                const val = Number(e.target.value);
                setProgressPercent(val);
                if (val === 100) setStatus('COMPLETED');
                else if (val === 0) setStatus('NOT_STARTED');
                else if (val > 0 && status === 'NOT_STARTED') setStatus('IN_PROGRESS');
              }}
              className="w-full accent-emerald-700 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />

            {/* Quick percent presets */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 pt-1">
              <span className="font-semibold text-slate-700">ปรับด่วน:</span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[0, 25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setProgressPercent(pct);
                      if (pct === 100) setStatus('COMPLETED');
                      else if (pct === 0) setStatus('NOT_STARTED');
                      else if (status === 'NOT_STARTED') setStatus('IN_PROGRESS');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                      progressPercent === pct
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Months / Timeline detail */}
          <div>
            <label className="block font-bold text-slate-900 mb-1 text-sm">
              ช่วงเดือนที่กำหนดดำเนินการจริง:
            </label>
            <input
              type="text"
              value={targetMonths}
              onChange={(e) => setTargetMonths(e.target.value)}
              placeholder="เช่น ต.ค. 69 - ก.ย. 70 หรือระบุเดือนที่ปฏิบัติงานจริง..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-900 mb-1 text-sm">
              บันทึกผลงาน / รายละเอียดความคืบหน้า:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ระบุผลการดำเนินงานจริง ปัญหาอุปสรรค หรือข้อเสนอแนะ..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white resize-none focus:outline-none"
            />
          </div>

          {/* LINE Checkbox - Pastel Mint */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyLineOnSave}
                onChange={(e) => setNotifyLineOnSave(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 cursor-pointer"
              />
              <div>
                <span className="font-bold text-emerald-950 text-sm block">
                  ส่งข้อความแจ้งเตือนสถานะใหม่ผ่าน LINE OA ทันที
                </span>
                <span className="text-xs text-emerald-800">
                  ส่งแจ้งเตือนการเปลี่ยนสถานะและความก้าวหน้าไปยังผู้บริหารและผู้รับผิดชอบโครงการ
                </span>
              </div>
            </label>
          </div>

          {/* Action buttons: Explicit Close and Save */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-4 h-4 text-slate-500" />
              <span>ปิดหน้าต่าง / ยกเลิก</span>
            </button>

            <button
              type="submit"
              disabled={savedSuccess}
              className="px-6 py-2.5 text-sm sm:text-base font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-98 disabled:bg-emerald-600"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-5 h-5 text-white" />
                  <span>บันทึกสถานะเรียบร้อย!</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 text-emerald-200" />
                  <span>บันทึกผล & เปลี่ยนสถานะ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
