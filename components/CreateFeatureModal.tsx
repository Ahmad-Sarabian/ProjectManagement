
import React, { useState } from 'react';
import { TeamName, TaskStatus, Feature } from '../types';
import { TEAMS_ORDER } from '../constants';

interface CreateFeatureModalProps {
  availableProjects: string[];
  onClose: () => void;
  onCreate: (feature: Omit<Feature, 'id'>) => void;
}

const CreateFeatureModal: React.FC<CreateFeatureModalProps> = ({ availableProjects, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [priorityLetter, setPriorityLetter] = useState('B');
  const [priorityNumber, setPriorityNumber] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !projectName) {
      alert('لطفاً نام فیچر و نام پروژه را انتخاب کنید.');
      return;
    }

    const num = parseInt(priorityNumber);
    if (isNaN(num) || num < 1) {
      alert('لطفاً یک عدد معتبر (بزرگتر یا مساوی ۱) برای اولویت وارد کنید.');
      return;
    }

    const teamStatuses: Record<TeamName, TaskStatus> = {} as any;
    TEAMS_ORDER.forEach(team => {
      // Every feature is automatically assigned to the Product team as WAITING
      // and set to NONE for all other teams.
      teamStatuses[team] = (team === TeamName.PRODUCT) ? TaskStatus.WAITING : TaskStatus.NONE;
    });

    onCreate({
      name,
      projectName,
      description,
      priority: `${priorityLetter}${priorityNumber}`,
      teamStatuses,
      blockageReasons: {},
      completionDates: {},
      estimatedDates: {}
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
          <div>
            <h2 className="text-xl font-bold text-slate-800">تعریف فیچر جدید</h2>
            <p className="text-xs text-slate-500 mt-1">مشخصات فیچر جدید را وارد کنید</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all shadow-sm">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 mr-1 uppercase">نام فیچر</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                placeholder="مثلاً: لاگین با گوگل"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 mr-1 uppercase">نام پروژه والد</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all appearance-none cursor-pointer"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
              >
                <option value="" disabled>انتخاب پروژه...</option>
                {availableProjects.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 mr-1 uppercase">اهمیت</label>
              <div className="flex gap-2">
                {['A', 'B', 'C'].map(letter => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setPriorityLetter(letter)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                      priorityLetter === letter 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 mr-1 uppercase">ترتیب (عدد)</label>
              <input 
                type="number" 
                min="1"
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                placeholder="1"
                value={priorityNumber}
                onChange={e => setPriorityNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 mr-1 uppercase">توضیحات</label>
            <textarea 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all min-h-[140px]"
              placeholder="شرح مختصری از وظیفه..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </form>

        <div className="p-6 bg-slate-50 border-t flex gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-2xl transition-all"
          >
            انصراف
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-[2] py-3 bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            ایجاد فیچر
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFeatureModal;
