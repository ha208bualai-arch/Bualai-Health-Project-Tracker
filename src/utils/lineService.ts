// LINE Official Account Flex Message generator focused on Project Name and Execution Timeline

export interface LineFlexMessage {
  type: 'flex';
  altText: string;
  contents: Record<string, unknown>;
}

export interface LineMessageLog {
  id: string;
  timestamp: string;
  recipientName: string;
  recipientLineId: string;
  recipientRole: string;
  templateType: string;
  title: string;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
  previewText: string;
  flexJson: string;
}

export function generateProjectTimelineFlexMessage(params: {
  hospitalName: string;
  projectTitle: string;
  timelineText: string;
  targetMonths: string;
  quarterLabel: string;
  responsiblePerson: string;
  statusText: string;
  statusColor: string;
  urgency: string;
  progressPercent: number;
  actionUrl?: string;
}): LineFlexMessage {
  const {
    hospitalName,
    projectTitle,
    timelineText,
    targetMonths,
    quarterLabel,
    responsiblePerson,
    statusText,
    statusColor,
    urgency,
    progressPercent,
  } = params;

  const flexContent = {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#0d9488', // Teal 600
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '🏥 ' + hospitalName,
              weight: 'bold',
              color: '#ffffff',
              size: 'xs',
              flex: 1,
            },
            {
              type: 'text',
              text: urgency,
              size: 'xxs',
              color: '#ffffff',
              align: 'end',
              weight: 'bold',
            },
          ],
        },
        {
          type: 'text',
          text: 'แจ้งเตือนระยะเวลาดำเนินโครงการ พ.ศ. 2570',
          weight: 'bold',
          color: '#ffffff',
          size: 'md',
          margin: 'sm',
          wrap: true,
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '16px',
      spacing: 'md',
      contents: [
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'xs',
          contents: [
            {
              type: 'text',
              text: '📌 ชื่อโครงการ',
              size: 'xs',
              color: '#64748b',
              weight: 'bold',
            },
            {
              type: 'text',
              text: projectTitle,
              weight: 'bold',
              size: 'sm',
              color: '#0f172a',
              wrap: true,
            },
          ],
        },
        {
          type: 'separator',
          color: '#e2e8f0',
        },
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '⏱️ ระยะเวลาดำเนินการ',
                  size: 'xs',
                  color: '#64748b',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: timelineText,
                  size: 'xs',
                  color: '#0d9488',
                  weight: 'bold',
                  align: 'end',
                  flex: 3,
                  wrap: true,
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '📅 ไตรมาสเป้าหมาย',
                  size: 'xs',
                  color: '#64748b',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: quarterLabel,
                  size: 'xs',
                  color: '#0f172a',
                  weight: 'bold',
                  align: 'end',
                  flex: 3,
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '🗓️ ช่วงเดือนที่กำหนด',
                  size: 'xs',
                  color: '#64748b',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: targetMonths,
                  size: 'xs',
                  color: '#334155',
                  align: 'end',
                  flex: 3,
                  wrap: true,
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '👤 ผู้รับผิดชอบ',
                  size: 'xs',
                  color: '#64748b',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: responsiblePerson,
                  size: 'xs',
                  color: '#0f172a',
                  weight: 'bold',
                  align: 'end',
                  flex: 3,
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '📊 สถานะความคืบหน้า',
                  size: 'xs',
                  color: '#64748b',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: `${statusText} (${progressPercent}%)`,
                  size: 'xs',
                  color: statusColor,
                  weight: 'bold',
                  align: 'end',
                  flex: 3,
                },
              ],
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '16px',
      spacing: 'sm',
      contents: [
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          color: '#0d9488',
          action: {
            type: 'uri',
            label: '📱 เปิดแดชบอร์ดตรวจสอบตามกำหนดเวลา',
            uri: params.actionUrl || window.location.href,
          },
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `[แจ้งเตือนกำหนดเวลาโครงการ] ${projectTitle} (${timelineText})`,
    contents: flexContent,
  };
}

export function generateExecutiveDigestFlexMessage(params: {
  hospitalName: string;
  reportPeriod: string;
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  delayedProjects: number;
  actionUrl?: string;
}): LineFlexMessage {
  const {
    hospitalName,
    reportPeriod,
    totalProjects,
    completedProjects,
    inProgressProjects,
    delayedProjects,
  } = params;

  const flexContent = {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#1e293b',
      paddingAll: '16px',
      contents: [
        {
          type: 'text',
          text: '📊 EXECUTIVE TIMELINE REPORT',
          size: 'xxs',
          color: '#94a3b8',
          weight: 'bold',
          letterSpacing: '1px',
        },
        {
          type: 'text',
          text: `สรุปความก้าวหน้าโครงการตามระยะเวลา`,
          weight: 'bold',
          color: '#ffffff',
          size: 'md',
          margin: 'xs',
        },
        {
          type: 'text',
          text: `${hospitalName} · ${reportPeriod}`,
          size: 'xs',
          color: '#cbd5e1',
          margin: 'xs',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '16px',
      spacing: 'md',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'vertical',
              paddingAll: '10px',
              backgroundColor: '#f1f5f9',
              cornerRadius: '8px',
              flex: 1,
              contents: [
                { type: 'text', text: 'โครงการทั้งหมด', size: 'xxs', color: '#64748b' },
                { type: 'text', text: `${totalProjects} โครงการ`, size: 'md', weight: 'bold', color: '#0f172a' },
              ],
            },
            {
              type: 'box',
              layout: 'vertical',
              paddingAll: '10px',
              backgroundColor: '#ecfdf5',
              cornerRadius: '8px',
              flex: 1,
              contents: [
                { type: 'text', text: 'สำเร็จตามกำหนด', size: 'xxs', color: '#059669' },
                { type: 'text', text: `${completedProjects} โครงการ`, size: 'md', weight: 'bold', color: '#059669' },
              ],
            },
          ],
        },
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'vertical',
              paddingAll: '10px',
              backgroundColor: '#fef3c7',
              cornerRadius: '8px',
              flex: 1,
              contents: [
                { type: 'text', text: 'กำลังดำเนินการ', size: 'xxs', color: '#d97706' },
                { type: 'text', text: `${inProgressProjects} โครงการ`, size: 'md', weight: 'bold', color: '#d97706' },
              ],
            },
            {
              type: 'box',
              layout: 'vertical',
              paddingAll: '10px',
              backgroundColor: '#fef2f2',
              cornerRadius: '8px',
              flex: 1,
              contents: [
                { type: 'text', text: 'เกินกำหนด/เร่งรัด', size: 'xxs', color: '#dc2626' },
                { type: 'text', text: `${delayedProjects} โครงการ`, size: 'md', weight: 'bold', color: '#dc2626' },
              ],
            },
          ],
        },
        {
          type: 'separator',
          color: '#e2e8f0',
        },
        {
          type: 'text',
          text: '📌 ไตรมาสปัจจุบัน: ไตรมาส 1 (ต.ค. - ธ.ค. 2569) เริ่มต้นปีงบประมาณ 2570 ให้ผู้รับผิดชอบเตรียมการดำเนินงานตามระยะเวลาที่กำหนด',
          size: 'xs',
          color: '#475569',
          wrap: true,
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '16px',
      contents: [
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          color: '#1e293b',
          action: {
            type: 'uri',
            label: '🔍 ตรวจสอบไทม์ไลน์โครงการในแดชบอร์ด',
            uri: params.actionUrl || window.location.href,
          },
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `[รายงานผู้บริหาร] สรุปสถานะโครงการตามระยะเวลา - ${hospitalName}`,
    contents: flexContent,
  };
}
