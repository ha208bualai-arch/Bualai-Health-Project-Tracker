import React, { useState } from 'react';
import { X, Plus, Save, Clock } from 'lucide-react';
import { ProjectTimelineItem, OrgType } from '../types';
import { soundEffects } from '../utils/audio';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newProject: ProjectTimelineItem) => void;
  responsiblePersons: string[];
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  responsiblePersons,
}) => {
  const [orgType, setOrgType] = useState<OrgType>('HOSPITAL');
  const [title, setTitle] = useState('');
  const [timelineText, setTimelineText] = useState('ไตรมาส 2 (มกราคม - มีนาคม 2570)');
  const [targetMonths, setTargetMonths] = useState('กุมภาพันธ์ - มีนาคม 2570');
  const [responsiblePerson, setResponsiblePerson] = useState(responsiblePersons[0] || 'น.ส.กัญญมน บุญเหลือ');
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(true);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const projectId = `${orgType.toLowerCase()}-${Date.now()}`;

    const newProject: ProjectTimelineItem = {
      id: projectId,
      code: `${orgType === 'HOSPITAL' ? 'HOSP' : 'CUP'}-69-${Math.floor(10 + Math.random() * 89)}`,
      orgType,
      title: title.trim(),
      timelineText: timelineText.trim(),
      targetMonths: targetMonths.trim(),
      quarters: {
        q1,
        q2,
        q3,
        q4,
      },
      status: 'NOT_STARTED',
      progressPercent: 0,
      responsiblePerson,
      fiscalYear: 2570,
    };

    onSave(newProject);
    soundEffects.playChime('success');
    onClose();
  };

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
        className="bg-white border-2 border-emerald-600/30 rounded-3xl w-full max-w-xl my-4 overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Deep Emerald Green with Pastel Mint */}
        <div className="px-6 py-5 border-b border-emerald-900/40 flex items-center justify-between bg-[#064E3B] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-800/90 border border-emerald-600 flex items-center justify-center text-emerald-200">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
              เพิ่มชื่อโครงการและระยะเวลาดำเนินการ
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-bold text-emerald-100 hover:text-white rounded-xl hover:bg-emerald-900/80 border border-emerald-700/60 transition-colors cursor-pointer flex items-center gap-1"
            title="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
            <span>ปิด</span>
          </button>
        </div>

        {/* Form Body - Larger Typography */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 text-sm">
          {/* Org Selector */}
          <div>
            <label className="block font-bold text-slate-950 mb-1.5 text-sm sm:text-base">
              สังกัดหน่วยงาน:
            </label>
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setOrgType('HOSPITAL')}
                className={`p-3.5 rounded-2xl border-2 font-extrabold text-sm sm:text-base text-center transition-all cursor-pointer ${
                  orgType === 'HOSPITAL'
                    ? 'border-[#064E3B] bg-emerald-100 text-emerald-950 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-emerald-50/50'
                }`}
              >
                🏥 โรงพยาบาลบัวลาย
              </button>
              <button
                type="button"
                onClick={() => setOrgType('CUP')}
                className={`p-3.5 rounded-2xl border-2 font-extrabold text-sm sm:text-base text-center transition-all cursor-pointer ${
                  orgType === 'CUP'
                    ? 'border-[#064E3B] bg-teal-100 text-teal-950 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-teal-50/50'
                }`}
              >
                🏛️ คปสอ. บัวลาย
              </button>
            </div>
          </div>

          {/* Project Title */}
          <div>
            <label className="block font-bold text-slate-950 mb-1.5 text-sm sm:text-base">
              ชื่อโครงการ: <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุชื่อโครงการ เช่น โครงการบำบัดฟื้นฟูผู้ใช้ยาเสพติด..."
              className="w-full p-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 text-sm sm:text-base font-semibold focus:ring-2 focus:ring-emerald-600 focus:bg-white resize-none focus:outline-none"
            />
          </div>

          {/* Timeline Text */}
          <div>
            <label className="block font-bold text-slate-950 mb-1.5 text-sm sm:text-base">
              ระยะเวลาดำเนินการ (รอบไตรมาส):
            </label>
            <input
              type="text"
              required
              value={timelineText}
              onChange={(e) => setTimelineText(e.target.value)}
              placeholder="เช่น ไตรมาส 1 (ตุลาคม - ธันวาคม 2569)"
              className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Target Months */}
          <div>
            <label className="block font-bold text-slate-950 mb-1.5 text-sm sm:text-base">
              ช่วงเดือนที่กำหนดดำเนินการ:
            </label>
            <input
              type="text"
              required
              value={targetMonths}
              onChange={(e) => setTargetMonths(e.target.value)}
              placeholder="เช่น พฤศจิกายน 2569"
              className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Quarters checkboxes */}
          <div>
            <label className="block font-bold text-slate-950 mb-1.5 text-sm sm:text-base">
              ไตรมาสที่ดำเนินการ (ปีงบ 2570):
            </label>
            <div className="grid grid-cols-4 gap-2.5 text-sm font-bold">
              <label className="flex items-center gap-2 p-3 rounded-xl border-2 border-emerald-200 cursor-pointer hover:bg-emerald-50">
                <input
                  type="checkbox"
                  checked={q1}
                  onChange={(e) => setQ1(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                />
                <span className="text-slate-800">ตม.1</span>
              </label>
              <label className="flex items-center gap-2 p-3 rounded-xl border-2 border-emerald-200 cursor-pointer hover:bg-emerald-50">
                <input
                  type="checkbox"
                  checked={q2}
                  onChange={(e) => setQ2(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                />
                <span className="text-slate-800">ตม.2</span>
              </label>
              <label className="flex items-center gap-2 p-3 rounded-xl border-2 border-emerald-200 cursor-pointer hover:bg-emerald-50">
                <input
                  type="checkbox"
                  checked={q3}
                  onChange={(e) => setQ3(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                />
                <span className="text-slate-800">ตม.3</span>
              </label>
              <label className="flex items-center gap-2 p-3 rounded-xl border-2 border-emerald-200 cursor-pointer hover:bg-emerald-50">
                <input
                  type="checkbox"
                  checked={q4}
                  onChange={(e) => setQ4(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                />
                <span className="text-slate-800">ตม.4</span>
              </label>
            </div>
          </div>

          {/* Responsible Person */}
          <div>
            <label className="block font-bold text-slate-950 mb-1.5 text-sm sm:text-base">
              ผู้รับผิดชอบโครงการ:
            </label>
            <select
              value={responsiblePerson}
              onChange={(e) => setResponsiblePerson(e.target.value)}
              className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 text-sm font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              {responsiblePersons.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-4 h-4 text-slate-500" />
              <span>ปิด / ยกเลิก</span>
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm sm:text-base font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-98"
            >
              <Save className="w-4 h-4 text-emerald-200" />
              <span>บันทึกโครงการ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
