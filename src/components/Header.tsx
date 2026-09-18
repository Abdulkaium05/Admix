import React from 'react';
import { EngineerLogo } from './EngineerLogo';
import { translations, Language } from '../utils/i18n';
import { UserProfile } from '../types';
import { Menu, GraduationCap } from 'lucide-react';

interface HeaderProps {
  language: Language;
  onOpenMoreMenu: () => void;
  onOpenProfile: () => void;
  profile: UserProfile | null;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onOpenMoreMenu,
  onOpenProfile,
  profile,
  onNavigateHome,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-2xs transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: Engineer Logo + App Identity (Admix) */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-hidden"
          title="Admix হোম পেজে যান"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 transition-transform group-hover:scale-105">
            <EngineerLogo className="w-full h-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-emerald-800 group-hover:text-emerald-600 transition-colors">
                Admix
              </span>
              <span className="px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {language === 'bn' ? 'ডুয়েট প্রস্তুতি' : 'DUET Prep'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/70 truncate max-w-[190px] sm:max-w-xs font-medium">
              {language === 'bn' ? 'প্রকৌশল ভর্তি কুইজ ও মডেল টেস্ট' : 'Engineering Admission Model Test'}
            </p>
          </div>
        </button>

        {/* Right Controls: Clean and clutter-free */}
        <div className="flex items-center gap-2">
          {/* Quick Profile / CGPA Badge */}
          {profile && (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all"
              title="প্রোফাইল ও সিজিপিএ দেখুন"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline max-w-[90px] truncate">{profile.name}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] sm:text-[11px] font-mono">
                {profile.calculatedCgpa.toFixed(2)}
              </span>
            </button>
          )}

          {/* More Menu Drawer Trigger: Clean icon-only button without text */}
          <button
            onClick={onOpenMoreMenu}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center transition-all shadow-2xs focus:outline-hidden"
            aria-label={t.moreMenu}
            title={t.moreMenu}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
