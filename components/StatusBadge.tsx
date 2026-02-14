
import React from 'react';
import { TaskStatus } from '../types';

interface StatusBadgeProps {
  status: TaskStatus;
  blockageReason?: string;
  completionDate?: string;
  estimatedDate?: string;
  onClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, blockageReason, completionDate, estimatedDate, onClick, onContextMenu }) => {
  const getTooltip = () => {
    switch (status) {
      case TaskStatus.COMPLETED: 
        return `تکمیل شده در: ${completionDate || '0'} روز`;
      case TaskStatus.IN_PROGRESS: 
        return `در حال انجام${estimatedDate ? ` (تخمین: ${estimatedDate} روز)` : ''}`;
      case TaskStatus.WAITING: 
        return `در انتظار${estimatedDate ? ` (تخمین: ${estimatedDate} روز)` : ''}`;
      case TaskStatus.BLOCKED: 
        return `بلاک شده: ${blockageReason || 'بدون دلیل'}`;
      default: 
        return 'بدون وضعیت';
    }
  };

  const renderIcon = () => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        );
      case TaskStatus.IN_PROGRESS:
        return (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case TaskStatus.WAITING:
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case TaskStatus.BLOCKED:
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        );
      default:
        return (
          <svg className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 12H6" />
          </svg>
        );
    }
  };

  const getStyles = () => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-100 hover:bg-emerald-600';
      case TaskStatus.IN_PROGRESS:
        return 'bg-sky-500 text-white border-sky-600 shadow-sm shadow-sky-100 hover:bg-sky-600';
      case TaskStatus.WAITING:
        return 'bg-amber-400 text-white border-amber-500 shadow-sm shadow-amber-100 hover:bg-amber-500';
      case TaskStatus.BLOCKED:
        return 'bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-100 hover:bg-rose-600 animate-pulse';
      case TaskStatus.NONE:
      default:
        return 'bg-slate-50 text-slate-300 border-slate-200 hover:bg-slate-100 hover:text-slate-400';
    }
  };

  return (
    <div 
      onClick={onClick}
      onContextMenu={onContextMenu}
      title={getTooltip()} 
      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-200 select-none text-center h-[32px] flex items-center justify-center gap-1.5 group/badge ${getStyles()}`}
    >
      <span className="flex-shrink-0">{renderIcon()}</span>
      <span className="hidden xl:inline-block truncate max-w-[80px]">
        {status === TaskStatus.COMPLETED ? 'تکمیل شده' : 
         status === TaskStatus.IN_PROGRESS ? 'در جریان' : 
         status === TaskStatus.WAITING ? 'در انتظار' : 
         status === TaskStatus.BLOCKED ? 'بلاک شده' : 'بدون وضعیت'}
      </span>
    </div>
  );
};

export default StatusBadge;
