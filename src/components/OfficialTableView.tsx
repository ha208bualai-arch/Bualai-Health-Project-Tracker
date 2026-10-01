import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Printer,
  Send,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { ProjectTimelineItem, OrgType, ProjectStatus } from '../types';

interface ProjectTimelineTableProps {
  projects: ProjectTimelineItem[];
  selectedOrg: 'ALL' | OrgType;
  setSelectedOrg: (org: 'ALL' | OrgType) => void;
  onSelectProjectForUpdate: (project: ProjectTimelineItem) => void;
  onSendLineAlert: (project: ProjectTimelineItem) => void;
  onQuickStatusChange?: (project: ProjectTimelineItem, newStatus: ProjectStatus) => void;
}

export const OfficialTableView: React.FC<ProjectTimelineTableProps> = ({
  projects,
  selectedOrg,
  setSelectedOrg,
  onSelectProjectForUpdate,
  onSendLineAlert,
  onQuickStatusChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState<'ALL' | 'q1' | 'q2' | 'q3' | 'q4'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProjectStatus>('ALL');

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => (selectedOrg === 'ALL' ? true : p.orgType === selectedOrg))
      .filter((p) => (statusFilter === 'ALL' ? true : p.status === statusFilter))
      .filter((p) => (selectedQuarter === 'ALL' ? true : p.quarters[selectedQuarter]))
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.timelineText.toLowerCase().includes(q) ||
          p.targetMonths.toLowerCase().includes(q) ||
          p.responsiblePerson.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q)
        );
      });
  }, [projects, selectedOrg, statusFilter, selectedQuarter, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ลำดับ',
      'หน่วยงาน',
      'รหัสโครงการ',
      'ชื่อโครงการ',
      'ระยะเวลาดำเนินการ',
      'ช่วงเดือนที่กำหนด',
      'ตม.1(ต.ค.-ธ.ค.69)',
      'ตม.2(ม.ค.-มี.ค.70)',
      'ตม.3(เม.ย.-มิ.ย.70)',
      'ตม.4(ก.ค.-ก.ย.70)',
      'ผู้รับผิดชอบโครงการ',
      'ความคืบหน้า(%)',
      'สถานะ',
    ];

    const rows = filteredProjects.map((p, idx) => [
      String(idx + 1),
      p.orgType === 'HOSPITAL' ? 'รพ.บัวลาย' : 'คปสอ. บัวลาย',
      p.code,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.timelineText.replace(/"/g, '""')}"`,
      `"${p.targetMonths.replace(/"/g, '""')}"`,
      p.quarters.q1 ? 'ดำเนินการ' : '-',
      p.quarters.q2 ? 'ดำเนินการ' : '-',
      p.quarters.q3 ? 'ดำเนินการ' : '-',
      p.quarters.q4 ? 'ดำเนินการ' : '-',
      `"${p.responsiblePerson}"`,
      String(p.progressPercent),
      p.status,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bualai_project_timeline_2570_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusBadges: Record<ProjectStatus, { label: string; bg: string; text: string; border: string }> = {
    NOT_STARTED: {
      label: '⏳ รอเริ่มตามแผน',
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      border: 'border-slate-300',
    },
    IN_PROGRESS: {
      label: '🔄 กำลังดำเนินการ',
      bg: 'bg-emerald-100',
      text: 'text-emerald-950 font-bold',
      border: 'border-emerald-300',
    },
    COMPLETED: {
      label: '✅ สำเร็จแล้ว',
      bg: 'bg-green-100',
      text: 'text-green-950 font-bold',
      border: 'border-green-400',
    },
    DELAYED: {
      label: '⚠️ ล่าช้ากว่ากำหนด',
      bg: 'bg-amber-100',
      text: 'text-amber-950 font-bold',
      border: 'border-amber-300',
    },
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            ตารางติดตามชื่อโครงการและระยะเวลาดำเนินการ (ปีงบประมาณ พ.ศ. 2570)
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">
            รอบระยะเวลาตามปีงบประมาณไทย: ตม.1 (ต.ค.-ธ.ค. 69) · ตม.2 (ม.ค.-มี.ค. 70) · ตม.3 (เม.ย.-มิ.ย. 70) · ตม.4 (ก.ค.-ก.ย. 70)
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-sm font-bold text-emerald-950 bg-white border-2 border-emerald-300 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>ส่งออก CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>พิมพ์</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar - Green Pastel Theme */}
      <div className="p-4 bg-white border-2 border-emerald-200 rounded-2xl flex flex-wrap items-center gap-3.5 shadow-2xs">
        {/* Org filter */}
        <div className="flex items-center gap-1 p-1 bg-emerald-100/70 rounded-xl text-xs sm:text-sm font-bold border border-emerald-300">
          <button
            onClick={() => setSelectedOrg('ALL')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedOrg === 'ALL' ? 'bg-[#064E3B] text-white shadow-xs' : 'text-emerald-950 hover:bg-emerald-200/60'
            }`}
          >
            ทั้งหมด (22)
          </button>
          <button
            onClick={() => setSelectedOrg('HOSPITAL')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedOrg === 'HOSPITAL' ? 'bg-[#064E3B] text-white shadow-xs' : 'text-emerald-950 hover:bg-emerald-200/60'
            }`}
          >
            รพ.บัวลาย (12)
          </button>
          <button
            onClick={() => setSelectedOrg('CUP')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedOrg === 'CUP' ? 'bg-[#064E3B] text-white shadow-xs' : 'text-emerald-950 hover:bg-emerald-200/60'
            }`}
          >
            คปสอ. บัวลาย (10)
          </button>
        </div>

        {/* Quarter Filter with Fiscal Date Ranges */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
          <span className="text-slate-700">ไตรมาส:</span>
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value as 'ALL' | 'q1' | 'q2' | 'q3' | 'q4')}
            className="px-3 py-1.5 bg-slate-50 border-2 border-emerald-300 rounded-xl text-emerald-950 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
          >
            <option value="ALL">ทุกไตรมาส (ปีงบ 2570)</option>
            <option value="q1">ตม.1 (ต.ค. - ธ.ค. 69) [ปัจจุบัน]</option>
            <option value="q2">ตม.2 (ม.ค. - มี.ค. 70)</option>
            <option value="q3">ตม.3 (เม.ย. - มิ.ย. 70)</option>
            <option value="q4">ตม.4 (ก.ค. - ก.ย. 70)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
          <span className="text-slate-700">สถานะ:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ProjectStatus)}
            className="px-3 py-1.5 bg-slate-50 border-2 border-emerald-300 rounded-xl text-emerald-950 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="IN_PROGRESS">🔄 กำลังดำเนินการ</option>
            <option value="COMPLETED">✅ เสร็จสมบูรณ์</option>
            <option value="DELAYED">⚠️ ล่าช้ากว่ากำหนด</option>
            <option value="NOT_STARTED">⏳ รอเริ่มตามแผน</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อโครงการ, ผู้รับผิดชอบ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3.5 py-1.5 text-xs sm:text-sm font-medium bg-slate-50 border-2 border-emerald-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Focused Table: Project Name & Execution Timeline */}
      <div className="bg-white border-2 border-emerald-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-[#064E3B] text-white font-extrabold border-b-2 border-emerald-800">
                <th className="p-3.5 w-12 text-center border-r border-emerald-700/60">#</th>
                <th className="p-3.5 w-32 border-r border-emerald-700/60">หน่วยงาน</th>
                <th className="p-3.5 min-w-[300px] border-r border-emerald-700/60">
                  ชื่อโครงการ
                </th>
                <th className="p-3.5 min-w-[240px] border-r border-emerald-700/60">
                  ระยะเวลาดำเนินการ
                </th>
                <th className="p-3.5 w-44 text-center border-r border-emerald-700/60">
                  ไตรมาส (ปีงบ 2570)
                </th>
                <th className="p-3.5 w-40 border-r border-emerald-700/60">ผู้รับผิดชอบ</th>
                <th className="p-3.5 min-w-[170px] border-r border-emerald-700/60">สถานะความก้าวหน้า</th>
                <th className="p-3.5 w-44 text-center bg-emerald-800 text-white font-extrabold">
                  จัดการ & เปลี่ยนสถานะ
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-emerald-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500 text-base font-semibold">
                    ไม่พบข้อมูลโครงการตามเงื่อนไขที่กำหนด
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project, idx) => {
                  const badge = statusBadges[project.status] || statusBadges.NOT_STARTED;
                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-emerald-50/50 transition-colors divide-x divide-emerald-100"
                    >
                      {/* Index */}
                      <td className="p-3.5 text-center text-slate-400 font-mono font-bold text-sm">
                        {idx + 1}
                      </td>

                      {/* Organization */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
                            project.orgType === 'HOSPITAL'
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                              : 'bg-teal-100 text-teal-950 border-teal-300'
                          }`}
                        >
                          {project.orgType === 'HOSPITAL' ? '🏥 รพ.บัวลาย' : '🏛️ คปสอ.'}
                        </span>
                        <div className="text-xs font-mono font-bold text-slate-400 mt-1">
                          {project.code}
                        </div>
                      </td>

                      {/* Project Title - Large & Prominent */}
                      <td className="p-3.5 font-extrabold text-slate-950 text-sm sm:text-base leading-snug">
                        <div>{project.title}</div>
                        {project.notes && (
                          <div className="mt-1 text-xs font-normal text-emerald-900 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                            <strong>บันทึก:</strong> {project.notes}
                          </div>
                        )}
                      </td>

                      {/* Execution Timeline */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-extrabold text-emerald-950 text-sm sm:text-base">
                          <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{project.timelineText}</span>
                        </div>
                        <div className="text-xs text-slate-600 font-semibold mt-1">
                          ช่วงเดือน: <span className="text-slate-900 font-bold">{project.targetMonths}</span>
                        </div>
                      </td>

                      {/* Quarters (Thai Fiscal Year 2570) */}
                      <td className="p-3.5 text-center">
                        <div className="grid grid-cols-4 gap-1 text-xs font-mono font-bold">
                          <span
                            className={`py-1 rounded-md text-center ${
                              project.quarters.q1
                                ? 'bg-[#064E3B] text-white font-extrabold'
                                : 'text-slate-300'
                            }`}
                            title="ไตรมาส 1: ต.ค. - ธ.ค. 69 [ปัจจุบัน]"
                          >
                            ตม.1
                          </span>
                          <span
                            className={`py-1 rounded-md text-center ${
                              project.quarters.q2
                                ? 'bg-slate-200 text-slate-800 font-extrabold'
                                : 'text-slate-300'
                            }`}
                            title="ไตรมาส 2: ม.ค. - มี.ค. 70"
                          >
                            ตม.2
                          </span>
                          <span
                            className={`py-1 rounded-md text-center ${
                              project.quarters.q3
                                ? 'bg-slate-200 text-slate-800 font-extrabold'
                                : 'text-slate-300'
                            }`}
                            title="ไตรมาส 3: เม.ย. - มิ.ย. 70"
                          >
                            ตม.3
                          </span>
                          <span
                            className={`py-1 rounded-md text-center ${
                              project.quarters.q4
                                ? 'bg-slate-200 text-slate-800 font-extrabold'
                                : 'text-slate-300'
                            }`}
                            title="ไตรมาส 4: ก.ค. - ก.ย. 70"
                          >
                            ตม.4
                          </span>
                        </div>
                      </td>

                      {/* Responsible Person */}
                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-950 text-sm">
                          {project.responsiblePerson}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {project.department}
                        </div>
                      </td>

                      {/* Status & Progress */}
                      <td className="p-3.5">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-extrabold border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.label}
                            </span>
                            <span className="font-mono text-sm font-extrabold text-slate-900">
                              {project.progressPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                project.status === 'COMPLETED'
                                  ? 'bg-green-600'
                                  : project.status === 'DELAYED'
                                  ? 'bg-amber-600'
                                  : 'bg-emerald-700'
                              }`}
                              style={{ width: `${project.progressPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Action & Direct Status Switching */}
                      <td className="p-3.5 text-center bg-emerald-50/30">
                        <div className="flex flex-col gap-1.5 items-center">
                          {/* Quick Status Dropdown */}
                          {onQuickStatusChange && (
                            <select
                              value={project.status}
                              onChange={(e) => onQuickStatusChange(project, e.target.value as ProjectStatus)}
                              className="w-full text-xs font-bold p-1 bg-white border border-emerald-300 rounded-lg text-emerald-950 cursor-pointer shadow-2xs hover:bg-emerald-50"
                              title="เปลี่ยนสถานะโครงการทันที"
                            >
                              <option value="NOT_STARTED">⏳ รอเริ่มตามแผน</option>
                              <option value="IN_PROGRESS">🔄 กำลังดำเนินการ</option>
                              <option value="COMPLETED">✅ เสร็จสมบูรณ์</option>
                              <option value="DELAYED">⚠️ ล่าช้ากว่ากำหนด</option>
                            </select>
                          )}

                          <div className="flex items-center justify-center gap-1.5 w-full">
                            <button
                              type="button"
                              onClick={() => onSelectProjectForUpdate(project)}
                              className="flex-1 py-1.5 px-2 text-xs font-extrabold text-emerald-950 bg-emerald-100 border border-emerald-300 rounded-lg hover:bg-emerald-200 cursor-pointer transition-all shadow-2xs active:scale-98"
                              title="คลิกเพื่อเปิดหน้าต่างอัปเดตผลงานและสถานะ"
                            >
                              อัปเดตผล
                            </button>
                            <button
                              type="button"
                              onClick={() => onSendLineAlert(project)}
                              className="py-1.5 px-2.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                              title="ส่งแจ้งเตือน LINE OA ตามระยะเวลา"
                            >
                              <Send className="w-3 h-3" />
                              <span>เตือน</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
