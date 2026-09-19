import React, { useState } from 'react';
import { Question, SubjectType, DepartmentType } from '../types';
import { translations, Language } from '../utils/i18n';
import {
  saveCustomQuestion,
  deleteCustomQuestion,
  saveBatchCustomQuestions,
} from '../utils/storage';
import {
  auth,
  saveCustomQuestionToCloud,
  deleteCustomQuestionFromCloud,
  saveBatchCustomQuestionsToCloud,
} from '../firebase';
import {
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Upload,
  FileText,
  ListPlus,
  HelpCircle,
  Tag,
  Cloud,
  CloudCheck,
  RefreshCw,
  LogIn,
} from 'lucide-react';

interface QuizImportScreenProps {
  questions: Question[];
  language: Language;
  onRefreshQuestions: () => void;
  customQuestions: Question[];
  userId?: string;
  onOpenAuth?: () => void;
  onSyncCloud?: () => Promise<void>;
}

export const QuizImportScreen: React.FC<QuizImportScreenProps> = ({
  questions,
  language,
  onRefreshQuestions,
  customQuestions,
  userId,
  onOpenAuth,
  onSyncCloud,
}) => {
  const t = translations[language];

  // Category: 'department' or 'non_department'
  const [categoryType, setCategoryType] = useState<'department' | 'non_department'>('department');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('civil');
  const [department, setDepartment] = useState<DepartmentType>('civil');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBatchImporting, setIsBatchImporting] = useState(false);

  // Active User ID for Cloud Storage operations
  const activeUserId = userId || auth.currentUser?.uid;

  // Question & Options inputs
  const [questionBn, setQuestionBn] = useState('');
  const [questionEn, setQuestionEn] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [explanationBn, setExplanationBn] = useState('');

  // Validation errors list
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Batch JSON import modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [batchError, setBatchError] = useState<string | null>(null);

  // When category changes, set subject appropriately
  const handleCategoryChange = (cat: 'department' | 'non_department') => {
    setCategoryType(cat);
    if (cat === 'department') {
      setSelectedSubject('civil');
    } else {
      setSelectedSubject('math');
    }
  };

  // Rigorous validation logic as requested by user
  const validateForm = (): string[] => {
    const errList: string[] = [];

    // 1. Question text validation
    if (!questionBn.trim()) {
      errList.push(
        language === 'bn'
          ? 'প্রশ্নের বিবরণ খালি রাখা যাবে না।'
          : 'Question text in Bengali cannot be blank.'
      );
    } else if (questionBn.trim().length < 5) {
      errList.push(
        language === 'bn'
          ? 'প্রশ্নের বিবরণ অন্তত ৫ অক্ষরের হতে হবে।'
          : 'Question text must be at least 5 characters long.'
      );
    }

    // 2. Check for duplicate question in bank
    const duplicateQuestion = questions.find(
      (q) => q.questionBn.trim().toLowerCase() === questionBn.trim().toLowerCase()
    );
    if (duplicateQuestion) {
      errList.push(
        language === 'bn'
          ? 'এই প্রশ্নটি ইতিমধ্যে প্রশ্ন ভাণ্ডারে বিদ্যমান রয়েছে।'
          : 'This question already exists in the question bank.'
      );
    }

    // 3. 4 Options validation
    const trimmedOpts = [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()];
    const optLabels = ['ক (A)', 'খ (B)', 'গ (C)', 'ঘ (D)'];

    trimmedOpts.forEach((opt, idx) => {
      if (!opt) {
        errList.push(
          language === 'bn'
            ? `অপশন ${optLabels[idx]} এর বিবরণ খালি রাখা যাবে না।`
            : `Option ${optLabels[idx]} cannot be blank.`
        );
      }
    });

    // 4. Duplicate option text validation (e.g. Option A == Option B)
    if (trimmedOpts.every((o) => o.length > 0)) {
      const uniqueOpts = new Set(trimmedOpts.map((o) => o.toLowerCase()));
      if (uniqueOpts.size < 4) {
        errList.push(
          language === 'bn'
            ? 'অপশনগুলোর মধ্যে মিল রয়েছে। ৪টি অপশন অবশ্যই ভিন্ন ভিন্ন হতে হবে।'
            : 'Duplicate options detected. All 4 options must be distinct.'
        );
      }
    }

    // 5. Correct answer selected validation
    if (correctAnswer === null || correctAnswer < 0 || correctAnswer > 3) {
      errList.push(
        language === 'bn'
          ? 'অবশ্যই সঠিক উত্তরটি (ক, খ, গ, অথবা ঘ) নির্বাচন করতে হবে।'
          : 'You must select one option as the correct answer.'
      );
    }

    return errList;
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setSuccessMessage(null);
      // Scroll to top of form
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setErrors([]);
    setIsSaving(true);

    const newQuestion: Question = {
      id: `custom-q-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      category: categoryType,
      department: department,
      subject: selectedSubject,
      questionBn: questionBn.trim(),
      questionEn: questionEn.trim() || undefined,
      optionsBn: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
      correctAnswer: correctAnswer!,
      explanationBn: explanationBn.trim() || undefined,
      isCustom: true,
      createdAt: Date.now(),
    };

    try {
      // 1. Always save locally immediately
      saveCustomQuestion(newQuestion);

      // 2. Save to Cloud Firestore if user is authenticated
      if (activeUserId) {
        const cloudRes = await saveCustomQuestionToCloud(activeUserId, newQuestion);
        if (cloudRes.success) {
          setSuccessMessage(
            language === 'bn'
              ? 'প্রশ্নটি সফলভাবে ফায়ারবেস ক্লাউড ডাটাবেস ও এই ডিভাইসে সংরক্ষিত হয়েছে!'
              : 'Question successfully saved to Firebase Cloud Database and local storage!'
          );
        } else {
          setSuccessMessage(
            language === 'bn'
              ? `প্রশ্নটি ডিভাইসে সেভ হয়েছে, কিন্তু ক্লাউড ডাটাবেস সতর্কবার্তা: ${cloudRes.error}`
              : `Saved locally, but cloud warning: ${cloudRes.error}`
          );
        }
      } else {
        setSuccessMessage(
          language === 'bn'
            ? 'প্রশ্নটি আপনার ডিভাইসের লোকাল মেমরিতে সেভ হয়েছে। ক্লাউড ডাটাবেসে সেভ করতে অনুগ্রহ করে লগইন করুন।'
            : 'Question saved to local device. Please sign in to sync with cloud database.'
        );
      }

      onRefreshQuestions();

      // Reset inputs
      setQuestionBn('');
      setQuestionEn('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectAnswer(null);
      setExplanationBn('');
    } catch (err: any) {
      console.error('Save question error:', err);
      setErrors([err?.message || 'Failed to save question']);
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  };

  const handleDelete = async (id: string) => {
    deleteCustomQuestion(id);
    if (activeUserId) {
      await deleteCustomQuestionFromCloud(activeUserId, id);
    }
    onRefreshQuestions();
  };

  // Batch import handler with flexible parsing and cloud batch save
  const handleBatchImport = async () => {
    try {
      setBatchError(null);
      setIsBatchImporting(true);

      let parsed: any;
      try {
        parsed = JSON.parse(jsonInput);
      } catch {
        throw new Error(
          language === 'bn'
            ? 'ভুল JSON ফরম্যাট! অনুগ্রহ করে সঠিক JSON কোড পেস্ট করুন।'
            : 'Invalid JSON format. Please paste valid JSON.'
        );
      }

      if (!Array.isArray(parsed)) {
        throw new Error(
          language === 'bn'
            ? 'JSON অবশ্যই একটি অ্যারে (Array [...]) হতে হবে।'
            : 'JSON must be an array of questions.'
        );
      }

      if (parsed.length === 0) {
        throw new Error(
          language === 'bn'
            ? 'অ্যারেতে কোনো প্রশ্ন পাওয়া যায়নি।'
            : 'No questions found in the JSON array.'
        );
      }

      const formattedQuestions: Question[] = [];

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (!item || typeof item !== 'object') continue;

        const qBn = item.questionBn || item.question || item.title || item.questionText;
        if (!qBn || typeof qBn !== 'string' || !qBn.trim()) {
          throw new Error(
            language === 'bn'
              ? `প্রশ্ন নং ${i + 1}-এ কোনো প্রশ্নের বিবরণ (questionBn) নেই।`
              : `Question #${i + 1} is missing questionBn.`
          );
        }

        const rawOptions = item.optionsBn || item.options || item.choices;
        if (!Array.isArray(rawOptions) || rawOptions.length !== 4) {
          throw new Error(
            language === 'bn'
              ? `প্রশ্ন নং ${i + 1}-এ অবশ্যই ঠিক ৪টি অপশন (optionsBn) থাকতে হবে।`
              : `Question #${i + 1} must have exactly 4 options in optionsBn.`
          );
        }

        const cleanOptions = rawOptions.map((o) => String(o || '').trim());
        if (cleanOptions.some((o) => !o)) {
          throw new Error(
            language === 'bn'
              ? `প্রশ্ন নং ${i + 1}-এ কোনো অপশন ফাঁকা রাখা যাবে না।`
              : `Question #${i + 1} has empty options.`
          );
        }

        // Correct Answer normalization
        let ansIdx = 0;
        const rawAns = item.correctAnswer ?? item.answer ?? item.correct;
        if (typeof rawAns === 'number' && rawAns >= 0 && rawAns <= 3) {
          ansIdx = Math.floor(rawAns);
        } else if (typeof rawAns === 'string') {
          const trimmed = rawAns.trim().toUpperCase();
          if (trimmed === 'A' || trimmed === 'ক' || trimmed === '0') ansIdx = 0;
          else if (trimmed === 'B' || trimmed === 'খ' || trimmed === '1') ansIdx = 1;
          else if (trimmed === 'C' || trimmed === 'গ' || trimmed === '2') ansIdx = 2;
          else if (trimmed === 'D' || trimmed === 'ঘ' || trimmed === '3') ansIdx = 3;
          else {
            const foundIdx = cleanOptions.indexOf(rawAns.trim());
            if (foundIdx !== -1) ansIdx = foundIdx;
          }
        }

        formattedQuestions.push({
          id: `batch-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          category: item.category === 'non_department' ? 'non_department' : categoryType,
          department: (item.department as DepartmentType) || department,
          subject: (item.subject as SubjectType) || selectedSubject,
          questionBn: qBn.trim(),
          questionEn: item.questionEn || item.question_en || '',
          optionsBn: [cleanOptions[0], cleanOptions[1], cleanOptions[2], cleanOptions[3]],
          correctAnswer: ansIdx,
          explanationBn: item.explanationBn || item.explanation || '',
          isCustom: true,
          createdAt: Date.now(),
        });
      }

      // Save locally
      saveBatchCustomQuestions(formattedQuestions);

      // Save to Cloud Firestore
      if (activeUserId) {
        const cloudRes = await saveBatchCustomQuestionsToCloud(activeUserId, formattedQuestions);
        if (cloudRes.success) {
          setSuccessMessage(
            language === 'bn'
              ? `একসাথে ${formattedQuestions.length} টি প্রশ্ন সফলভাবে ক্লাউড ডাটাবেস ও এই ডিভাইসে যুক্ত হয়েছে!`
              : `Successfully imported ${formattedQuestions.length} questions to Firebase Cloud Database!`
          );
        } else {
          setSuccessMessage(
            language === 'bn'
              ? `${formattedQuestions.length} টি প্রশ্ন ডিভাইসে যুক্ত হয়েছে, কিন্তু ক্লাউড সমস্যা: ${cloudRes.error}`
              : `${formattedQuestions.length} questions imported locally, cloud error: ${cloudRes.error}`
          );
        }
      } else {
        setSuccessMessage(
          language === 'bn'
            ? `${formattedQuestions.length} টি প্রশ্ন লোকাল ডিভাইসে সফলভাবে ইমপোর্ট হয়েছে। ক্লাউড ডাটাবেসে ব্যাকআপ রাখতে দয়া করে লগইন করুন।`
            : `${formattedQuestions.length} questions imported locally. Sign in to sync with cloud database.`
        );
      }

      onRefreshQuestions();
      setShowBatchModal(false);
      setJsonInput('');
    } catch (err: any) {
      setBatchError(err.message || 'Invalid JSON format.');
    } finally {
      setIsBatchImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-emerald-100 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-emerald-950 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>{t.importTitle}</span>
            </h2>
            {activeUserId ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'bn' ? 'ফায়ারবেস ক্লাউড সক্রিয় (সংযুক্ত)' : 'Firebase Cloud Active (Connected)'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold border border-amber-200">
                <Cloud className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'bn' ? 'গেস্ট মোড (লগইন করা নেই)' : 'Guest Mode (Not Signed In)'}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-emerald-700/80 mt-1">
            {language === 'bn'
              ? 'এখানে যুক্ত করা সমস্ত প্রশ্ন ফায়ারবেস ডাটাবেসে সেভ হবে এবং যেকোনো ফোন বা কম্পিউটার থেকে এক্সেস করা যাবে।'
              : 'All questions added here are saved to the Firebase database and accessible from any phone or computer.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onSyncCloud && (
            <button
              onClick={async () => {
                setIsSyncing(true);
                await onSyncCloud();
                setIsSyncing(false);
              }}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 text-xs font-semibold hover:bg-emerald-50 transition-colors shadow-2xs disabled:opacity-50"
              title="অন্যান্য ফোন থেকে আসা প্রশ্ন সিঙ্ক করুন"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (language === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (language === 'bn' ? 'ক্লাউড সিঙ্ক' : 'Cloud Sync')}</span>
            </button>
          )}

          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>{t.batchImportJson}</span>
          </button>
        </div>
      </div>

      {/* Guest Mode Notice */}
      {!activeUserId && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">
                {language === 'bn' ? 'ক্লাউড ডাটাবেস এ সংরক্ষণের জন্য সাইন ইন প্রয়োজন' : 'Sign In Required for Cloud Database'}
              </p>
              <p className="text-amber-800/90 text-[11px] mt-0.5">
                {language === 'bn'
                  ? 'আপনি বর্তমানে গেস্ট মোডে আছেন। এখন প্রশ্ন সেভ করলে তা শুধু আপনার ব্রাউজারে থাকবে। ফায়ারবেস ক্লাউড ডাটাবেসে সেভ করতে এবং যেকোনো ফোন থেকে এক্সেস করতে অনুগ্রহ করে সাইন ইন করুন।'
                  : 'You are currently in guest mode. Questions will only be saved in this browser. Sign in to save to Firebase Cloud Database.'}
              </p>
            </div>
          </div>
          {onOpenAuth && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
            </button>
          )}
        </div>
      )}

      {/* 2. Success Banner */}
      {successMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 3. Validation Errors Card */}
      {errors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs animate-in fade-in space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-rose-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{t.validationErrors}</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1 text-rose-700">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Question Input Form */}
      <form
        onSubmit={handleSaveQuestion}
        className="p-5 sm:p-7 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-5"
      >
        {/* Step 1: Category Selection (Department vs Non-Department) */}
        <div>
          <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">
            {t.categorySelect} <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleCategoryChange('department')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                categoryType === 'department'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white border-emerald-100 hover:bg-emerald-50/40'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-emerald-950 block">
                  🏛️ {t.deptCategory}
                </span>
                <span className="text-[11px] text-emerald-700/80">
                  সিভিল ইঞ্জিনিয়ারিং বিষয়ভিত্তিক প্রশ্ন
                </span>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  categoryType === 'department'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-emerald-300'
                }`}
              >
                {categoryType === 'department' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange('non_department')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                categoryType === 'non_department'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white border-emerald-100 hover:bg-emerald-50/40'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-emerald-950 block">
                  📚 {t.nonDeptCategory}
                </span>
                <span className="text-[11px] text-emerald-700/80">
                  গণিত, পদার্থবিজ্ঞান, রসায়ন অথবা ইংরেজি
                </span>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  categoryType === 'non_department'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-emerald-300'
                }`}
              >
                {categoryType === 'non_department' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Subject Selector for Non-Department */}
        {categoryType === 'non_department' && (
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <label className="block text-xs font-bold text-emerald-950 mb-2">
              {t.selectSubject} <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'math', label: '📐 গণিত (Math)' },
                { id: 'physics', label: '⚡ পদার্থবিজ্ঞান (Physics)' },
                { id: 'chemistry', label: '🧪 রসায়ন (Chemistry)' },
                { id: 'english', label: '📖 ইংরেজি (English)' },
              ].map((subj) => (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => setSelectedSubject(subj.id as SubjectType)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedSubject === subj.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  {subj.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Question Text */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-emerald-950 mb-1">
              {t.questionTextBn} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={questionBn}
              onChange={(e) => setQuestionBn(e.target.value)}
              placeholder="যেমন: ১ মিটার গভীরতায় পানির হাইড্রোস্ট্যাটিক চাপ কত?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white text-emerald-950 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-800/80 mb-1">
              {t.questionTextEn}
            </label>
            <input
              type="text"
              value={questionEn}
              onChange={(e) => setQuestionEn(e.target.value)}
              placeholder="e.g. What is the hydrostatic pressure of water at 1m depth?"
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white text-emerald-950 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Step 4: 4 Options and Correct Answer Selection */}
        <div className="pt-2 border-t border-emerald-100 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
              {t.optionsSection} <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-emerald-700 font-semibold">
              {t.selectCorrectAnswer}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option A */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                correctAnswer === 0
                  ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                  : 'border-emerald-100 bg-[#f0fdf4]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-950">
                  {t.optionA}
                </span>
                <button
                  type="button"
                  onClick={() => setCorrectAnswer(0)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
                    correctAnswer === 0
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {correctAnswer === 0 ? '✓ সঠিক উত্তর' : 'সঠিক হিসেবে নির্বাচন'}
                </button>
              </div>
              <input
                type="text"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                placeholder="অপশন ক এর উত্তর"
                className="w-full px-3 py-1.5 rounded-lg border border-emerald-200 bg-white text-xs text-emerald-950"
              />
            </div>

            {/* Option B */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                correctAnswer === 1
                  ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                  : 'border-emerald-100 bg-[#f0fdf4]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-950">
                  {t.optionB}
                </span>
                <button
                  type="button"
                  onClick={() => setCorrectAnswer(1)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
                    correctAnswer === 1
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {correctAnswer === 1 ? '✓ সঠিক উত্তর' : 'সঠিক হিসেবে নির্বাচন'}
                </button>
              </div>
              <input
                type="text"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                placeholder="অপশন খ এর উত্তর"
                className="w-full px-3 py-1.5 rounded-lg border border-emerald-200 bg-white text-xs text-emerald-950"
              />
            </div>

            {/* Option C */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                correctAnswer === 2
                  ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                  : 'border-emerald-100 bg-[#f0fdf4]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-950">
                  {t.optionC}
                </span>
                <button
                  type="button"
                  onClick={() => setCorrectAnswer(2)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
                    correctAnswer === 2
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {correctAnswer === 2 ? '✓ সঠিক উত্তর' : 'সঠিক হিসেবে নির্বাচন'}
                </button>
              </div>
              <input
                type="text"
                value={optionC}
                onChange={(e) => setOptionC(e.target.value)}
                placeholder="অপশন গ এর উত্তর"
                className="w-full px-3 py-1.5 rounded-lg border border-emerald-200 bg-white text-xs text-emerald-950"
              />
            </div>

            {/* Option D */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                correctAnswer === 3
                  ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                  : 'border-emerald-100 bg-[#f0fdf4]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-950">
                  {t.optionD}
                </span>
                <button
                  type="button"
                  onClick={() => setCorrectAnswer(3)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
                    correctAnswer === 3
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {correctAnswer === 3 ? '✓ সঠিক উত্তর' : 'সঠিক হিসেবে নির্বাচন'}
                </button>
              </div>
              <input
                type="text"
                value={optionD}
                onChange={(e) => setOptionD(e.target.value)}
                placeholder="অপশন ঘ এর উত্তর"
                className="w-full px-3 py-1.5 rounded-lg border border-emerald-200 bg-white text-xs text-emerald-950"
              />
            </div>
          </div>
        </div>

        {/* Step 5: Optional Explanation */}
        <div>
          <label className="block text-xs font-bold text-emerald-950 mb-1">
            {t.explanationTextBn}
          </label>
          <textarea
            rows={2}
            value={explanationBn}
            onChange={(e) => setExplanationBn(e.target.value)}
            placeholder="প্রশ্নের সমাধান বা সংক্ষিপ্ত সূত্রের ব্যাখ্যা যা পরীক্ষার পর রিভিউতে দেখা যাবে।"
            className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white text-xs text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Submit button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs sm:text-sm font-bold shadow-2xs transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{language === 'bn' ? 'ডাটাবেসে সংরক্ষণ হচ্ছে...' : 'Saving to Database...'}</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>{t.saveQuestionBtn}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 5. Custom Question Manager (List of user-imported questions) */}
      {customQuestions.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <ListPlus className="w-4 h-4 text-emerald-600" />
              <span>আপনার যুক্ত করা প্রশ্নসমূহ ({customQuestions.length} টি)</span>
            </h3>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {customQuestions.map((q, idx) => (
              <div
                key={q.id ? `${q.id}-${idx}` : `custom-${idx}`}
                className="p-3.5 rounded-xl border border-emerald-100 bg-[#f0fdf4]/50 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase">
                      {q.subject}
                    </span>
                    <span className="text-[10px] text-emerald-700/80">
                      সঠিক উত্তর: {['ক', 'খ', 'গ', 'ঘ'][q.correctAnswer]} ({q.optionsBn[q.correctAnswer]})
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-950">
                    {q.questionBn}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="text-emerald-600 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Batch JSON Import Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-emerald-200 space-y-4">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>একসাথে অনেক প্রশ্ন ইমপোর্ট করুন (Batch JSON)</span>
            </h3>

            <p className="text-xs text-emerald-700/80 leading-relaxed">
              নিচের ফরম্যাটে JSON অ্যারে পেস্ট করুন। প্রতিটি প্রশ্নে `questionBn`, `optionsBn` (৪টি অপশন),
              এবং `correctAnswer` (০ থেকে ৩) থাকতে হবে:
            </p>

            <pre className="text-[10px] p-2.5 rounded-xl bg-[#f0fdf4] border border-emerald-200 font-mono text-emerald-900 overflow-x-auto">
{`[
  {
    "questionBn": "১ কিউমেক পানির ভর কত?",
    "subject": "civil",
    "optionsBn": ["১০০ কেজি", "১০০০ কেজি", "১০ কেজি", "৫০০ কেজি"],
    "correctAnswer": 1,
    "explanationBn": "১ কিউমেক = ১০০০ লিটার পানি = ১০০০ কেজি।"
  }
]`}
            </pre>

            {batchError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {batchError}
              </div>
            )}

            <textarea
              rows={6}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="এখানে JSON কোড পেস্ট করুন..."
              className="w-full p-3 rounded-xl border border-emerald-200 bg-white text-emerald-950 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 border border-emerald-200 rounded-xl transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleBatchImport}
                disabled={isBatchImporting}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
              >
                {isBatchImporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'bn' ? 'ডাটাবেসে ইমপোর্ট হচ্ছে...' : 'Importing...'}</span>
                  </>
                ) : (
                  <span>{language === 'bn' ? 'ইমপোর্ট সম্পন্ন করুন' : 'Complete Import'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
