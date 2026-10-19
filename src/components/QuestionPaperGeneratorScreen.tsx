import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Printer,
  PlusCircle,
  Copy,
  Check,
  Trash2,
  Edit3,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Layers,
  HelpCircle,
  ArrowLeft,
  Search,
  BookOpen,
  CheckCircle2,
  Download,
  AlertCircle,
  Eye,
  EyeOff,
  Share2,
} from 'lucide-react';
import { SavedQuestionBankItem } from '../types';
import {
  getSavedQuestionBank,
  addQuestionToBank,
  deleteQuestionFromBank,
  updateQuestionInBank,
  resetQuestionBankToDefault,
} from '../utils/storage';
import { Language } from '../utils/i18n';

interface QuestionPaperGeneratorScreenProps {
  language: Language;
  onBack: () => void;
}

export const QuestionPaperGeneratorScreen: React.FC<QuestionPaperGeneratorScreenProps> = ({
  language,
  onBack,
}) => {
  // Active Tab: 'generator' | 'manage'
  const [activeTab, setActiveTab] = useState<'generator' | 'manage'>('generator');

  // Stored questions from local storage
  const [bankQuestions, setBankQuestions] = useState<SavedQuestionBankItem[]>(() =>
    getSavedQuestionBank()
  );

  // ----------------------------------------------------
  // GENERATOR STATE
  // ----------------------------------------------------
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [requestedCount, setRequestedCount] = useState<number>(10);
  const [examTitle, setExamTitle] = useState<string>('ডুয়েট স্পেশাল মডেল টেস্ট');
  const [examSubtitle, setExamSubtitle] = useState<string>('ভর্তি প্রস্তুতি ও চ্যাপ্টারভিত্তিক মূল্যায়ন পরীক্ষা');
  const [examTime, setExamTime] = useState<string>('৬০ মিনিট');
  const [instituteName, setInstituteName] = useState<string>('Admix • ডুয়েট ভর্তি কেয়ার');

  // Generated Paper State
  const [generatedQuestions, setGeneratedQuestions] = useState<SavedQuestionBankItem[]>([]);
  const [showPaper, setShowPaper] = useState<boolean>(false);
  const [showSolutions, setShowSolutions] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // ----------------------------------------------------
  // QUESTION FORM STATE (for adding new questions)
  // ----------------------------------------------------
  const [newChapter, setNewChapter] = useState<string>('');
  const [newType, setNewType] = useState<string>('গাণিতিক সমস্যা');
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [newMarks, setNewMarks] = useState<number>(5);
  const [newSolution, setNewSolution] = useState<string>('');
  const [newSubject, setNewSubject] = useState<string>('পদার্থবিজ্ঞান');
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterChapter, setFilterChapter] = useState<string>('all');
  const [formSuccessMessage, setFormSuccessMessage] = useState<string>('');
  const [notice, setNotice] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Auto-dismiss notice after 4 seconds
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  // Extract all unique chapters & types present in the question bank
  const allAvailableChapters = useMemo(() => {
    const set = new Set<string>();
    bankQuestions.forEach((q) => {
      if (q.chapter?.trim()) set.add(q.chapter.trim());
    });
    return Array.from(set).sort();
  }, [bankQuestions]);

  const allAvailableTypes = useMemo(() => {
    const set = new Set<string>();
    bankQuestions.forEach((q) => {
      if (q.type?.trim()) set.add(q.type.trim());
    });
    return Array.from(set).sort();
  }, [bankQuestions]);

  // Common quick suggestion chips for adding questions
  const commonChapters = [
    'ভেক্টর',
    'গতিবিদ্যা',
    'কাজ-ক্ষমতা-শক্তি',
    'মহাকর্ষ ও অভিকর্ষ',
    'স্থিতিস্থাপকতা',
    'তাপ ও তাপগতিবিদ্যা',
    'জারণ-বিজারণ',
    'পর্যায়বৃত্ত ধর্ম',
    'রাসায়নিক বন্ধন ও সংকেত',
    'জৈব রসায়ন',
    'তড়িৎ রসায়ন',
    'ডিফারেনশিয়েশন',
    'ইন্টিগ্রেশন',
    'ত্রিকোণমিতি',
    'স্ট্রেন্থ অব মেটেরিয়ালস',
    'সার্ভেয়িং',
  ];

  const commonTypes = [
    'গাণিতিক সমস্যা',
    'সংক্ষিপ্ত প্রশ্ন',
    'থিওরি / রচনামূলক',
    'বহুনির্বাচনী / MCQ',
    'সংজ্ঞা ও সূত্র',
  ];

  // Questions matching the currently selected chapters & types
  const matchingPool = useMemo(() => {
    return bankQuestions.filter((q) => {
      const matchChapter =
        selectedChapters.length === 0 || selectedChapters.includes(q.chapter);
      const matchType =
        selectedTypes.length === 0 || selectedTypes.includes(q.type);
      return matchChapter && matchType;
    });
  }, [bankQuestions, selectedChapters, selectedTypes]);

  // Handle Chapter selection toggle
  const toggleChapter = (chapter: string) => {
    setSelectedChapters((prev) =>
      prev.includes(chapter) ? prev.filter((c) => c !== chapter) : [...prev, chapter]
    );
  };

  // Handle Type selection toggle
  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Select all or clear chapters
  const toggleAllChapters = () => {
    if (selectedChapters.length === allAvailableChapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters([...allAvailableChapters]);
    }
  };

  // Select all or clear types
  const toggleAllTypes = () => {
    if (selectedTypes.length === allAvailableTypes.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes([...allAvailableTypes]);
    }
  };

  // Fisher-Yates Shuffle
  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // CREATE QUESTION PAPER HANDLER
  const handleCreatePaper = () => {
    if (matchingPool.length === 0) {
      setNotice({
        type: 'error',
        text: 'নির্বাচিত অধ্যায় বা টাইপ অনুযায়ী প্রশ্ন ব্যাংকে কোনো প্রশ্ন পাওয়া যায়নি।',
      });
      return;
    }
    const count = Math.max(1, Math.min(requestedCount, matchingPool.length));
    const shuffled = shuffle(matchingPool);
    const selected = shuffled.slice(0, count);
    setGeneratedQuestions(selected);
    setShowPaper(true);
    setShowSolutions(false);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SAVE OR UPDATE QUESTION
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapter.trim() || !newQuestionText.trim() || !newType.trim()) {
      setNotice({
        type: 'error',
        text: 'অনুগ্রহ করে অধ্যায়ের নাম, প্রশ্নের ধরন এবং মূল প্রশ্ন লিখুন।',
      });
      return;
    }

    if (isEditingId) {
      const existing = bankQuestions.find((q) => q.id === isEditingId);
      if (existing) {
        const updated: SavedQuestionBankItem = {
          ...existing,
          chapter: newChapter.trim(),
          type: newType.trim(),
          questionText: newQuestionText.trim(),
          marks: Number(newMarks) || 5,
          solution: newSolution.trim() || undefined,
          subject: newSubject.trim() || undefined,
        };
        updateQuestionInBank(updated);
        setBankQuestions(getSavedQuestionBank());
        setIsEditingId(null);
        setNotice({
          type: 'success',
          text: 'প্রশ্নটি সফলভাবে আপডেট করা হয়েছে!',
        });
      }
    } else {
      addQuestionToBank({
        chapter: newChapter.trim(),
        type: newType.trim(),
        questionText: newQuestionText.trim(),
        marks: Number(newMarks) || 5,
        solution: newSolution.trim() || undefined,
        subject: newSubject.trim() || undefined,
      });
      setBankQuestions(getSavedQuestionBank());
      setNotice({
        type: 'success',
        text: 'নতুন প্রশ্ন ব্রাউজার স্টোরেজে সফলভাবে সংরক্ষণ করা হয়েছে!',
      });
    }

    // Reset Form fields
    setNewQuestionText('');
    setNewSolution('');
  };

  // EDIT QUESTION
  const handleStartEdit = (q: SavedQuestionBankItem) => {
    setIsEditingId(q.id);
    setNewChapter(q.chapter);
    setNewType(q.type);
    setNewQuestionText(q.questionText);
    setNewMarks(q.marks || 5);
    setNewSolution(q.solution || '');
    setNewSubject(q.subject || 'পদার্থবিজ্ঞান');
    setActiveTab('manage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // DELETE QUESTION
  const handleConfirmDelete = (id: string) => {
    deleteQuestionFromBank(id);
    setBankQuestions(getSavedQuestionBank());
    setDeleteConfirmId(null);
    setNotice({
      type: 'info',
      text: 'প্রশ্নটি স্টোরেজ থেকে মুছে ফেলা হয়েছে।',
    });
  };

  // RESET TO DEFAULT SEED
  const handleConfirmResetSeeds = () => {
    const reset = resetQuestionBankToDefault();
    setBankQuestions(reset);
    setShowResetConfirm(false);
    setNotice({
      type: 'success',
      text: 'ডিফল্ট ২৫টি প্রশ্ন সফলভাবে রিস্টোর করা হয়েছে!',
    });
  };

  // PRINT / SAVE AS PDF
  const handlePrint = () => {
    window.print();
  };

  // COPY QUESTION PAPER TEXT
  const handleCopyPaper = () => {
    const text = [
      `${instituteName}`,
      `${examTitle} • ${examSubtitle}`,
      `সময়: ${examTime} | মোট প্রশ্ন: ${generatedQuestions.length}টি | পূর্ণমান: ${totalMarks} নম্বর`,
      `নির্দেশনা: সকল প্রশ্নের উত্তর দেওয়া আবশ্যক। ডানপাশের সংখ্যা প্রশ্নের পূর্ণমান নির্দেশ করে।`,
      '-------------------------------------------------------',
      ...generatedQuestions.map(
        (q, idx) =>
          `প্রশ্ন ${toBengaliNumber(idx + 1)}. [অধ্যায়: ${q.chapter} | ${q.type}] (মান: ${q.marks || 5})\n${q.questionText}\n`
      ),
      showSolutions
        ? '\n\n--- উত্তর ও সমাধান সংক্ষেপ ---\n' +
          generatedQuestions
            .map(
              (q, idx) =>
                `উত্তর ${toBengaliNumber(idx + 1)}: ${q.solution || 'সমাধান সংযোজিত নেই।'}`
            )
            .join('\n\n')
        : '',
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Convert numbers to Bengali digits
  const toBengaliNumber = (num: number): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num
      .toString()
      .split('')
      .map((d) => (/\d/.test(d) ? bengaliDigits[Number(d)] : d))
      .join('');
  };

  // Calculate total marks of generated paper
  const totalMarks = useMemo(() => {
    return generatedQuestions.reduce((acc, curr) => acc + (curr.marks || 5), 0);
  }, [generatedQuestions]);

  // Filtered bank list for management tab
  const filteredBankList = useMemo(() => {
    return bankQuestions.filter((q) => {
      const matchSearch =
        !searchTerm.trim() ||
        q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.chapter.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.solution && q.solution.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchChapter =
        filterChapter === 'all' || q.chapter === filterChapter;
      return matchSearch && matchChapter;
    });
  }, [bankQuestions, searchTerm, filterChapter]);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      {/* Top Navigation & Header */}
      <div className="no-print flex items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-200 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer flex-shrink-0"
            title="ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-emerald-950 truncate">
                প্রশ্ন ব্যাংক ও প্রশ্নপত্র জেনারেটর
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                PDF সেভ
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/80">
              অধ্যায় ও টাইপ সিলেক্ট করে তাৎক্ষণিক র‍্যান্ডম প্রশ্নপত্র তৈরি ও PDF ডাউনলোড
            </p>
          </div>
        </div>

        {/* Global Stats Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>মোট প্রশ্ন: {bankQuestions.length}টি</span>
        </div>
      </div>

      {/* Notice / Feedback Banner */}
      {notice && (
        <div
          className={`no-print p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold border animate-in fade-in-50 ${
            notice.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
              : 'bg-blue-50 text-blue-950 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle
              className={`w-4 h-4 flex-shrink-0 ${
                notice.type === 'error' ? 'text-rose-600' : 'text-emerald-600'
              }`}
            />
            <span>{notice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer font-bold px-1.5 py-0.5 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="no-print p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2.5 animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-bold">
              আপনি কি ডিফল্ট ২৫টি প্রশ্ন পুনরায় লোড করতে চান? আপনার কাস্টম প্রশ্নগুলো ডিফল্ট ডেটায় প্রতিস্থাপিত হবে।
            </p>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-xs font-bold text-amber-900 hover:bg-amber-100 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleConfirmResetSeeds}
              className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs cursor-pointer"
            >
              হ্যাঁ, রিস্টোর করুন
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Switcher */}
      <div className="no-print grid grid-cols-2 gap-1.5 p-1 bg-emerald-50 rounded-2xl border border-emerald-200">
        <button
          type="button"
          onClick={() => {
            setActiveTab('generator');
            setShowPaper(false);
          }}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'generator'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-900 hover:bg-emerald-100/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>প্রশ্নপত্র তৈরি করুন (Generator)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('manage')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'manage'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-900 hover:bg-emerald-100/60'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>প্রশ্ন সেভ ও ব্যাংক ({bankQuestions.length}টি)</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: QUESTION PAPER GENERATOR & PDF CREATOR
      ========================================================================= */}
      {activeTab === 'generator' && !showPaper && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-5">
            {/* 1. Header with instructions */}
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                <Sparkles className="w-5 h-5 text-emerald-700" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-emerald-950">
                  কাস্টম প্রশ্নপত্র তৈরি করুন
                </h2>
                <p className="text-xs text-emerald-700/80">
                  নিচে এক বা একাধিক অধ্যায় এবং টাইপ নির্বাচন করে প্রশ্নের সংখ্যা লিখে ‘তৈরি করুন’ এ ক্লিক করুন।
                </p>
              </div>
            </div>

            {/* 2. Chapter Selection (Multi-select) */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>১. অধ্যায় নির্বাচন করুন ({selectedChapters.length > 0 ? `${selectedChapters.length}টি সিলেক্টেড` : 'সবগুলো অন্তর্ভুক্ত'}):</span>
                </label>
                <button
                  type="button"
                  onClick={toggleAllChapters}
                  className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  {selectedChapters.length === allAvailableChapters.length
                    ? 'সব আনসিলেক্ট করুন'
                    : 'সব অধ্যায় সিলেক্ট করুন'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {allAvailableChapters.map((ch) => {
                  const isSelected = selectedChapters.includes(ch);
                  const count = bankQuestions.filter((q) => q.chapter === ch).length;
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChapter(ch)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs scale-102'
                          : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-100/60'
                      }`}
                    >
                      <span>{ch}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelected ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Type Selection (Multi-select) */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  <span>২. প্রশ্নের ধরন / টাইপ নির্বাচন ({selectedTypes.length > 0 ? `${selectedTypes.length}টি সিলেক্টেড` : 'সব টাইপ অন্তর্ভুক্ত'}):</span>
                </label>
                <button
                  type="button"
                  onClick={toggleAllTypes}
                  className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  {selectedTypes.length === allAvailableTypes.length
                    ? 'সব আনসিলেক্ট করুন'
                    : 'সব টাইপ সিলেক্ট করুন'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {allAvailableTypes.map((tp) => {
                  const isSelected = selectedTypes.includes(tp);
                  const count = bankQuestions.filter((q) => q.type === tp).length;
                  return (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => toggleType(tp)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs scale-102'
                          : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-100/60'
                      }`}
                    >
                      <span>{tp}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelected ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Number of Questions & Exam Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Question Count */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-950">
                    ৩. প্রশ্নের সংখ্যা (কতগুলো প্রশ্ন তৈরি হবে):
                  </label>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900">
                    পাওয়া গেছে {matchingPool.length}টি
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={matchingPool.length || 1}
                    value={requestedCount}
                    onChange={(e) => setRequestedCount(Math.max(1, Number(e.target.value)))}
                    className="w-24 px-3 py-2 rounded-xl bg-white border border-emerald-300 text-sm font-extrabold text-emerald-950 font-mono text-center focus:outline-none focus:border-emerald-600"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[5, 10, 15, 20, matchingPool.length].map((num) => {
                      if (num <= 0) return null;
                      const isAll = num === matchingPool.length;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRequestedCount(Math.min(num, matchingPool.length))}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            requestedCount === Math.min(num, matchingPool.length)
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                              : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {isAll ? `সব (${matchingPool.length})` : `${num}টি`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Title & Time customization */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                <label className="text-xs font-bold text-emerald-950 block">
                  পরীক্ষার শিরোনাম ও সময় (প্রশ্নপত্রের হেডার):
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="পরীক্ষার নাম (যেমন: ডুয়েট মডেল টেস্ট)"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-950 focus:outline-none focus:border-emerald-600"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={examTime}
                      onChange={(e) => setExamTime(e.target.value)}
                      placeholder="সময় (যেমন: ৬০ মিনিট)"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-950 focus:outline-none focus:border-emerald-600"
                    />
                    <input
                      type="text"
                      value={instituteName}
                      onChange={(e) => setInstituteName(e.target.value)}
                      placeholder="প্রতিষ্ঠানের নাম"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-950 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <button
              type="button"
              onClick={handleCreatePaper}
              disabled={matchingPool.length === 0}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-5 h-5" />
              <span>
                প্রশ্নপত্র তৈরি করুন ({Math.min(requestedCount, matchingPool.length)}টি র‍্যান্ডম প্রশ্ন)
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          GENERATED QUESTION PAPER VIEW & PDF PRINTABLE
      ========================================================================= */}
      {activeTab === 'generator' && showPaper && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          {/* Action Toolbar (Hidden during print) */}
          <div className="no-print p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPaper(false)}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ফিল্টার পরিবর্তন</span>
              </button>

              <button
                type="button"
                onClick={handleCreatePaper}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
                title="একই ফিল্টারে আবার নতুন র‍্যান্ডম প্রশ্ন তৈরি করুন"
              >
                <RotateCcw className="w-4 h-4" />
                <span>নতুন র‍্যান্ডম প্রশ্ন</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowSolutions((prev) => !prev)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  showSolutions
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                    : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {showSolutions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showSolutions ? 'সমাধান লুকান' : 'সমাধানসহ দেখুন'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPaper}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'কপি হয়েছে!' : 'টেক্সট কপি'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>PDF সেভ / প্রিন্ট করুন</span>
              </button>
            </div>
          </div>

          {/* Printable Question Paper Document */}
          <div
            id="printable-question-paper"
            className="p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-6 font-['Hind_Siliguri',serif]"
          >
            {/* Exam Header */}
            <div className="text-center border-b-2 border-emerald-900/40 pb-5 space-y-1">
              <h2 className="text-sm font-bold tracking-wider text-emerald-900 uppercase">
                {instituteName}
              </h2>
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950">
                {examTitle}
              </h1>
              <p className="text-xs font-semibold text-emerald-800">
                {examSubtitle}
              </p>

              <div className="flex items-center justify-between text-xs font-bold text-emerald-950 pt-3 border-t border-dashed border-emerald-300 mt-2 px-2">
                <span>সময়: {examTime}</span>
                <span>মোট প্রশ্ন: {toBengaliNumber(generatedQuestions.length)}টি</span>
                <span>পূর্ণমান: {toBengaliNumber(totalMarks)} নম্বর</span>
              </div>
            </div>

            {/* Instruction Notice */}
            <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center text-xs font-semibold text-emerald-900 italic">
              * সকল প্রশ্নের উত্তর দেওয়া আবশ্যক। ডানপাশের সংখ্যা প্রশ্নের পূর্ণমান নির্দেশ করে। *
            </div>

            {/* Questions List */}
            <div className="space-y-5 divide-y divide-emerald-100">
              {generatedQuestions.map((q, idx) => (
                <div key={q.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm sm:text-base font-extrabold text-emerald-950 font-mono flex-shrink-0">
                          {toBengaliNumber(idx + 1)}.
                        </span>
                        <div className="text-sm sm:text-base font-bold text-emerald-950 leading-relaxed">
                          {q.questionText}
                        </div>
                      </div>

                      {/* Tagging info (Chapter & Type) */}
                      <div className="flex items-center gap-2 pl-6 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          অধ্যায়: {q.chapter}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200">
                          ধরন: {q.type}
                        </span>
                        {q.subject && (
                          <span className="text-[10px] font-semibold text-emerald-700">
                            • {q.subject}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-emerald-900 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 font-mono">
                        [{toBengaliNumber(q.marks || 5)}]
                      </span>
                    </div>
                  </div>

                  {/* Solution if toggled on */}
                  {showSolutions && q.solution && (
                    <div className="ml-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1 animate-in fade-in-50">
                      <div className="font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>সমাধান / ব্যাখ্যা:</span>
                      </div>
                      <p className="whitespace-pre-line leading-relaxed font-sans font-medium text-emerald-900">
                        {q.solution}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Document Footer */}
            <div className="pt-6 border-t border-emerald-200 flex items-center justify-between text-[11px] text-emerald-700/80">
              <span>প্রস্তুতকারক: DUET Admission Exam Engine</span>
              <span>তারিখ: {new Date().toLocaleDateString('bn-BD')}</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: QUESTION BANK MANAGEMENT (SAVE QUESTIONS TO STORAGE)
      ========================================================================= */}
      {activeTab === 'manage' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          {/* Question Add / Edit Form */}
          <form
            onSubmit={handleSaveQuestion}
            className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <PlusCircle className="w-5 h-5 text-emerald-700" />
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-emerald-950">
                    {isEditingId ? 'প্রশ্ন এডিট করুন' : 'নতুন প্রশ্ন সেভ করুন (Add Question)'}
                  </h2>
                  <p className="text-xs text-emerald-700/80">
                    প্রশ্নের ডিটেইলস হিসাবে অধ্যায়ের নাম, টাইপ ও নম্বর দিয়ে ব্রাউজার স্টোরেজে সংরক্ষণ করুন
                  </p>
                </div>
              </div>

              {isEditingId && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingId(null);
                    setNewQuestionText('');
                    setNewSolution('');
                  }}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  বাতিল করুন
                </button>
              )}
            </div>

            {formSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{formSuccessMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Chapter Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-950 block">
                  অধ্যায়ের নাম * :
                </label>
                <input
                  type="text"
                  required
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  placeholder="যেমন: ভেক্টর, গতিবিদ্যা, জারণ-বিজারণ"
                  className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 placeholder-emerald-700/50 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Question Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-950 block">
                  প্রশ্নের টাইপ * :
                </label>
                <input
                  type="text"
                  required
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="যেমন: গাণিতিক সমস্যা, সংক্ষিপ্ত, MCQ"
                  className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 placeholder-emerald-700/50 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Marks & Subject */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-950 block">
                    পূর্ণমান / নম্বর:
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={1}
                    value={newMarks}
                    onChange={(e) => setNewMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 font-mono text-center focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-950 block">
                    বিষয়:
                  </label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="পদার্থ / গণিত / রসায়ন"
                    className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 placeholder-emerald-700/50 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Quick Suggestion Chips for Chapter & Type */}
            <div className="space-y-2 pt-1 border-t border-emerald-100">
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="font-bold text-emerald-800">জনপ্রিয় অধ্যায়:</span>
                {commonChapters.slice(0, 8).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setNewChapter(ch)}
                    className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer"
                  >
                    {ch}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="font-bold text-emerald-800">সাধারণ টাইপ:</span>
                {commonTypes.map((tp) => (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => setNewType(tp)}
                    className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer"
                  >
                    {tp}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-950 block">
                মূল প্রশ্ন (Question Text) * :
              </label>
              <textarea
                required
                rows={3}
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="এখানে সম্পূর্ণ প্রশ্নটি লিখুন বা পেস্ট করুন..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 placeholder-emerald-700/50 focus:outline-none focus:border-emerald-600 leading-relaxed"
              />
            </div>

            {/* Solution / Explanation Textarea (Optional) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-950 flex items-center justify-between">
                <span>উত্তর বা সমাধান (ঐচ্ছিক / Solution):</span>
                <span className="text-[10px] text-emerald-700 font-normal">
                  প্রশ্নপত্রের সাথে উত্তরের শিট দেখতে সহায়ক
                </span>
              </label>
              <textarea
                rows={2}
                value={newSolution}
                onChange={(e) => setNewSolution(e.target.value)}
                placeholder="প্রশ্নের সমাধান, গাণিতিক ধাপ বা উত্তর সংক্ষেপ..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 placeholder-emerald-700/50 focus:outline-none focus:border-emerald-600 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isEditingId ? 'পরিবর্তন সংরক্ষণ করুন' : 'ব্রাউজার স্টোরেজে প্রশ্ন সেভ করুন'}</span>
            </button>
          </form>

          {/* Stored Question Bank List */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-emerald-950">
                  সংরক্ষিত প্রশ্ন ভাণ্ডার ({bankQuestions.length}টি)
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-950 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ডিফল্ট প্রশ্ন রিস্টোর করুন</span>
              </button>
            </div>

            {/* Search and Chapter Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="প্রশ্ন বা সমাধান সার্চ করুন..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <select
                value={filterChapter}
                onChange={(e) => setFilterChapter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs font-semibold text-emerald-950 focus:outline-none focus:border-emerald-600"
              >
                <option value="all">সব অধ্যায় ({bankQuestions.length})</option>
                {allAvailableChapters.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch} ({bankQuestions.filter((q) => q.chapter === ch).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Question Cards */}
            <div className="space-y-3">
              {filteredBankList.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white border border-emerald-200/90 hover:border-emerald-400 shadow-2xs transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                        অধ্যায়: {item.chapter}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                        {item.type}
                      </span>
                      {item.subject && (
                        <span className="text-[11px] font-semibold text-emerald-700">
                          {item.subject}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
                        {item.marks || 5} নম্বর
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 hover:text-emerald-950 transition-colors cursor-pointer"
                        title="এডিট করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200 animate-in fade-in-50">
                          <span className="text-[10px] font-bold text-red-700 px-1">মুছবেন?</span>
                          <button
                            type="button"
                            onClick={() => handleConfirmDelete(item.id)}
                            className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 cursor-pointer"
                          >
                            হ্যাঁ
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1.5 py-0.5 rounded bg-white text-gray-700 text-[10px] font-bold border border-gray-200 hover:bg-gray-50 cursor-pointer"
                          >
                            না
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-emerald-950 leading-relaxed">
                    {item.questionText}
                  </p>

                  {item.solution && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-900 leading-relaxed font-sans">
                      <strong className="text-emerald-800">সমাধান: </strong>
                      <span className="whitespace-pre-line">{item.solution}</span>
                    </div>
                  )}
                </div>
              ))}

              {filteredBankList.length === 0 && (
                <div className="p-8 text-center text-xs text-emerald-700 bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-200">
                  কোনো প্রশ্ন পাওয়া যায়নি। উপরে নতুন প্রশ্ন যোগ করুন।
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
