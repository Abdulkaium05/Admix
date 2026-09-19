import React, { useState } from 'react';
import {
  signUpWithEmail,
  loginWithEmail,
  loginWithGoogle,
  resetPassword,
} from '../firebase';
import { Language } from '../utils/i18n';
import { EngineerLogo } from './EngineerLogo';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Cloud,
} from 'lucide-react';

interface AuthScreenProps {
  language: Language;
  onSuccess: () => void;
  onContinueAsGuest?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ language, onSuccess, onContinueAsGuest }) => {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const getFirebaseErrorMessage = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/email-already-in-use') {
      return language === 'bn'
        ? 'এই ইমেইলটি ইতিমধ্যে নিবন্ধিত রয়েছে। দয়া করে লগইন করুন।'
        : 'This email is already registered. Please log in.';
    }
    if (code === 'auth/invalid-email') {
      return language === 'bn'
        ? 'সঠিক ইমেইল ঠিকানা প্রদান করুন।'
        : 'Please enter a valid email address.';
    }
    if (code === 'auth/weak-password') {
      return language === 'bn'
        ? 'পাসওয়ার্ডটি অত্যন্ত দুর্বল। অন্তত ৬ অক্ষরের পাসওয়ার্ড দিন।'
        : 'Password should be at least 6 characters long.';
    }
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return language === 'bn'
        ? 'ভুল ইমেইল অথবা পাসওয়ার্ড দেওয়া হয়েছে।'
        : 'Invalid email or password.';
    }
    if (code === 'auth/user-not-found') {
      return language === 'bn'
        ? 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সাইন আপ করুন।'
        : 'No account found with this email. Please sign up.';
    }
    if (code === 'auth/operation-not-allowed') {
      return language === 'bn'
        ? 'Firebase Console-এ ইমেইল/পাসওয়ার্ড লগইন সক্রিয় করুন অথবা নিচের Google বাটন ব্যবহার করুন।'
        : 'Email/password sign-in is not enabled in Firebase Console. You can also use Google sign-in below.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return language === 'bn' ? 'সাইন ইন বাতিল করা হয়েছে।' : 'Sign-in cancelled.';
    }
    return err?.message || (language === 'bn' ? 'একটি ত্রুটি ঘটেছে, আবার চেষ্টা করুন।' : 'An error occurred, please try again.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(language === 'bn' ? 'দয়া করে সঠিক ইমেইল প্রদান করুন।' : 'Please enter a valid email.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(language === 'bn' ? 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMsg(language === 'bn' ? 'দুটি পাসওয়ার্ড মিলছে না।' : 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
        setSuccessMsg(language === 'bn' ? 'সাইন আপ সফল হয়েছে! প্রোফাইল সেটআপ করুন...' : 'Signed up successfully! Setting up profile...');
      } else {
        await loginWithEmail(email, password);
        setSuccessMsg(language === 'bn' ? 'সফলভাবে লগইন হয়েছে!' : 'Logged in successfully!');
      }
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err: any) {
      setErrorMsg(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg(language === 'bn' ? 'Google দিয়ে সাইন ইন সফল হয়েছে!' : 'Signed in with Google!');
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err: any) {
      setErrorMsg(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setResetError(language === 'bn' ? 'সঠিক ইমেইল লিখুন।' : 'Enter a valid email.');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(getFirebaseErrorMessage(err));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ecfdf5] via-[#f0fdf4] to-white flex flex-col justify-center items-center px-3.5 py-8 sm:py-12">
      {/* Top Branding */}
      <div className="w-full max-w-md mx-auto mb-6 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-emerald-200 shadow-md p-2.5 mx-auto">
          <EngineerLogo className="w-full h-full text-emerald-700" />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Admix • DUET Prep</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
            {language === 'bn' ? 'ডুয়েট ভর্তি প্রস্তুতি প্ল্যাটফর্ম' : 'DUET Admission Preparation Platform'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-700/80 max-w-sm mx-auto">
            {language === 'bn'
              ? 'ক্লাউড ডেটাবেস যুক্ত: যেকোনো ফোন থেকে লগইন করলেই আপনার সংরক্ষিত কুইজ ও রেজাল্ট সিঙ্ক হবে।'
              : 'Cloud-synced: Access your imported quizzes & progress from any phone or device.'}
          </p>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-emerald-200 shadow-xl overflow-hidden">
        {/* Toggle Mode Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-emerald-50/70 border-b border-emerald-100">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
              mode === 'signup'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200/80'
                : 'text-emerald-700/70 hover:text-emerald-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন সাইন আপ' : 'Sign Up'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200/80'
                : 'text-emerald-700/70 hover:text-emerald-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          {/* Notification Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs sm:text-sm outline-hidden transition-all bg-emerald-50/20"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline"
                  >
                    {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === 'bn' ? 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড' : 'At least 6 characters'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs sm:text-sm outline-hidden transition-all bg-emerald-50/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-700/60 hover:text-emerald-900"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={language === 'bn' ? 'একই পাসওয়ার্ড পুনরায় লিখুন' : 'Re-enter same password'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs sm:text-sm outline-hidden transition-all bg-emerald-50/20"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'signup' ? (
                <>
                  <span>{language === 'bn' ? 'সাইন আপ ও পরবর্তী ধাপ' : 'Sign Up & Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-emerald-100 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-emerald-700/60 uppercase">
              {language === 'bn' ? 'অথবা' : 'or'}
            </span>
          </div>

          {/* Google Sign In Option */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-900 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{language === 'bn' ? 'Google দিয়ে সরাসরি সাইন ইন' : 'Sign in with Google'}</span>
          </button>

          {/* Guest Mode Entrance */}
          {onContinueAsGuest && (
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-300/80 bg-white hover:bg-emerald-50/70 text-emerald-800 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-2xs group"
            >
              <span>{language === 'bn' ? 'লগইন ছাড়া সরাসরি অ্যাপে প্রবেশ করুন (গেস্ট মোড)' : 'Explore App as Guest (Offline Mode)'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Cloud features badge */}
          <div className="pt-2 border-t border-emerald-50 flex items-center justify-center gap-4 text-[11px] text-emerald-700/80 font-medium">
            <span className="flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'bn' ? 'ক্লাউড ব্যাকআপ' : 'Cloud Sync'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'bn' ? 'সকল ডিভাইস এক্সেস' : 'Multi-device'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-emerald-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-emerald-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-950">
                {language === 'bn' ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset Password'}
              </h3>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setResetSuccess(false);
                  setResetError(null);
                }}
                className="text-emerald-700/70 hover:text-emerald-950 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {resetSuccess ? (
              <div className="space-y-3 text-center py-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-xs text-emerald-900 font-semibold">
                  {language === 'bn'
                    ? 'আপনার ইমেইলে পাসওয়ার্ড রিসেটের লিঙ্ক পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।'
                    : 'Password reset link sent to your email. Please check your inbox or spam.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetSuccess(false);
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  {language === 'bn' ? 'ঠিক আছে' : 'OK'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendResetPassword} className="space-y-3">
                <p className="text-xs text-emerald-700/80 leading-relaxed">
                  {language === 'bn'
                    ? 'আপনার নিবন্ধিত ইমেইল ঠিকানা দিন। আমরা পাসওয়ার্ড রিসেটের জন্য একটি লিঙ্ক পাঠাব।'
                    : 'Enter your registered email address. We will send you a password reset link.'}
                </p>

                {resetError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    {resetError}
                  </div>
                )}

                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 text-xs outline-hidden focus:border-emerald-600"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-2 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-semibold"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    {resetLoading
                      ? (language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...')
                      : (language === 'bn' ? 'লিঙ্ক পাঠান' : 'Send Link')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
