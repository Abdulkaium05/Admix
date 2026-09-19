import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  getDocFromServer,
} from 'firebase/firestore';
import rawFirebaseConfig from '../firebase-applet-config.json';
import { UserProfile, Question, QuizResult, StudySession } from './types';

// Configuration: supports both FIREBASE_* and VITE_FIREBASE_* env variables (e.g. on Vercel) with fallback to firebase-applet-config.json
const env = (import.meta.env || {}) as Record<string, string | undefined>;
const getVal = (primary?: string, fallbackKey?: string, defaultVal?: string): string => {
  if (primary && primary.trim() !== '') return primary.trim();
  if (fallbackKey && fallbackKey.trim() !== '') return fallbackKey.trim();
  return defaultVal || '';
};

const firebaseConfig = {
  apiKey: getVal(env.FIREBASE_API_KEY, env.VITE_FIREBASE_API_KEY, rawFirebaseConfig.apiKey),
  authDomain: getVal(env.FIREBASE_AUTH_DOMAIN, env.VITE_FIREBASE_AUTH_DOMAIN, rawFirebaseConfig.authDomain),
  projectId: getVal(env.FIREBASE_PROJECT_ID, env.VITE_FIREBASE_PROJECT_ID, rawFirebaseConfig.projectId),
  storageBucket: getVal(env.FIREBASE_STORAGE_BUCKET, env.VITE_FIREBASE_STORAGE_BUCKET, rawFirebaseConfig.storageBucket),
  messagingSenderId: getVal(env.FIREBASE_MESSAGING_SENDER_ID, env.VITE_FIREBASE_MESSAGING_SENDER_ID, rawFirebaseConfig.messagingSenderId),
  appId: getVal(env.FIREBASE_APP_ID, env.VITE_FIREBASE_APP_ID, rawFirebaseConfig.appId),
  firestoreDatabaseId: getVal(env.FIREBASE_DATABASE_ID || env.FIREBASE_FIRESTORE_DATABASE_ID, env.VITE_FIREBASE_DATABASE_ID, rawFirebaseConfig.firestoreDatabaseId),
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with database ID specified in firebase-applet-config.json and auto-detect long polling for iframe/sandbox proxy support
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}
export const db = firestoreInstance;
export const auth = getAuth(app);

// Error Handling Infrastructure per Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function isOfflineError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('client is offline') ||
      msg.includes('failed to get document because the client is offline') ||
      msg.includes('unavailable') ||
      msg.includes('network') ||
      msg.includes('timeout')
    );
  }
  return false;
}

const DEFAULT_TIMEOUT_MS = 2500;

export async function withTimeout<T>(promise: Promise<T>, fallback: T, ms = DEFAULT_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallback);
    }, ms);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    return result;
  } catch (err) {
    clearTimeout(timer!);
    throw err;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial Boot Connection Test per Firebase Integration Skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Checking network...');
    }
    return false;
  }
}

// Run test on load
testFirestoreConnection();

// ==========================================
// Authentication Functions
// ==========================================

export async function signUpWithEmail(email: string, pass: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  return userCredential.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return userCredential.user;
}

export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

// ==========================================
// User Profile Cloud Database Operations
// ==========================================

export async function getUserProfileFromCloud(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await withTimeout(getDoc(docRef), null, 2500);
    if (snap && snap.exists()) {
      const data = snap.data() as UserProfile;
      return data;
    }
    return null;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`[Firestore Offline] Unable to reach cloud for ${path}. Falling back to local data.`);
      return null;
    }
    console.warn(`[Firestore Warning] Profile load issue for ${path}:`, error);
    return null;
  }
}

export async function saveUserProfileToCloud(userId: string, profile: UserProfile): Promise<void> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    await withTimeout(
      setDoc(docRef, {
        ...profile,
        userId,
        email: auth.currentUser?.email || '',
        updatedAt: Date.now(),
      }, { merge: true }),
      undefined,
      3000
    );
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`[Firestore Offline] Unable to save profile to cloud for ${path}.`);
      return;
    }
    console.warn(`[Firestore Warning] Profile save issue for ${path}:`, error);
  }
}

// ==========================================
// Custom Questions Cloud Database Operations
// ==========================================

export async function getCustomQuestionsFromCloud(userId: string): Promise<Question[]> {
  const path = `users/${userId}/custom_questions`;
  try {
    const colRef = collection(db, 'users', userId, 'custom_questions');
    const snapshot = await withTimeout(getDocs(colRef), null, 2500);
    if (!snapshot) return [];
    const questions: Question[] = [];
    snapshot.forEach((d) => {
      const qData = d.data() as Question;
      questions.push({
        ...qData,
        id: d.id,
      });
    });
    return questions;
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`[Firestore Offline] Unable to reach cloud for ${path}. Using local questions.`);
      return [];
    }
    console.warn(`[Firestore Warning] Questions load issue for ${path}:`, error);
    return [];
  }
}

export async function saveCustomQuestionToCloud(userId: string, question: Question): Promise<void> {
  const path = `users/${userId}/custom_questions/${question.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'custom_questions', question.id);
    await withTimeout(
      setDoc(docRef, {
        id: question.id,
        userId,
        subject: question.subject,
        category: question.category,
        department: question.department || 'civil',
        questionBn: question.questionBn,
        questionEn: question.questionEn || '',
        optionsBn: question.optionsBn,
        correctAnswer: question.correctAnswer,
        explanationBn: question.explanationBn || '',
        explanationEn: question.explanationEn || '',
        isCustom: true,
        createdAt: question.createdAt || Date.now(),
      }),
      undefined,
      3000
    );
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`[Firestore Offline] Unable to save question to cloud for ${path}.`);
      return;
    }
    console.warn(`[Firestore Warning] Question save issue for ${path}:`, error);
  }
}

export async function saveBatchCustomQuestionsToCloud(userId: string, questions: Question[]): Promise<void> {
  for (const q of questions) {
    await saveCustomQuestionToCloud(userId, q);
  }
}

export async function deleteCustomQuestionFromCloud(userId: string, questionId: string): Promise<void> {
  const path = `users/${userId}/custom_questions/${questionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'custom_questions', questionId);
    await withTimeout(deleteDoc(docRef), undefined, 3000);
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`[Firestore Offline] Unable to delete question from cloud for ${path}.`);
      return;
    }
    console.warn(`[Firestore Warning] Question delete issue for ${path}:`, error);
  }
}

// ==========================================
// Quiz Exam Results Cloud Database Operations
// ==========================================

export async function getQuizHistoryFromCloud(userId: string): Promise<QuizResult[]> {
  const path = `users/${userId}/quiz_results`;
  try {
    const colRef = collection(db, 'users', userId, 'quiz_results');
    const snapshot = await withTimeout(getDocs(colRef), null, 2500);
    if (!snapshot) return [];
    const results: QuizResult[] = [];
    snapshot.forEach((d) => {
      results.push(d.data() as QuizResult);
    });
    // Sort descending by timestamp
    return results.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`[Firestore Offline] Unable to reach cloud for ${path}. Using local history.`);
      return [];
    }
    console.warn(`[Firestore Warning] History load issue for ${path}:`, error);
    return [];
  }
}

export async function saveQuizResultToCloud(userId: string, result: QuizResult): Promise<void> {
  const path = `users/${userId}/quiz_results/${result.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'quiz_results', result.id);
    await withTimeout(
      setDoc(docRef, {
        ...result,
        userId,
      }),
      undefined,
      3000
    );
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`[Firestore Offline] Unable to save quiz result to cloud for ${path}.`);
      return;
    }
    console.warn(`[Firestore Warning] Result save issue for ${path}:`, error);
  }
}

// ==========================================
// Study Tracker Cloud Database Operations
// ==========================================

export async function getStudySessionsFromCloud(userId: string): Promise<StudySession[]> {
  const path = `users/${userId}/study_sessions`;
  try {
    const colRef = collection(db, 'users', userId, 'study_sessions');
    const snapshot = await withTimeout(getDocs(colRef), null, 2500);
    if (!snapshot) return [];
    const list: StudySession[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as StudySession);
    });
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`[Firestore Offline] Unable to reach cloud for ${path}. Using local study sessions.`);
      return [];
    }
    console.warn(`[Firestore Warning] Sessions load issue for ${path}:`, error);
    return [];
  }
}

export async function saveStudySessionToCloud(userId: string, session: StudySession): Promise<void> {
  const path = `users/${userId}/study_sessions/${session.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'study_sessions', session.id);
    await withTimeout(
      setDoc(docRef, {
        ...session,
        userId,
      }),
      undefined,
      3000
    );
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`[Firestore Offline] Unable to save study session to cloud for ${path}.`);
      return;
    }
    console.warn(`[Firestore Warning] Session save issue for ${path}:`, error);
  }
}

export async function deleteStudySessionFromCloud(userId: string, sessionId: string): Promise<void> {
  const path = `users/${userId}/study_sessions/${sessionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'study_sessions', sessionId);
    await withTimeout(deleteDoc(docRef), undefined, 3000);
  } catch (error) {
    if (isOfflineError(error)) {
      console.warn(`[Firestore Offline] Unable to delete study session from cloud for ${path}.`);
      return;
    }
    console.warn(`[Firestore Warning] Session delete issue for ${path}:`, error);
  }
}
