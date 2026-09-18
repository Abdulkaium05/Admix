import React, { useState } from 'react';
import { Question, SubjectType, DepartmentType } from '../types';
import { translations, Language } from '../utils/i18n';
import {
  saveCustomQuestion,
  deleteCustomQuestion,
  saveBatchCustomQuestions,
} from '../utils/storage';
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
} from 'lucide-react';

interface QuizImportScreenProps {
  questions: Question[];
  language: Language;
  onRefreshQuestions: () => void;
  customQuestions: Question[];
}

export const QuizImportScreen: React.FC<QuizImportScreenProps> = ({
  questions,
  language,
  onRefreshQuestions,
  customQuestions,
}) => {
  const t = translations[language];

  // Category: 'department' or 'non_department'
  const [categoryType, setCategoryType] = useState<'department' | 'non_department'>('department');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('civil');
  const [department, setDepartment] = useState<DepartmentType>('civil');

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

  const handleSaveQuestion = (e: React.FormEvent) => {
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

    const newQuestion: Question = {
      id: `custom-q-${Date.now()}`,
      category: categoryType,
      department: 'civil',
      subject: selectedSubject,
      questionBn: questionBn.trim(),
      questionEn: questionEn.trim() || undefined,
      optionsBn: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
      correctAnswer: correctAnswer!,
      explanationBn: explanationBn.trim() || undefined,
      isCustom: true,
    };

    saveCustomQuestion(newQuestion);
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
    setSuccessMessage(t.successQuestionAdded);

    // Auto-dismiss success alert after 4s
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const handleDelete = (id: string) => {
    deleteCustomQuestion(id);
    onRefreshQuestions();
  };

  // Batch import handler
  const handleBatchImport = () => {
    try {
      setBatchError(null);
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        setBatchError('JSON must be an array of questions.');
        return;
      }

      const formattedQuestions: Question[] = [];
      for (const item of parsed) {
        if (!item.questionBn || !Array.isArray(item.optionsBn) || item.optionsBn.length !== 4) {
          throw new Error('Every question must have questionBn and 4 optionsBn.');
        }
        formattedQuestions.push({
          id: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          category: item.category || categoryType,
          department: (item.department as DepartmentType) || 'civil',
          subject: item.subject || selectedSubject,
          questionBn: item.questionBn,
          questionEn: item.questionEn,
          optionsBn: item.optionsBn,
          correctAnswer: typeof item.correctAnswer === 'number' ? item.correctAnswer : 0,
          explanationBn: item.explanationBn,
          isCustom: true,
        });
      }

      saveBatchCustomQuestions(formattedQuestions);
      onRefreshQuestions();
      setShowBatchModal(false);
      setJsonInput('');
      setSuccessMessage(
        language === 'bn'
          ? `একসাথে ${formattedQuestions.length} টি প্রশ্ন সফলভাবে যুক্ত হয়েছে!`
          : `Successfully imported ${formattedQuestions.length} questions!`
      );
    } catch (err: any) {
      setBatchError(err.message || 'Invalid JSON format.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-emerald-100 shadow-2xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-emerald-950 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <span>{t.importTitle}</span>
          </h2>
          <p className="text-xs text-emerald-700/80 mt-0.5">
            {t.importSubtitle}
          </p>
        </div>

        <button
          onClick={() => setShowBatchModal(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold hover:bg-emerald-100 transition-colors"
        >
          <Upload className="w-4 h-4 text-emerald-600" />
          <span>{t.batchImportJson}</span>
        </button>
      </div>

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
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-2xs transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.saveQuestionBtn}</span>
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
            {customQuestions.map((q) => (
              <div
                key={q.id}
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
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-2xs transition-colors"
              >
                ইমপোর্ট সম্পন্ন করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
