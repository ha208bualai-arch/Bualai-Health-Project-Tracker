import React, { useState, useMemo } from 'react';
import { Search, Calendar, Clock, Send } from 'lucide-react';
import { ProjectTimelineItem, OrgType, ProjectStatus } from '../types';

interface GanttTimelineViewProps {
  projects: ProjectTimelineItem[];
  selectedOrg: 'ALL' | OrgType;
  setSelectedOrg: (org: 'ALL' | OrgType) => void;
  onSelectProjectForUpdate: (project: ProjectTimelineItem) => void;
  onSendLineAlert: (project: ProjectTimelineItem) => void;
  onQuickStatusChange?: (project: ProjectTimelineItem, newStatus: ProjectStatus) => void;
}

export const GanttTimelineView: React.FC<GanttTimelineViewProps> = ({
  projects,
  selectedOrg,
  setSelectedOrg,
  onSelectProjectForUpdate,
  onSendLineAlert,
  onQuickStatusChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProjectStatus>('ALL');

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => (selectedOrg === 'ALL' ? true : p.orgType === selectedOrg))
      .filter((p) => (statusFilter === 'ALL' ? true : p.status === statusFilter))
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.timelineText.toLowerCase().includes(q) ||
          p.targetMonths.toLowerCase().includes(q) ||
          p.responsiblePerson.toLowerCase().includes(q)
        );
      });
  }, [projects, selectedOrg, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            ไทม์ไลน์และกำหนดการดำเนินโครงการ (Quarterly Timeline View)
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">
            แผนปฏิบัติการประจำปีงบประมาณ พ.ศ. 2570 จำแนกตาม 4 ไตรมาส (ต.ค. 69 - ก.ย. 70)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Org filter */}
          <div className="flex items-center gap-1 p-1 bg-emerald-100/70 rounded-xl text-xs sm:text-sm font-bold border border-emerald-300">
            <button
              onClick={() => setSelectedOrg('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                selectedOrg === 'ALL' ? 'bg-[#064E3B] text-white shadow-xs' : 'text-emerald-950 hover:bg-emerald-200/60'
              }`}
            >
              ทั้งหมด (22)
            </button>
            <button
              onClick={() => setSelectedOrg('HOSPITAL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                selectedOrg === 'HOSPITAL' ? 'bg-[#064E3B] text-white shadow-xs' : 'text-emerald-950 hover:bg-emerald-200/60'
              }`}
            >
              รพ.บัวลาย (12)
            </button>
            <button
              onClick={() => setSelectedOrg('CUP')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                selectedOrg === 'CUP' ? 'bg-[#064E3B] text-white shadow-xs' : 'text-emerald-950 hover:bg-emerald-200/60'
              }`}
            >
              คปสอ. บัวลาย (10)
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ProjectStatus)}
            className="px-3 py-1.5 text-xs sm:text-sm font-bold bg-white border-2 border-emerald-300 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="IN_PROGRESS">🔄 กำลังดำเนินการ</option>
            <option value="COMPLETED">✅ ดำเนินการแล้วเสร็จ</option>
            <option value="DELAYED">⚠️ ล่าช้ากว่ากำหนด</option>
            <option value="NOT_STARTED">⏳ รอเริ่มตามแผน</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาชื่อโครงการ, ระยะเวลา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs sm:text-sm font-medium bg-white border-2 border-emerald-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-600 w-48 sm:w-64 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Timeline Gantt Grid Container */}
      <div className="bg-white border-2 border-emerald-200 rounded-3xl overflow-hidden shadow-2xs">
        {/* Timeline Header Quarters */}
        <div className="grid grid-cols-12 border-b-2 border-emerald-200 bg-emerald-50/80 text-sm font-extrabold text-slate-800 p-4 items-center">
          <div className="col-span-12 lg:col-span-5 text-base font-extrabold text-emerald-950">
            ชื่อโครงการ & ระยะเวลาดำเนินการ (ปีงบ 2570)
          </div>
          <div className="col-span-12 lg:col-span-7 grid grid-cols-4 gap-2.5 text-center pt-2 lg:pt-0">
            <div className="p-2 rounded-xl bg-emerald-200/90 border-2 border-[#064E3B] text-emerald-950 font-extrabold">
              ไตรมาส 1 <span className="font-bold block text-xs text-emerald-900">ต.ค. - ธ.ค. 69 [ปัจจุบัน]</span>
            </div>
            <div className="p-2 rounded-xl bg-white border-2 border-slate-200 text-slate-800 font-extrabold">
              ไตรมาส 2 <span className="font-medium block text-xs text-slate-500">ม.ค. - มี.ค. 70</span>
            </div>
            <div className="p-2 rounded-xl bg-white border-2 border-slate-200 text-slate-800 font-extrabold">
              ไตรมาส 3 <span className="font-medium block text-xs text-slate-500">เม.ย. - มิ.ย. 70</span>
            </div>
            <div className="p-2 rounded-xl bg-white border-2 border-slate-200 text-slate-800 font-extrabold">
              ไตรมาส 4 <span className="font-medium block text-xs text-slate-500">ก.ค. - ก.ย. 70</span>
            </div>
          </div>
        </div>

        {/* Project Rows */}
        <div className="divide-y divide-emerald-100">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-14 text-slate-500 text-base font-semibold">
              ไม่พบข้อมูลโครงการตามเงื่อนไขที่ค้นหา
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="grid grid-cols-12 items-center gap-4 p-5 hover:bg-emerald-50/50 transition-colors"
              >
                {/* Left: Project Name and Timeline text */}
                <div className="col-span-12 lg:col-span-5 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-extrabold border ${
                        project.orgType === 'HOSPITAL'
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                          : 'bg-teal-100 text-teal-950 border-teal-300'
                      }`}
                    >
                      {project.orgType === 'HOSPITAL' ? '🏥 รพ.บัวลาย' : '🏛️ คปสอ.'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {project.code}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-slate-950 leading-snug">
                    {project.title}
                  </h3>

                  <div className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>ระยะเวลาดำเนินการ: {project.timelineText}</span>
                  </div>

                  {/* Actions & Status Quick Switcher */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm text-slate-600">
                    <span>ผู้รับผิดชอบ: <strong className="text-slate-900 font-bold">{project.responsiblePerson}</strong></span>
                    <span className="text-slate-300 font-bold">·</span>

                    {/* Quick Status Dropdown */}
                    {onQuickStatusChange && (
                      <select
                        value={project.status}
                        onChange={(e) => onQuickStatusChange(project, e.target.value as ProjectStatus)}
                        className="text-xs font-bold px-2 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-950 cursor-pointer shadow-2xs hover:bg-emerald-50"
                        title="เปลี่ยนสถานะโครงการทันที"
                      >
                        <option value="NOT_STARTED">⏳ รอเริ่มตามแผน</option>
                        <option value="IN_PROGRESS">🔄 กำลังดำเนินการ</option>
                        <option value="COMPLETED">✅ เสร็จสมบูรณ์</option>
                        <option value="DELAYED">⚠️ ล่าช้ากว่ากำหนด</option>
                      </select>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectProjectForUpdate(project)}
                      className="px-3 py-1 text-xs font-extrabold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg cursor-pointer transition-all shadow-2xs active:scale-98"
                      title="คลิกเพื่ออัปเดตผลงานและสถานะตามระยะเวลา"
                    >
                      อัปเดตผล
                    </button>
                    <button
                      type="button"
                      onClick={() => onSendLineAlert(project)}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>เตือน LINE</span>
                    </button>
                  </div>
                </div>

                {/* Right: Gantt Bars across Quarters */}
                <div className="col-span-12 lg:col-span-7 grid grid-cols-4 gap-2.5 pt-2 lg:pt-0">
                  {/* Q1: Oct - Dec (Current) */}
                  <div className="h-12 rounded-xl border-2 border-emerald-400 bg-emerald-50 flex flex-col justify-center px-2 shadow-2xs">
                    {project.quarters.q1 ? (
                      <div
                        className={`h-8 rounded-lg flex items-center justify-center px-2.5 text-xs font-extrabold text-white shadow-xs ${
                          project.status === 'COMPLETED'
                            ? 'bg-green-600'
                            : 'bg-[#064E3B]'
                        }`}
                      >
                        {project.status === 'COMPLETED' ? '✓ สำเร็จแล้ว' : 'ตม.1 [ดำเนินการ]'}
                      </div>
                    ) : (
                      <div className="text-center text-slate-300 font-mono text-sm font-bold">-</div>
                    )}
                  </div>

                  {/* Q2: Jan - Mar */}
                  <div className="h-12 rounded-xl border-2 border-slate-200 bg-white flex flex-col justify-center px-2">
                    {project.quarters.q2 ? (
                      <div
                        className={`h-8 rounded-lg flex items-center justify-center px-2.5 text-xs font-extrabold text-white shadow-xs ${
                          project.status === 'COMPLETED'
                            ? 'bg-green-600'
                            : project.status === 'DELAYED'
                            ? 'bg-amber-600'
                            : 'bg-slate-600'
                        }`}
                      >
                        ตม.2
                      </div>
                    ) : (
                      <div className="text-center text-slate-300 font-mono text-sm font-bold">-</div>
                    )}
                  </div>

                  {/* Q3: Apr - Jun */}
                  <div className="h-12 rounded-xl border-2 border-slate-200 bg-white flex flex-col justify-center px-2">
                    {project.quarters.q3 ? (
                      <div
                        className={`h-8 rounded-lg flex items-center justify-center px-2.5 text-xs font-extrabold text-white shadow-xs ${
                          project.status === 'COMPLETED' ? 'bg-green-600' : 'bg-slate-600'
                        }`}
                      >
                        ตม.3
                      </div>
                    ) : (
                      <div className="text-center text-slate-300 font-mono text-sm font-bold">-</div>
                    )}
                  </div>

                  {/* Q4: Jul - Sep */}
                  <div className="h-12 rounded-xl border-2 border-slate-200 bg-white flex flex-col justify-center px-2">
                    {project.quarters.q4 ? (
                      <div
                        className={`h-8 rounded-lg flex items-center justify-center px-2.5 text-xs font-extrabold text-white shadow-xs ${
                          project.status === 'COMPLETED' ? 'bg-green-600' : 'bg-slate-600'
                        }`}
                      >
                        ตม.4
                      </div>
                    ) : (
                      <div className="text-center text-slate-300 font-mono text-sm font-bold">-</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
