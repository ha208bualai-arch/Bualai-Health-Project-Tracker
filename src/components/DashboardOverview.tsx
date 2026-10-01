import React, { useState, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Send,
  Building,
  ArrowRight,
  TrendingUp,
  FileCheck,
  ChevronRight,
  Sparkles,
  Check,
  Filter,
} from 'lucide-react';
import { ProjectTimelineItem, OrgType, ProjectStatus } from '../types';
import { MinimalLogo } from './MinimalLogo';

interface DashboardOverviewProps {
  projects: ProjectTimelineItem[];
  selectedOrg: 'ALL' | OrgType;
  setSelectedOrg: (org: 'ALL' | OrgType) => void;
  onSelectProjectForUpdate: (project: ProjectTimelineItem) => void;
  onSendLineAlert: (project: ProjectTimelineItem) => void;
  onSendExecutiveDigest: () => void;
  onQuickStatusChange?: (project: ProjectTimelineItem, newStatus: ProjectStatus) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  projects,
  selectedOrg,
  setSelectedOrg,
  onSelectProjectForUpdate,
  onSendLineAlert,
  onSendExecutiveDigest,
  onQuickStatusChange,
}) => {
  const [projectListFilter, setProjectListFilter] = useState<'CURRENT_Q' | 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED'>('CURRENT_Q');

  // Filtered by Organization
  const orgFilteredProjects = useMemo(() => {
    if (selectedOrg === 'ALL') return projects;
    return projects.filter((p) => p.orgType === selectedOrg);
  }, [projects, selectedOrg]);

  // Statistics calculation
  const stats = useMemo(() => {
    let completedCount = 0;
    let inProgressCount = 0;
    let delayedCount = 0;
    let notStartedCount = 0;

    let q1Count = 0;
    let q2Count = 0;
    let q3Count = 0;
    let q4Count = 0;

    orgFilteredProjects.forEach((p) => {
      if (p.status === 'COMPLETED') completedCount++;
      else if (p.status === 'IN_PROGRESS') inProgressCount++;
      else if (p.status === 'DELAYED') delayedCount++;
      else notStartedCount++;

      if (p.quarters.q1) q1Count++;
      if (p.quarters.q2) q2Count++;
      if (p.quarters.q3) q3Count++;
      if (p.quarters.q4) q4Count++;
    });

    const completionRate =
      orgFilteredProjects.length > 0
        ? Math.round((completedCount / orgFilteredProjects.length) * 100)
        : 0;

    return {
      totalProjects: orgFilteredProjects.length,
      completedCount,
      inProgressCount,
      delayedCount,
      notStartedCount,
      completionRate,
      q1Count,
      q2Count,
      q3Count,
      q4Count,
    };
  }, [orgFilteredProjects]);

  // Projects shown in the list below based on filter
  const displayedProjects = useMemo(() => {
    if (projectListFilter === 'CURRENT_Q') {
      return orgFilteredProjects.filter((p) => p.quarters.q1 || p.status === 'DELAYED');
    }
    if (projectListFilter === 'IN_PROGRESS') {
      return orgFilteredProjects.filter((p) => p.status === 'IN_PROGRESS');
    }
    if (projectListFilter === 'COMPLETED') {
      return orgFilteredProjects.filter((p) => p.status === 'COMPLETED');
    }
    if (projectListFilter === 'DELAYED') {
      return orgFilteredProjects.filter((p) => p.status === 'DELAYED');
    }
    return orgFilteredProjects;
  }, [orgFilteredProjects, projectListFilter]);

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
    <div className="space-y-7">
      {/* Real-time Alert Status Bar - Pastel Mint Banner with High-Contrast Typography */}
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3.5 bg-[#064E3B] text-emerald-200 rounded-2xl shrink-0 shadow-sm">
            <Calendar className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-extrabold text-emerald-950 flex flex-wrap items-center gap-2.5">
              <span>ปีงบประมาณ พ.ศ. 2570: ไตรมาส 1 (ตุลาคม - ธันวาคม 2569)</span>
              <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs sm:text-sm font-bold bg-[#064E3B] text-white font-mono shadow-xs">
                ระยะเวลาปัจจุบัน
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-200 text-emerald-950 font-mono">
                {stats.q1Count} โครงการตามแผน
              </span>
            </div>
            <p className="text-sm text-emerald-900 font-semibold mt-1">
              รอบระยะเวลา: ไตรมาส 1 (ต.ค.-ธ.ค. 69) · ไตรมาส 2 (ม.ค.-มี.ค. 70) · ไตรมาส 3 (เม.ย.-มิ.ย. 70) · ไตรมาส 4 (ก.ค.-ก.ย. 70)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={onSendExecutiveDigest}
            className="px-4 py-2.5 text-sm font-bold text-emerald-950 bg-white hover:bg-emerald-100/90 border-2 border-emerald-300 rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-xs active:scale-98"
          >
            <Send className="w-4 h-4 text-emerald-700" />
            <span>ส่งสรุปรายงานผู้บริหารผ่าน LINE</span>
          </button>
        </div>
      </div>

      {/* Header and Org Segmented Control with Minimalist Logo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <MinimalLogo size="lg" />

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              {selectedOrg === 'ALL'
                ? 'ติดตามชื่อโครงการและระยะเวลาดำเนินการ (22 โครงการ)'
                : selectedOrg === 'HOSPITAL'
                ? 'ชื่อโครงการและระยะเวลาดำเนินการ รพ.บัวลาย (12 โครงการ)'
                : 'ชื่อโครงการและระยะเวลาดำเนินการ คปสอ. บัวลาย (10 โครงการ)'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mt-1 font-medium">
              <span className="font-bold text-emerald-900">ปีงบประมาณ พ.ศ. 2570</span>
              <span aria-hidden="true" className="text-emerald-400 font-bold">·</span>
              <span>รพ.บัวลาย & คปสอ. บัวลาย จ.นครราชสีมา</span>
              <span aria-hidden="true" className="text-emerald-400 font-bold">·</span>
              <span className="text-emerald-800 font-bold">แจ้งเตือนเรียลไทม์ & LINE OA</span>
            </div>
          </div>
        </div>

        {/* Org Selector - Green Pastel Theme */}
        <div className="flex items-center gap-1.5 p-1.5 bg-emerald-100/80 rounded-2xl self-start sm:self-auto border-2 border-emerald-300">
          <button
            onClick={() => setSelectedOrg('ALL')}
            className={`px-4 py-2 text-sm font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedOrg === 'ALL'
                ? 'bg-[#064E3B] text-white shadow-sm'
                : 'text-emerald-950 hover:text-black hover:bg-emerald-200/60'
            }`}
          >
            ทั้งหมด (22)
          </button>
          <button
            onClick={() => setSelectedOrg('HOSPITAL')}
            className={`px-4 py-2 text-sm font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedOrg === 'HOSPITAL'
                ? 'bg-[#064E3B] text-white shadow-sm'
                : 'text-emerald-950 hover:text-black hover:bg-emerald-200/60'
            }`}
          >
            🏥 รพ.บัวลาย (12)
          </button>
          <button
            onClick={() => setSelectedOrg('CUP')}
            className={`px-4 py-2 text-sm font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedOrg === 'CUP'
                ? 'bg-[#064E3B] text-white shadow-sm'
                : 'text-emerald-950 hover:text-black hover:bg-emerald-200/60'
            }`}
          >
            🏛️ คปสอ. บัวลาย (10)
          </button>
        </div>
      </div>

      {/* 4 Metric Cards - Pastel Green Accents & Large Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Projects */}
        <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-xs hover:border-emerald-400 transition-colors">
          <div className="flex items-center justify-between text-slate-700 text-sm font-bold">
            <span>โครงการทั้งหมดในแผน 2570</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-950">
              <FileCheck className="w-5 h-5 text-emerald-900" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-950 font-mono tabular-nums">
              {stats.totalProjects}
            </span>
            <span className="text-sm font-bold text-slate-600">โครงการ</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-700 font-semibold">
            <span>รพ.บัวลาย: <strong className="text-emerald-950">12</strong></span>
            <span>·</span>
            <span>คปสอ. บัวลาย: <strong className="text-emerald-950">10</strong></span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-3xl p-6 shadow-xs hover:border-emerald-400 transition-colors">
          <div className="flex items-center justify-between text-emerald-950 text-sm font-bold">
            <span>กำลังดำเนินงานตามระยะเวลา</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-200 flex items-center justify-center text-emerald-900">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-950 font-mono tabular-nums">
              {stats.inProgressCount}
            </span>
            <span className="text-sm font-bold text-emerald-900">โครงการ (ไตรมาส 1)</span>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-200 flex items-center justify-between text-xs sm:text-sm text-emerald-950 font-semibold">
            <span>รอบ ต.ค. - ธ.ค. 2569</span>
            <span className="font-extrabold text-emerald-900">Active</span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-green-50/70 border-2 border-green-300 rounded-3xl p-6 shadow-xs hover:border-green-400 transition-colors">
          <div className="flex items-center justify-between text-green-950 text-sm font-bold">
            <span>ดำเนินการแล้วเสร็จตามแผน</span>
            <div className="w-10 h-10 rounded-xl bg-green-200 flex items-center justify-center text-green-900">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-green-950 font-mono tabular-nums">
              {stats.completedCount}
            </span>
            <span className="text-sm font-bold text-green-900">
              โครงการ ({stats.completionRate}%)
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-green-200 flex items-center justify-between text-xs sm:text-sm text-green-950 font-semibold">
            <span>บรรลุเป้าหมายครบถ้วน</span>
            <span className="font-extrabold font-mono text-green-900">100% Done</span>
          </div>
        </div>

        {/* Delayed / Needs Attention */}
        <div className="bg-amber-50/70 border-2 border-amber-300 rounded-3xl p-6 shadow-xs hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between text-amber-950 text-sm font-bold">
            <span>ล่าช้ากว่าระยะเวลาที่กำหนด</span>
            <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-900">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-amber-950 font-mono tabular-nums">
              {stats.delayedCount}
            </span>
            <span className="text-sm font-bold text-amber-900">โครงการต้องเร่งรัด</span>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200 flex items-center justify-between text-xs sm:text-sm text-amber-950 font-semibold">
            <span>ต้องกำกับติดตาม</span>
            <span className="font-extrabold text-amber-900">เตือน LINE OA</span>
          </div>
        </div>
      </div>

      {/* Fiscal Year 2570 Quarter Timeline Grid */}
      <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-950">
              การกระจายโครงการตามช่วงไตรมาส ปีงบประมาณ พ.ศ. 2570
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              ปีงบประมาณไทย เริ่มต้น 1 ตุลาคม 2569 สิ้นสุด 30 กันยายน 2570
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-300">
            <span className="w-3 h-3 rounded-full bg-emerald-700 animate-pulse"></span>
            <span className="text-sm font-extrabold text-emerald-950">ไตรมาสปัจจุบัน: ตม.1 (ต.ค. - ธ.ค. 69)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {/* Q1 */}
          <div className="p-5 rounded-2xl border-3 border-[#064E3B] bg-emerald-50/90 shadow-sm relative overflow-hidden">
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-xs font-extrabold bg-[#064E3B] text-white">
              ปัจจุบัน
            </div>
            <div className="text-sm font-extrabold text-emerald-950">ไตรมาส 1 (ตม.1)</div>
            <div className="text-xs text-emerald-900 font-bold mt-0.5">ตุลาคม - ธันวาคม 2569</div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold font-mono text-emerald-950">{stats.q1Count}</span>
              <span className="text-sm font-bold text-slate-700">โครงการตามแผน</span>
            </div>
            <div className="w-full bg-emerald-200 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-[#064E3B] h-full rounded-full"
                style={{ width: `${Math.min(100, (stats.q1Count / stats.totalProjects) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Q2 */}
          <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/80">
            <div className="text-sm font-extrabold text-slate-800">ไตรมาส 2 (ตม.2)</div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">มกราคม - มีนาคม 2570</div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold font-mono text-slate-900">{stats.q2Count}</span>
              <span className="text-sm font-bold text-slate-600">โครงการตามแผน</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-slate-700 h-full rounded-full"
                style={{ width: `${Math.min(100, (stats.q2Count / stats.totalProjects) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Q3 */}
          <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/80">
            <div className="text-sm font-extrabold text-slate-800">ไตรมาส 3 (ตม.3)</div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">เมษายน - มิถุนายน 2570</div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold font-mono text-slate-900">{stats.q3Count}</span>
              <span className="text-sm font-bold text-slate-600">โครงการตามแผน</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-slate-700 h-full rounded-full"
                style={{ width: `${Math.min(100, (stats.q3Count / stats.totalProjects) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Q4 */}
          <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/80">
            <div className="text-sm font-extrabold text-slate-800">ไตรมาส 4 (ตม.4)</div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">กรกฎาคม - กันยายน 2570</div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold font-mono text-slate-900">{stats.q4Count}</span>
              <span className="text-sm font-bold text-slate-600">โครงการตามแผน</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-slate-700 h-full rounded-full"
                style={{ width: `${Math.min(100, (stats.q4Count / stats.totalProjects) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Projects List with Filter Tabs & Quick Status Switching */}
      <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 flex flex-wrap items-center gap-3">
              <span>รายการติดตามโครงการตามระยะเวลา</span>
              <span className="px-3 py-1 rounded-xl text-sm font-extrabold bg-emerald-100 text-emerald-950 font-mono border border-emerald-300">
                {displayedProjects.length} โครงการ
              </span>
            </h2>
            <p className="text-sm text-slate-600 font-medium mt-1">
              คลิก <strong>"อัปเดตผล"</strong> เพื่อบันทึกผลงานและเปลี่ยนสถานะ หรือเลือกเปลี่ยนสถานะได้โดยตรง
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setProjectListFilter('CURRENT_Q')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                projectListFilter === 'CURRENT_Q'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-950 hover:bg-emerald-200/60'
              }`}
            >
              ไตรมาส 1 (ปัจจุบัน)
            </button>
            <button
              onClick={() => setProjectListFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                projectListFilter === 'ALL'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-950 hover:bg-emerald-200/60'
              }`}
            >
              ทั้งหมด (22)
            </button>
            <button
              onClick={() => setProjectListFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                projectListFilter === 'IN_PROGRESS'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-950 hover:bg-emerald-200/60'
              }`}
            >
              กำลังดำเนินงาน ({stats.inProgressCount})
            </button>
            <button
              onClick={() => setProjectListFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                projectListFilter === 'COMPLETED'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-950 hover:bg-emerald-200/60'
              }`}
            >
              เสร็จแล้ว ({stats.completedCount})
            </button>
            <button
              onClick={() => setProjectListFilter('DELAYED')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                projectListFilter === 'DELAYED'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-950 hover:bg-amber-200/60'
              }`}
            >
              ล่าช้า ({stats.delayedCount})
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {displayedProjects.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-base font-semibold">
              ไม่พบโครงการในหมวดหมู่ที่เลือก
            </div>
          ) : (
            displayedProjects.map((project) => {
              const badge = statusBadges[project.status] || statusBadges.NOT_STARTED;
              return (
                <div
                  key={project.id}
                  className="py-4.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-emerald-50/40 px-3 rounded-2xl transition-colors"
                >
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold border ${badge.bg} ${badge.text} ${badge.border} shadow-2xs`}
                      >
                        {badge.label}
                      </span>

                      <span className="text-sm font-bold text-slate-700">
                        {project.orgType === 'HOSPITAL' ? '🏥 รพ.บัวลาย' : '🏛️ คปสอ. บัวลาย'}
                      </span>
                      <span className="text-slate-300 font-bold">·</span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-slate-500">{project.code}</span>
                    </div>

                    {/* Project Title - Large & Prominent */}
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-950 leading-snug">
                      {project.title}
                    </h3>

                    {/* Execution Timeline - High Contrast */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-slate-700">
                      <span className="font-extrabold text-emerald-950 flex items-center gap-1.5 bg-emerald-100/90 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>ระยะเวลาดำเนินการ: {project.timelineText}</span>
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-semibold">ช่วงกำหนด: <strong className="text-slate-900">{project.targetMonths}</strong></span>
                      <span className="text-slate-400">·</span>
                      <span className="font-semibold">ผู้รับผิดชอบ: <strong className="text-emerald-950 font-bold">{project.responsiblePerson}</strong></span>
                    </div>
                  </div>

                  {/* Actions & Status Quick Switcher */}
                  <div className="flex flex-wrap items-center gap-3 self-end lg:self-center shrink-0">
                    {/* Quick Status Dropdown Selector */}
                    {onQuickStatusChange && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-600 hidden sm:inline">เปลี่ยนสถานะ:</span>
                        <select
                          value={project.status}
                          onChange={(e) => onQuickStatusChange(project, e.target.value as ProjectStatus)}
                          className="px-2.5 py-1.5 text-xs sm:text-sm font-bold bg-white border-2 border-emerald-300 rounded-xl text-emerald-950 focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer shadow-2xs hover:bg-emerald-50"
                          title="เปลี่ยนสถานะโครงการทันที"
                        >
                          <option value="NOT_STARTED">⏳ รอเริ่มตามแผน</option>
                          <option value="IN_PROGRESS">🔄 กำลังดำเนินการ</option>
                          <option value="COMPLETED">✅ เสร็จสมบูรณ์</option>
                          <option value="DELAYED">⚠️ ล่าช้ากว่ากำหนด</option>
                        </select>
                      </div>
                    )}

                    {/* Progress Bar & Number */}
                    <div className="text-right min-w-[70px]">
                      <div className="text-sm font-extrabold text-slate-900 font-mono">
                        {project.progressPercent}%
                      </div>
                      <div className="w-18 bg-slate-200 rounded-full h-2 overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full transition-all ${
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

                    {/* Update Button */}
                    <button
                      type="button"
                      onClick={() => onSelectProjectForUpdate(project)}
                      className="px-4 py-2 text-xs sm:text-sm font-extrabold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-300 rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                      title="คลิกเพื่ออัปเดตผลงานและเปลี่ยนสถานะโครงการ"
                    >
                      อัปเดตผล
                    </button>

                    {/* LINE Alert Button */}
                    <button
                      type="button"
                      onClick={() => onSendLineAlert(project)}
                      className="px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                      title="ส่งแจ้งเตือน LINE OA ตามระยะเวลา"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>เตือน LINE</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
