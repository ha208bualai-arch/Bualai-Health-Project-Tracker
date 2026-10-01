import React from 'react';
import { X, Bell, Check, Send, AlertTriangle, Info, CheckCircle2, Clock } from 'lucide-react';
import { SystemNotification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkAllAsRead: () => void;
  onOpenLineOA: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onOpenLineOA,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs transition-opacity cursor-pointer"
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l-2 border-emerald-300 shadow-2xl flex flex-col">
          {/* Drawer Top - Deep Emerald Green */}
          <div className="p-5 border-b-2 border-emerald-900/40 flex items-center justify-between bg-[#064E3B] text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-200">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">
                  ศูนย์แจ้งเตือนแบบเรียลไทม์
                </h2>
                <p className="text-xs text-emerald-200/90 font-medium">
                  ระบบติดตามแผนยุทธศาสตร์และแจ้งเตือน LINE OA
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-emerald-200 hover:text-white rounded-xl hover:bg-emerald-800/80 transition-colors cursor-pointer flex items-center gap-1 text-sm font-bold"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
              <span>ปิด</span>
            </button>
          </div>

          {/* Action Bar */}
          <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-sm">
            <span className="text-slate-800 font-extrabold">
              ข้อความทั้งหมด ({notifications.length})
            </span>
            <button
              onClick={onMarkAllAsRead}
              className="text-emerald-900 hover:text-emerald-950 font-extrabold cursor-pointer"
            >
              ทำเครื่องหมายว่าอ่านแล้ว
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm font-medium">
                ไม่มีการแจ้งเตือนในขณะนี้
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl transition-colors space-y-2 border-2 ${
                    notif.read
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-emerald-50 border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      {notif.type === 'ALERT' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      ) : notif.type === 'SUCCESS' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      ) : (
                        <Info className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      <h4 className="text-sm font-extrabold text-slate-950 leading-snug">
                        {notif.title}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 whitespace-nowrap">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 pl-7 leading-relaxed font-medium">
                    {notif.message}
                  </p>

                  <div className="pl-7 pt-1 flex items-center justify-between text-xs text-slate-600 font-semibold">
                    <span>
                      ผู้รับ: <strong className="text-emerald-950 font-bold">{notif.targetRecipient}</strong>
                    </span>
                    {notif.sentToLine && (
                      <span className="text-emerald-800 font-bold flex items-center gap-1">
                        <Send className="w-3 h-3" />
                        <span>ส่งผ่าน LINE แล้ว</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t-2 border-emerald-200 bg-emerald-50/60 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenLineOA();
              }}
              className="px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>เปิดศูนย์ส่ง LINE OA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
