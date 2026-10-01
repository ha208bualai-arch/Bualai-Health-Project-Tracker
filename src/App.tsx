import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { GanttTimelineView } from './components/GanttTimelineView';
import { OfficialTableView } from './components/OfficialTableView';
import { OfficersDirectoryView } from './components/OfficersDirectoryView';
import { LineOAManagerModal } from './components/LineOAManagerModal';
import { ActivityUpdateModal } from './components/ActivityUpdateModal';
import { NewProjectModal } from './components/NewProjectModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import {
  ProjectTimelineItem,
  ProjectStatus,
  OfficerProfile,
  SystemNotification,
  LineBotConfig,
  OrgType,
} from './types';
import {
  INITIAL_PROJECTS,
  INITIAL_OFFICERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_LINE_CONFIG,
} from './data/initialData';
import { soundEffects } from './utils/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'overview' | 'gantt' | 'table' | 'officers' | 'line-oa'
  >('overview');

  const [selectedOrg, setSelectedOrg] = useState<'ALL' | OrgType>('ALL');

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('bualai_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [projects, setProjects] = useState<ProjectTimelineItem[]>(() => {
    const saved = localStorage.getItem('bualai_projects_timeline_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_PROJECTS;
  });

  const [officers] = useState<OfficerProfile[]>(INITIAL_OFFICERS);

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('bualai_notifications_timeline_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [lineConfig, setLineConfig] = useState<LineBotConfig>(() => {
    const saved = localStorage.getItem('bualai_line_config_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_LINE_CONFIG;
  });

  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isLineOAModalOpen, setIsLineOAModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectTimelineItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [linePreselectedOfficer, setLinePreselectedOfficer] = useState<OfficerProfile | null>(null);
  const [linePreselectedProject, setLinePreselectedProject] = useState<ProjectTimelineItem | null>(null);

  useEffect(() => {
    localStorage.setItem('bualai_projects_timeline_v2', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('bualai_notifications_timeline_v2', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('bualai_sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('bualai_line_config_v2', JSON.stringify(lineConfig));
  }, [lineConfig]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const responsiblePersonsList = useMemo(() => {
    return officers.filter((o) => !o.isExecutive).map((o) => o.name);
  }, [officers]);

  const handleAddNewNotification = useCallback(
    (notif: SystemNotification) => {
      setNotifications((prev) => [notif, ...prev]);
      if (soundEnabled) {
        soundEffects.playChime(notif.type === 'ALERT' ? 'alert' : notif.type === 'SUCCESS' ? 'success' : 'info');
      }
    },
    [soundEnabled]
  );

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSaveProjectUpdate = (updatedProject: ProjectTimelineItem) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
    setEditingProject(null); // Ensure modal is closed immediately

    const statusLabel =
      updatedProject.status === 'COMPLETED'
        ? 'เสร็จสมบูรณ์'
        : updatedProject.status === 'IN_PROGRESS'
        ? 'กำลังดำเนินการ'
        : updatedProject.status === 'DELAYED'
        ? 'ล่าช้ากว่ากำหนด'
        : 'รอเริ่มตามแผน';

    setToastMessage(`✓ เปลี่ยนสถานะเป็น "${statusLabel}" และบันทึกผลงานโครงการเรียบร้อยแล้ว`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);

    handleAddNewNotification({
      id: `notif-${Date.now()}`,
      timestamp: 'เมื่อสักครู่',
      title: `📝 อัปเดตผลงานโครงการ: ${updatedProject.title}`,
      message: `ปรับปรุงสถานะเป็น "${statusLabel}" ความก้าวหน้า ${updatedProject.progressPercent}% ตามระยะเวลา: ${updatedProject.timelineText}`,
      type: 'INFO',
      projectId: updatedProject.id,
      targetRecipient: updatedProject.responsiblePerson,
      recipientRole: 'OFFICER',
      read: false,
      sentToLine: true,
    });
  };

  const handleQuickStatusChange = (project: ProjectTimelineItem, newStatus: ProjectStatus) => {
    let newPct = project.progressPercent;
    if (newStatus === 'COMPLETED') newPct = 100;
    else if (newStatus === 'NOT_STARTED') newPct = 0;
    else if (newStatus === 'IN_PROGRESS' && newPct === 0) newPct = 50;

    const updated: ProjectTimelineItem = {
      ...project,
      status: newStatus,
      progressPercent: newPct,
    };

    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? updated : p))
    );

    const statusLabel =
      newStatus === 'COMPLETED'
        ? 'เสร็จสมบูรณ์'
        : newStatus === 'IN_PROGRESS'
        ? 'กำลังดำเนินการ'
        : newStatus === 'DELAYED'
        ? 'ล่าช้ากว่ากำหนด'
        : 'รอเริ่มตามแผน';

    setToastMessage(`✓ เปลี่ยนสถานะโครงการ "${project.title}" เป็น "${statusLabel}" เรียบร้อยแล้ว`);
    soundEffects.playChime('success');
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);

    handleAddNewNotification({
      id: `notif-${Date.now()}`,
      timestamp: 'เมื่อสักครู่',
      title: `🔄 เปลี่ยนสถานะ: ${project.title}`,
      message: `เปลี่ยนสถานะเป็น "${statusLabel}" (${newPct}%) ระยะเวลา: ${project.timelineText}`,
      type: 'INFO',
      projectId: project.id,
      targetRecipient: project.responsiblePerson,
      recipientRole: 'OFFICER',
      read: false,
      sentToLine: true,
    });
  };

  const handleTriggerLineAlert = (project: ProjectTimelineItem) => {
    const officer = officers.find(
      (o) =>
        o.name.includes(project.responsiblePerson.replace('นางสาว', '').replace('น.ส.', '').trim()) ||
        project.responsiblePerson.includes(o.name.replace('นางสาว', '').replace('น.ส.', '').trim())
    );

    setLinePreselectedOfficer(officer || null);
    setLinePreselectedProject(project);
    setIsLineOAModalOpen(true);
  };

  const handleTriggerLineToOfficer = (officer: OfficerProfile) => {
    setLinePreselectedOfficer(officer);
    setLinePreselectedProject(null);
    setIsLineOAModalOpen(true);
  };

  const handleTriggerExecutiveDigest = () => {
    const exec = officers.find((o) => o.isExecutive);
    setLinePreselectedOfficer(exec || null);
    setLinePreselectedProject(null);
    setIsLineOAModalOpen(true);
  };

  const handleSaveNewProject = (newProject: ProjectTimelineItem) => {
    setProjects((prev) => [newProject, ...prev]);
    setIsNewProjectModalOpen(false);
    setToastMessage(`✓ เพิ่มโครงการใหม่ "${newProject.title}" เรียบร้อยแล้ว`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);

    handleAddNewNotification({
      id: `notif-${Date.now()}`,
      timestamp: 'เมื่อสักครู่',
      title: `✨ เพิ่มโครงการใหม่: ${newProject.title}`,
      message: `เพิ่มโครงการในสังกัด ${
        newProject.orgType === 'HOSPITAL' ? 'รพ.บัวลาย' : 'คปสอ. บัวลาย'
      } ระยะเวลาดำเนินการ: ${newProject.timelineText} ผู้รับผิดชอบ: ${newProject.responsiblePerson}`,
      type: 'SUCCESS',
      projectId: newProject.id,
      targetRecipient: newProject.responsiblePerson,
      recipientRole: 'OFFICER',
      read: false,
      sentToLine: true,
    });
  };

  useEffect(() => {
    if (currentTab === 'line-oa') {
      setIsLineOAModalOpen(true);
      setCurrentTab('overview');
    }
  }, [currentTab]);

  return (
    <div className="min-h-screen bg-[#F4FBF7] text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        notifications={notifications}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenLineOA={() => {
          setLinePreselectedOfficer(null);
          setLinePreselectedProject(null);
          setIsLineOAModalOpen(true);
        }}
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'overview' && (
          <DashboardOverview
            projects={projects}
            selectedOrg={selectedOrg}
            setSelectedOrg={setSelectedOrg}
            onSelectProjectForUpdate={(project) => setEditingProject(project)}
            onSendLineAlert={handleTriggerLineAlert}
            onSendExecutiveDigest={handleTriggerExecutiveDigest}
            onQuickStatusChange={handleQuickStatusChange}
          />
        )}

        {currentTab === 'gantt' && (
          <GanttTimelineView
            projects={projects}
            selectedOrg={selectedOrg}
            setSelectedOrg={setSelectedOrg}
            onSelectProjectForUpdate={(project) => setEditingProject(project)}
            onSendLineAlert={handleTriggerLineAlert}
            onQuickStatusChange={handleQuickStatusChange}
          />
        )}

        {currentTab === 'table' && (
          <OfficialTableView
            projects={projects}
            selectedOrg={selectedOrg}
            setSelectedOrg={setSelectedOrg}
            onSelectProjectForUpdate={(project) => setEditingProject(project)}
            onSendLineAlert={handleTriggerLineAlert}
            onQuickStatusChange={handleQuickStatusChange}
          />
        )}

        {currentTab === 'officers' && (
          <OfficersDirectoryView
            officers={officers}
            projects={projects}
            onSendLineToOfficer={handleTriggerLineToOfficer}
            onSelectProjectForUpdate={(project) => setEditingProject(project)}
            onQuickStatusChange={handleQuickStatusChange}
          />
        )}
      </main>

      {/* Footer - Green Pastel Theme */}
      <footer className="mt-auto border-t-2 border-emerald-200/80 bg-white py-6 text-sm text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-emerald-950">
              โรงพยาบาลบัวลาย และ คปสอ. บัวลาย
            </span>
            <span aria-hidden="true" className="text-emerald-400 font-bold">·</span>
            <span className="font-medium text-slate-700">จังหวัดนครราชสีมา</span>
            <span aria-hidden="true" className="text-emerald-400 font-bold">·</span>
            <span className="font-medium text-emerald-900">แผนยุทธศาสตร์ 2569 - 2571 (ประจำปีงบประมาณ 2570)</span>
          </div>

          <div className="text-emerald-800 font-mono text-xs font-bold">
            ระบบติดตามชื่อโครงการ & ระยะเวลาดำเนินการ · LINE OA Alert
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onOpenLineOA={() => {
          setIsLineOAModalOpen(true);
        }}
      />

      <LineOAManagerModal
        isOpen={isLineOAModalOpen}
        onClose={() => setIsLineOAModalOpen(false)}
        officers={officers}
        projects={projects}
        preselectedOfficer={linePreselectedOfficer}
        preselectedProject={linePreselectedProject}
        onNewNotification={handleAddNewNotification}
        config={lineConfig}
        setConfig={setLineConfig}
      />

      {editingProject && (
        <ActivityUpdateModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          project={editingProject}
          onSave={handleSaveProjectUpdate}
          onSendLineAlert={handleTriggerLineAlert}
        />
      )}

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSave={handleSaveNewProject}
        responsiblePersons={responsiblePersonsList}
      />

      {/* Floating Toast Feedback for Save / Update Confirmation */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#064E3B] text-white px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-emerald-400 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-7 h-7 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-sm font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
            title="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
