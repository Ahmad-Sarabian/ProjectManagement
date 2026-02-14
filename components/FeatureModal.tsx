
import React, { useState } from 'react';
import { Feature, TeamName, TaskStatus } from '../types';
import { TEAMS_ORDER } from '../constants';

interface FeatureModalProps {
  feature: Feature;
  onClose: () => void;
  onUpdateStatus: (featureId: string, team: TeamName, status: TaskStatus, extraData?: { reason?: string, estimatedDate?: string, completionDate?: string }) => void;
}

const FeatureModal: React.FC<FeatureModalProps> = ({ feature, onClose, onUpdateStatus }) => {
  const [localReasons, setLocalReasons] = useState<Partial<Record<TeamName, string>>>(feature.blockageReasons || {});
  const [localEstimates, setLocalEstimates] = useState<Partial<Record<TeamName, string>>>(feature.estimatedDates || {});
  const [localCompletions, setLocalCompletions] = useState<Partial<Record<TeamName, string>>>(feature.completionDates || {});

  const handleStatusChange = (team: TeamName, status: TaskStatus) => {
    onUpdateStatus(feature.id, team, status, { 
      reason: localReasons[team], 
      estimatedDate: localEstimates[team],
      completionDate: localCompletions[team]
    });
  };

  const handleReasonChange = (team: TeamName, value: string) => {
    setLocalReasons(prev => ({ ...prev, [team]: value }));
    if (feature.teamStatuses[team] === TaskStatus.BLOCKED) {
      onUpdateStatus(feature.id, team, TaskStatus.BLOCKED, { reason: value });
    }
  };

  const handleEstimateChange = (team: TeamName, value: string) => {
    setLocalEstimates(prev => ({ ...prev, [team]: value }));
    onUpdateStatus(feature.id, team, feature.teamStatuses[team], { estimatedDate: value });
  };

  const handleCompletionChange = (team: TeamName, value: string) => {
    setLocalCompletions(prev => ({ ...prev, [team]: value }));
    if (feature.teamStatuses[team] === TaskStatus.COMPLETED) {
      onUpdateStatus(feature.id, team, TaskStatus.COMPLETED, { completionDate: value });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{feature.name}</h2>
            <p className="text-sm text-slate-500 mt-1">پروژه: {feature.projectName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">توضیحات فیچر</h3>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm leading-relaxed border border-slate-100">
              {feature.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {TEAMS_ORDER.map((team) => (
              <div key={team} className="p-4 border rounded-xl hover:border-indigo-100 transition-colors bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    {team}
                  </span>
                  <div className="flex items-center gap-3">
                    <select 
                      className={`text-xs rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none p-2 border ${feature.teamStatuses[team] === TaskStatus.BLOCKED ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                      value={feature.teamStatuses[team]}
                      onChange={(e) => handleStatusChange(team, e.target.value as TaskStatus)}
                    >
                      <option value={TaskStatus.NONE}>بدون وضعیت</option>
                      <option value={TaskStatus.WAITING}>در انتظار</option>
                      <option value={TaskStatus.IN_PROGRESS}>در حال انجام</option>
                      <option value={TaskStatus.COMPLETED}>تکمیل شده</option>
                      <option value={TaskStatus.BLOCKED}>بلاک شده 🛑</option>
                    </select>
                  </div>
                </div>

                {feature.teamStatuses[team] === TaskStatus.COMPLETED && (
                  <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
                    <label className="block text-[10px] font-black text-emerald-600 mb-1 uppercase tracking-wider">تعداد روز صرف شده (الزامی):</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        placeholder="0"
                        className="w-24 bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-xs text-emerald-800 focus:ring-1 focus:ring-emerald-400 focus:outline-none font-bold"
                        value={localCompletions[team] || ''}
                        onChange={(e) => handleCompletionChange(team, e.target.value)}
                      />
                      <span className="text-[10px] text-emerald-500 font-bold">روز</span>
                    </div>
                  </div>
                )}

                {(feature.teamStatuses[team] === TaskStatus.IN_PROGRESS || feature.teamStatuses[team] === TaskStatus.WAITING) && (
                  <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
                    <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">زمان تخمینی اتمام (به روز):</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        placeholder="تعداد روز تخمینی..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 placeholder:text-slate-300 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                        value={localEstimates[team] || ''}
                        onChange={(e) => handleEstimateChange(team, e.target.value)}
                      />
                      <span className="text-[10px] text-slate-400 font-bold">روز</span>
                    </div>
                  </div>
                )}

                {feature.teamStatuses[team] === TaskStatus.BLOCKED && (
                  <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
                    <label className="block text-[10px] font-black text-rose-500 mb-1 uppercase tracking-wider">دلیل توقف کار:</label>
                    <input 
                      type="text"
                      placeholder="توضیح کوتاه درباره علت بلاک شدن..."
                      className="w-full bg-rose-50 border border-rose-100 rounded-lg p-2 text-xs text-rose-800 placeholder:text-rose-300 focus:ring-1 focus:ring-rose-400 focus:outline-none"
                      value={localReasons[team] || ''}
                      onChange={(e) => handleReasonChange(team, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            بستن و تایید
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureModal;
