
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Feature, TeamName, TaskStatus } from './types';
import { TEAMS_ORDER, INITIAL_FEATURES } from './constants';
import StatusBadge from './components/StatusBadge';
import FeatureModal from './components/FeatureModal';
import CreateFeatureModal from './components/CreateFeatureModal';
import { analyzeProjectData } from './services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ContextMenuState {
  x: number;
  y: number;
  featureId: string;
  team: TeamName;
  currentStatus: TaskStatus;
}

const App: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>(INITIAL_FEATURES);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTeamFilter, setActiveTeamFilter] = useState<TeamName | 'ALL'>('ALL');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Extract unique project names for the creation modal
  const availableProjects = useMemo(() => {
    const projects = features.map(f => f.projectName);
    return Array.from(new Set(projects)).sort();
  }, [features]);

  const filteredFeatures = useMemo(() => {
    let result = features.filter(f => 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      f.projectName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeTeamFilter !== 'ALL') {
      result = result.filter(f => f.teamStatuses[activeTeamFilter] !== TaskStatus.NONE);
    }

    return result;
  }, [features, searchTerm, activeTeamFilter]);

  const handleCreateFeature = (newFeatureData: Omit<Feature, 'id'>) => {
    const newFeature: Feature = {
      ...newFeatureData,
      id: Date.now().toString(),
    };
    setFeatures(prev => [newFeature, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleUpdateStatus = useCallback((featureId: string, team: TeamName, status: TaskStatus, extraData?: { reason?: string, estimatedDate?: string, completionDate?: string }) => {
    setFeatures(prev => prev.map(f => {
      if (f.id === featureId) {
        const newStatuses = { ...f.teamStatuses, [team]: status };
        const newReasons = { ...f.blockageReasons };
        const newCompletionDates = { ...f.completionDates };
        const newEstimatedDates = { ...f.estimatedDates };

        if (status === TaskStatus.BLOCKED) {
          let reason = extraData?.reason;
          if (!reason) {
            const prompted = window.prompt(`دلیل توقف کار (تیم ${team}) را وارد کنید:`, f.blockageReasons?.[team] || '');
            reason = prompted !== null ? (prompted.trim() || 'دلیلی ذکر نشده است') : (f.blockageReasons?.[team] || 'دلیلی ذکر نشده است');
          }
          newReasons[team] = reason;
        } else {
          delete newReasons[team];
        }

        if (status === TaskStatus.COMPLETED) {
          let days = extraData?.completionDate;
          if (!days) {
            const prompted = window.prompt(`تعداد روز صرف شده برای این بخش (تیم ${team}) را وارد کنید:`, f.completionDates?.[team] || '');
            days = prompted !== null ? (prompted.trim() || '0') : (f.completionDates?.[team] || '0');
          }
          newCompletionDates[team] = days;
        } else {
          delete newCompletionDates[team];
        }

        if (extraData?.estimatedDate !== undefined) {
          if (extraData.estimatedDate) newEstimatedDates[team] = extraData.estimatedDate;
          else delete newEstimatedDates[team];
        }

        const updatedFeature = { 
          ...f, 
          teamStatuses: newStatuses, 
          blockageReasons: newReasons,
          completionDates: newCompletionDates,
          estimatedDates: newEstimatedDates
        };
        if (selectedFeature?.id === featureId) setSelectedFeature(updatedFeature);
        return updatedFeature;
      }
      return f;
    }));
    setContextMenu(null);
  }, [selectedFeature]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeProjectData(features);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const calculateOverallProgress = (feature: Feature) => {
    const statuses = Object.values(feature.teamStatuses);
    const completed = statuses.filter(s => s === TaskStatus.COMPLETED).length;
    const relevantTeams = statuses.filter(s => s !== TaskStatus.NONE).length;
    if (relevantTeams === 0) return 0;
    return Math.round((completed / relevantTeams) * 100);
  };

  const statsData = useMemo(() => {
    let completed = 0, inProgress = 0, waiting = 0, blocked = 0, total = 0;
    
    features.forEach(f => {
      Object.entries(f.teamStatuses).forEach(([team, s]) => {
        if (activeTeamFilter !== 'ALL' && team !== activeTeamFilter) return;
        if (s === TaskStatus.NONE) return;
        
        total++;
        if (s === TaskStatus.COMPLETED) completed++;
        else if (s === TaskStatus.IN_PROGRESS) inProgress++;
        else if (s === TaskStatus.WAITING) waiting++;
        else if (s === TaskStatus.BLOCKED) blocked++;
      });
    });

    return [
      { name: 'تکمیل شده', value: completed, color: '#10b981' },
      { name: 'در حال انجام', value: inProgress, color: '#0ea5e9' },
      { name: 'در انتظار', value: waiting, color: '#f59e0b' },
      { name: 'بلاک شده', value: blocked, color: '#f43f5e' },
    ];
  }, [features, activeTeamFilter]);

  const getPriorityStyles = (priority: string) => {
    const char = priority.charAt(0).toUpperCase();
    if (char === 'A') return 'bg-red-50 text-red-500 border-red-100';
    if (char === 'B') return 'bg-orange-50 text-orange-500 border-orange-100';
    if (char === 'C') return 'bg-emerald-50 text-emerald-500 border-emerald-100';
    return 'bg-gray-50 text-gray-500 border-gray-100';
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const openQuickMenu = (e: React.MouseEvent, featureId: string, team: TeamName, currentStatus: TaskStatus) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, featureId, team, currentStatus });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Proflow <span className="text-indigo-600 font-normal">Dashboard</span></h1>
              <p className="text-[10px] text-slate-500 font-medium">پلتفرم مدیریت تخصصی تیم‌های اجرایی</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="text"
                placeholder="جستجو فیچر..."
                className="pr-10 pl-4 py-2 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full md:w-60 transition-all focus:bg-white focus:shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              فیچر جدید
            </button>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${isAnalyzing ? 'bg-slate-100 text-slate-400' : 'bg-slate-800 text-white hover:bg-black shadow-lg shadow-slate-200 active:scale-95'}`}
            >
              {isAnalyzing ? <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-white rounded-full animate-spin"></div> : 'تحلیل هوشمند'}
            </button>
          </div>
        </div>
      </header>

      {/* Team Filter Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-[73px] z-30">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 overflow-x-auto custom-scrollbar flex items-center gap-2 no-scrollbar">
          <button
            onClick={() => setActiveTeamFilter('ALL')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTeamFilter === 'ALL' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            همه فیچرها
          </button>
          <div className="w-px h-4 bg-slate-200 mx-1"></div>
          {TEAMS_ORDER.map(team => (
            <button
              key={team}
              onClick={() => setActiveTeamFilter(team)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTeamFilter === team ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              تیم {team}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6">
            <div className="w-40 h-40 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statsData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {statsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-bold text-slate-700 mb-2 text-xs">توزیع وضعیت {activeTeamFilter === 'ALL' ? 'کل' : `تیم ${activeTeamFilter}`}</h3>
              {statsData.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                    <span className="text-slate-500 font-medium">{s.name}</span>
                  </div>
                  <span className="font-bold text-slate-700">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-indigo-900 border border-indigo-800 rounded-3xl p-6 relative overflow-hidden group shadow-xl shadow-indigo-100">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              تحلیل هوشمند (بر اساس نمای فعلی)
            </h3>
            <div className="prose prose-sm prose-invert max-w-none text-indigo-100/90 leading-relaxed overflow-y-auto max-h-[160px] custom-scrollbar text-justify text-[13px]">
              {analysisResult ? <div className="whitespace-pre-line">{analysisResult}</div> : <div className="flex flex-col items-center justify-center h-full py-4 opacity-50 italic">منتظر تحلیل هوشمند...</div>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-5 text-[10px] font-black text-slate-400 sticky right-0 bg-slate-50 z-30 w-[160px] uppercase">پروژه</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 sticky right-[160px] bg-slate-50 z-30 w-[300px] uppercase">فیچر</th>
                  {TEAMS_ORDER.map(team => (
                    <th key={team} className={`p-5 text-[10px] font-black text-slate-400 w-[140px] text-center uppercase ${activeTeamFilter === team ? 'bg-indigo-50/50 text-indigo-600' : ''}`}>{team}</th>
                  ))}
                  <th className="p-5 text-[10px] font-black text-slate-400 text-center w-[120px] uppercase">پیشرفت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFeatures.map(feature => (
                  <tr key={feature.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5 sticky right-0 bg-white group-hover:bg-[#f8fafc] z-20 overflow-hidden">
                      <div className="font-bold text-indigo-600 text-[10px] uppercase tracking-wider truncate" title={feature.projectName}>{feature.projectName}</div>
                    </td>
                    <td className="p-5 sticky right-[160px] bg-white group-hover:bg-[#f8fafc] z-20 overflow-hidden">
                      <div className="cursor-pointer" onClick={() => setSelectedFeature(feature)}>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm truncate" title={feature.name}>{feature.name}</span>
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black border ${getPriorityStyles(feature.priority)}`}>{feature.priority}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 truncate font-medium">{feature.description}</div>
                      </div>
                    </td>
                    {TEAMS_ORDER.map(team => (
                      <td key={team} className={`p-2.5 transition-all ${activeTeamFilter === team ? 'bg-indigo-50/30 ring-1 ring-inset ring-indigo-100/50' : ''}`}>
                        <StatusBadge 
                          status={feature.teamStatuses[team]} 
                          blockageReason={feature.blockageReasons?.[team]}
                          completionDate={feature.completionDates?.[team]}
                          estimatedDate={feature.estimatedDates?.[team]}
                          onClick={(e) => feature.teamStatuses[team] !== TaskStatus.NONE && openQuickMenu(e, feature.id, team, feature.teamStatuses[team])}
                        />
                      </td>
                    ))}
                    <td className="p-5">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${calculateOverallProgress(feature) === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${calculateOverallProgress(feature)}%` }}></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-600">%{calculateOverallProgress(feature)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {contextMenu && (
        <div 
          className="fixed z-[100] bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 w-52 animate-in fade-in zoom-in duration-150"
          style={{ top: Math.min(contextMenu.y, window.innerHeight - 250), right: window.innerWidth - contextMenu.x + 10 }}
        >
          <div className="px-4 py-2 border-b border-slate-50 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{contextMenu.team}</div>
          {[
            { id: TaskStatus.COMPLETED, label: 'تکمیل شده', color: 'bg-emerald-500' },
            { id: TaskStatus.IN_PROGRESS, label: 'در حال انجام', color: 'bg-sky-500' },
            { id: TaskStatus.WAITING, label: 'در انتظار', color: 'bg-amber-500' },
            { id: TaskStatus.BLOCKED, label: 'بلاک شده 🛑', color: 'bg-rose-500' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleUpdateStatus(contextMenu.featureId, contextMenu.team, item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-right hover:bg-slate-50 transition-colors ${contextMenu.currentStatus === item.id ? 'font-bold text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
              <span className="flex-1">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {selectedFeature && <FeatureModal feature={selectedFeature} onClose={() => setSelectedFeature(null)} onUpdateStatus={handleUpdateStatus} />}
      {isCreateModalOpen && (
        <CreateFeatureModal 
          availableProjects={availableProjects} 
          onClose={() => setIsCreateModalOpen(false)} 
          onCreate={handleCreateFeature} 
        />
      )}
    </div>
  );
};

export default App;
