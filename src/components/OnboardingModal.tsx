import React, { useState, useMemo } from 'react';
import { UserProfile, SemesterGrades, DepartmentType } from '../types';
import { calculateCgpa } from '../utils/storage';
import { translations, Language } from '../utils/i18n';
import { EngineerLogo } from './EngineerLogo';
import { Calculator, CheckCircle2, AlertCircle, Sparkles, X, Building2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onSave: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
  language: Language;
  canCloseWithoutSave?: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onSave,
  initialProfile,
  language,
  canCloseWithoutSave = false,
  onClose,
}) => {
  const t = translations[language];

  const [name, setName] = useState(initialProfile?.name || '');
  const [polytechnicRoll, setPolytechnicRoll] = useState(initialProfile?.polytechnicRoll || '');
  const [polytechnicName, setPolytechnicName] = useState(initialProfile?.polytechnicName || '');
  const [department, setDepartment] = useState<DepartmentType>(initialProfile?.department || 'civil');

  const [semesters, setSemesters] = useState<SemesterGrades>(
    initialProfile?.semesters || {
      s1: undefined,
      s2: undefined,
      s3: undefined,
      s4: undefined,
      s5: undefined,
      s6: undefined,
      s7: undefined,
      s8: undefined,
    }
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cgpaResult = useMemo(() => {
    return calculateCgpa(semesters);
  }, [semesters]);

  if (!isOpen) return null;

  const handleSemesterChange = (key: keyof SemesterGrades, valStr: string) => {
    if (valStr.trim() === '') {
      setSemesters((prev) => ({ ...prev, [key]: undefined }));
      return;
    }
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      setSemesters((prev) => ({ ...prev, [key]: val }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your name.');
      return;
    }
    if (!polytechnicRoll.trim()) {
      setErrorMsg(language === 'bn' ? 'পলিটেকনিক রোল নম্বর প্রদান করুন।' : 'Please enter polytechnic roll number.');
      return;
    }
    if (!polytechnicName.trim()) {
      setErrorMsg(language === 'bn' ? 'পলিটেকনিক ইনস্টিটিউট এর নাম লিখুন।' : 'Please enter polytechnic institute name.');
      return;
    }

    const profile: UserProfile = {
      name: name.trim(),
      polytechnicRoll: polytechnicRoll.trim(),
      polytechnicName: polytechnicName.trim(),
      semesters,
      calculatedCgpa: cgpaResult.cgpa,
      isAverage: cgpaResult.isAverage,
      department,
      completedOnboarding: true,
    };

    onSave(profile);
  };

  const semesterConfig: { key: keyof SemesterGrades; labelBn: string; labelEn: string; weight: string }[] = [
    { key: 's1', labelBn: '১ম সেমিস্টার', labelEn: '1st Semester', weight: '৫%' },
    { key: 's2', labelBn: '২য় সেমিস্টার', labelEn: '2nd Semester', weight: '৫%' },
    { key: 's3', labelBn: '৩য় সেমিস্টার', labelEn: '3rd Semester', weight: '১০%' },
    { key: 's4', labelBn: '৪র্থ সেমিস্টার', labelEn: '4th Semester', weight: '১০%' },
    { key: 's5', labelBn: '৫ম সেমিস্টার', labelEn: '5th Semester', weight: '২০%' },
    { key: 's6', labelBn: '৬ষ্ঠ সেমিস্টার', labelEn: '6th Semester', weight: '২০%' },
    { key: 's7', labelBn: '৭ম সেমিস্টার', labelEn: '7th Semester', weight: '২০%' },
    { key: 's8', labelBn: '৮ম সেমিস্টার', labelEn: '8th Semester', weight: '১০%' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-emerald-950/50 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-emerald-200 max-h-[90vh] sm:max-h-[88vh] flex flex-col overflow-hidden my-auto">
        {/* Top Header Banner: Fixed at top of modal */}
        <div className="flex-shrink-0 bg-emerald-600 p-3.5 sm:p-4 text-white flex items-center justify-between shadow-2xs z-10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 bg-white/15 rounded-xl p-1 flex items-center justify-center">
              <EngineerLogo className="w-full h-full text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">
                {language === 'bn' ? 'শিক্ষার্থী প্রোফাইল ও সিজিপিএ' : 'Student Profile & CGPA'}
              </h2>
              <p className="text-[11px] sm:text-xs text-emerald-100">
                {language === 'bn'
                  ? 'বিটিইবি ডিপ্লোমা রেজাল্ট ও ভর্তি তথ্য'
                  : 'BTEB Diploma results & admission details'}
              </p>
            </div>
          </div>
          {canCloseWithoutSave && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* User & Polytechnic info Section */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                {language === 'bn' ? 'শিক্ষার্থীর ব্যক্তিগত তথ্য' : 'Student Information'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                  {t.studentName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: সাকিব আহমেদ"
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white text-emerald-950 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                  {t.polytechnicRoll} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={polytechnicRoll}
                  onChange={(e) => setPolytechnicRoll(e.target.value)}
                  placeholder="যেমন: 512345"
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white text-emerald-950 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                  {t.polytechnicName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={polytechnicName}
                  onChange={(e) => setPolytechnicName(e.target.value)}
                  placeholder="যেমন: ঢাকা পলিটেকনিক"
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white text-emerald-950 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Department Selection */}
            <div>
              <label className="block text-xs font-bold text-emerald-950 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'bn' ? 'টার্গেট প্রকৌশল বিভাগ (ডিপার্টমেন্ট)' : 'Target Engineering Department'}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'civil' as DepartmentType, labelBn: 'সিভিল (Civil)', labelEn: 'Civil' },
                  { id: 'eee' as DepartmentType, labelBn: 'ইইই (EEE)', labelEn: 'EEE' },
                  { id: 'me' as DepartmentType, labelBn: 'মেকানিক্যাল (ME)', labelEn: 'Mechanical' },
                  { id: 'cse' as DepartmentType, labelBn: 'সিএসই (CSE)', labelEn: 'CSE' },
                ].map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setDepartment(dept.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      department === dept.id
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    {language === 'bn' ? dept.labelBn : dept.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 8 Semesters Result Section */}
          <div className="pt-2 border-t border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.semestersTitle}</span>
                </h3>
                <p className="text-[11px] text-emerald-700/80">
                  {language === 'bn'
                    ? '১ম-২য় (৫%), ৩য়-৪র্থ-৮ম (১০%), ৫ম-৬ষ্ঠ-৭ম (২০%) ওয়েটেড ফর্মুলা'
                    : '1st-2nd (5%), 3rd-4th-8th (10%), 5th-6th-7th (20%) weighted scale'}
                </p>
              </div>
            </div>

            {/* 8 Semesters Input Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {semesterConfig.map((item) => {
                const val = semesters[item.key];
                return (
                  <div
                    key={item.key}
                    className="p-2 rounded-xl border border-emerald-100 bg-emerald-50/40 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-emerald-950">
                        {language === 'bn' ? item.labelBn : item.labelEn}
                      </span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                        {item.weight}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="1.00"
                      max="4.00"
                      value={val !== undefined ? val : ''}
                      onChange={(e) => handleSemesterChange(item.key, e.target.value)}
                      placeholder="e.g. 3.80"
                      className="w-full px-2 py-1 rounded-lg border border-emerald-200 bg-white text-emerald-950 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live CGPA Scaled Result Display */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>হিসাবকৃত সিজিপিএ (CGPA)</span>
                {cgpaResult.enteredCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-medium">
                    {cgpaResult.isAverage
                      ? `প্রদত্ত ${cgpaResult.enteredCount} সেমিস্টার (${cgpaResult.completedWeightPercent}% কে ১০০% স্কেলে)`
                      : '৮ সেমিস্টার সম্পূর্ণ (১০০%)'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-700/80 mt-1">
                {cgpaResult.isAverage
                  ? `* আপনার এন্ট্রি করা সেমিস্টারের মোট ওয়েট ${cgpaResult.completedWeightPercent}%, একে সমভাবে ১০০% হিসেবে কনভার্ট করে চূড়ান্ত সিজিপিএ দেখানো হয়েছে।`
                  : '* বিটিইবি অফিশিয়াল ৮ সেমিস্টার ওয়েটেড ফর্মুলায় ফলাফল গণনা করা হয়েছে।'}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-mono tracking-tight">
                {cgpaResult.cgpa > 0 ? cgpaResult.cgpa.toFixed(2) : '০.০০'}
              </span>
              <span className="text-xs text-emerald-700/70">/ ৪.০০</span>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="flex-shrink-0 p-3 sm:p-4 bg-white/95 border-t border-emerald-100 flex items-center justify-end gap-2.5">
          {canCloseWithoutSave && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-emerald-800 hover:bg-emerald-50 transition-colors"
            >
              {t.cancel}
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.enterApp}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
