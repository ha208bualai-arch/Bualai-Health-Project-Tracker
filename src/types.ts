export type OrgType = 'HOSPITAL' | 'CUP';

export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';

export type QuarterKey = 'q1' | 'q2' | 'q3' | 'q4';

export interface ProjectTimelineItem {
  id: string;
  code: string;
  orgType: OrgType; // 'HOSPITAL' = รพ.บัวลาย, 'CUP' = คปสอ. บัวลาย
  title: string; // ชื่อโครงการ
  timelineText: string; // ระยะเวลาดำเนินการ เช่น "ไตรมาส 1 - 2 (ต.ค. 69 - มี.ค. 70)"
  targetMonths: string; // เดือนที่กำหนด เช่น "มกราคม - มีนาคม 2570"
  quarters: {
    q1: boolean;
    q2: boolean;
    q3: boolean;
    q4: boolean;
    q1Detail?: string;
    q2Detail?: string;
    q3Detail?: string;
    q4Detail?: string;
  };
  status: ProjectStatus;
  progressPercent: number;
  responsiblePerson: string; // ผู้รับผิดชอบโครงการ
  responsibleRole?: string;
  department?: string;
  fiscalYear: number; // 2570
  notes?: string;
  lastNotifiedAt?: string;
}

export interface OfficerProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  orgType: OrgType | 'BOTH';
  lineUserId: string;
  phoneNumber?: string;
  isExecutive?: boolean;
}

export interface SystemNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'ALERT' | 'INFO' | 'SUCCESS' | 'WARNING';
  projectId?: string;
  targetRecipient: string;
  recipientRole: 'EXECUTIVE' | 'OFFICER' | 'ALL';
  read: boolean;
  sentToLine: boolean;
  actionRequired?: boolean;
}

export interface LineBotConfig {
  enabled: boolean;
  channelAccessToken: string;
  channelSecret: string;
  webhookUrl: string;
  executiveLineId: string;
  autoAlertEnabled: boolean;
  alertIntervalDays: number;
}
