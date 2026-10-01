import React from 'react';
import { Bell, Volume2, VolumeX, Send, Plus } from 'lucide-react';
import { SystemNotification } from '../types';
import { MinimalLogo } from './MinimalLogo';

interface NavbarProps {
  currentTab: 'overview' | 'gantt' | 'table' | 'officers' | 'line-oa';
  setCurrentTab: (tab: 'overview' | 'gantt' | 'table' | 'officers' | 'line-oa') => void;
  notifications: SystemNotification[];
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenLineOA: () => void;
  onOpenNewProject: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  unreadCount,
  onOpenNotifications,
  onOpenLineOA,
  onOpenNewProject,
  soundEnabled,
  setSoundEnabled,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#064E3B] border-b-2 border-emerald-700/60 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Zone 1: Minimal Logo & Brand Header with Bold, Large Typography */}
          <div className="flex items-center gap-3.5 shrink-0">
            <MinimalLogo size="md" />

            <button
              onClick={() => setCurrentTab('overview')}
              className="text-left cursor-pointer focus:outline-none"
            >
              <div className="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-tight flex items-center gap-2.5">
                <span>ระบบติดตามแผนงานโครงการ</span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-900/90 text-emerald-200 border border-emerald-600">
                  ระยะเวลาดำเนินการ
                </span>
              </div>
              <div className="text-xs sm:text-sm text-emerald-200/95 font-medium mt-0.5">
                ปีงบประมาณ พ.ศ. 2570 · โรงพยาบาลบัวลาย & คปสอ. บัวลาย
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links - Green Pastel Theme */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => setCurrentTab('overview')}
              className={`px-3.5 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                currentTab === 'overview'
                  ? 'bg-emerald-900/90 text-emerald-100 border-2 border-emerald-400 shadow-sm'
                  : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              ภาพรวมตามระยะเวลา
            </button>
            <button
              onClick={() => setCurrentTab('gantt')}
              className={`px-3.5 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                currentTab === 'gantt'
                  ? 'bg-emerald-900/90 text-emerald-100 border-2 border-emerald-400 shadow-sm'
                  : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              ไทม์ไลน์รายไตรมาส
            </button>
            <button
              onClick={() => setCurrentTab('table')}
              className={`px-3.5 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                currentTab === 'table'
                  ? 'bg-emerald-900/90 text-emerald-100 border-2 border-emerald-400 shadow-sm'
                  : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              ตารางโครงการ & ระยะเวลา
            </button>
            <button
              onClick={() => setCurrentTab('officers')}
              className={`px-3.5 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                currentTab === 'officers'
                  ? 'bg-emerald-900/90 text-emerald-100 border-2 border-emerald-400 shadow-sm'
                  : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              ผู้รับผิดชอบโครงการ
            </button>
            <button
              onClick={() => setCurrentTab('line-oa')}
              className={`px-3.5 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'line-oa'
                  ? 'bg-emerald-900 text-white border-2 border-emerald-300'
                  : 'text-emerald-200 hover:bg-emerald-800/70 hover:text-white'
              }`}
            >
              <Send className="w-4 h-4 text-emerald-300" />
              <span>แจ้งเตือน LINE OA</span>
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
              className="p-2.5 text-emerald-200 hover:text-white rounded-xl hover:bg-emerald-800/70 transition-colors cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-200" />
              ) : (
                <VolumeX className="w-5 h-5 text-emerald-400/60" />
              )}
            </button>

            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 text-emerald-200 hover:text-white rounded-xl hover:bg-emerald-800/70 transition-colors cursor-pointer"
              title="การแจ้งเตือนแบบเรียลไทม์"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
                </span>
              )}
            </button>

            <button
              onClick={onOpenLineOA}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all cursor-pointer shadow-sm active:scale-98 whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              <span>ส่งแจ้งเตือน LINE</span>
            </button>

            <button
              onClick={onOpenNewProject}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-extrabold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-300 rounded-xl transition-all cursor-pointer shadow-sm active:scale-98 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-emerald-950 stroke-[3]" />
              <span>เพิ่มโครงการ</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-1.5 border-t border-emerald-700/60 scrollbar-none text-xs sm:text-sm font-bold">
          <button
            onClick={() => setCurrentTab('overview')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              currentTab === 'overview' ? 'bg-emerald-900 text-white' : 'text-emerald-100'
            }`}
          >
            ภาพรวม
          </button>
          <button
            onClick={() => setCurrentTab('gantt')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              currentTab === 'gantt' ? 'bg-emerald-900 text-white' : 'text-emerald-100'
            }`}
          >
            ไทม์ไลน์ไตรมาส
          </button>
          <button
            onClick={() => setCurrentTab('table')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              currentTab === 'table' ? 'bg-emerald-900 text-white' : 'text-emerald-100'
            }`}
          >
            ตารางโครงการ
          </button>
          <button
            onClick={() => setCurrentTab('officers')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              currentTab === 'officers' ? 'bg-emerald-900 text-white' : 'text-emerald-100'
            }`}
          >
            ผู้รับผิดชอบ
          </button>
          <button
            onClick={() => setCurrentTab('line-oa')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-emerald-200 font-bold ${
              currentTab === 'line-oa' ? 'bg-emerald-900 text-white' : ''
            }`}
          >
            LINE OA
          </button>
        </div>
      </div>
    </header>
  );
};
