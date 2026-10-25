import React, { useState, useEffect } from 'react';
import { api, getStoredToken } from './services/api.js';
import {
  UserProfile,
  PeriodRecordDTO,
  CycleStats,
  JournalEntryDTO,
  UserProgressSummary
} from '../../shared/types/index.js';

import { Navbar, AppPage } from './components/layout/Navbar.js';
import { PetalMascot } from './components/mascot/PetalMascot.js';
import { GlossaryModal } from './components/common/GlossaryModal.js';
import { WelcomeOnboarding } from './features/onboarding/WelcomeOnboarding.js';
import { CycleCalendar } from './features/tracker/CycleCalendar.js';
import { CycleStatsCard } from './features/tracker/CycleStatsCard.js';
import { PeriodHistoryList } from './features/tracker/PeriodHistoryList.js';
import { LogPeriodModal } from './features/tracker/LogPeriodModal.js';
import { LessonDetailModal } from './features/learning/LessonDetailModal.js';
import { DailyCurriculumView } from './features/learning/DailyCurriculumView.js';
import { ProductDetailModal } from './features/products/ProductDetailModal.js';
import { BodyJournalView } from './features/journal/BodyJournalView.js';
import { ProgressDashboard } from './features/progress/ProgressDashboard.js';
import { PrivacySettingsView } from './features/settings/PrivacySettingsView.js';

import { LESSONS_DATA, Lesson } from './data/lessons.js';
import { PRODUCTS_GUIDE_DATA, ProductItem } from './data/products.js';
import { ProductImageWithFallback } from './components/products/ProductIllustration.js';
import { PinUnlockModal } from './components/common/PinUnlockModal.js';
import { calculateCycleStats } from './features/tracker/cyclePrediction.js';
import {
  isDiscreetModeEnabled,
  isPinLockEnabled,
  isSessionUnlocked,
  getLocalPeriods,
  saveLocalPeriods,
  getLocalJournal,
  saveLocalJournal,
  deleteEverythingLocal
} from './services/privacyStorageService.js';

import { Droplet, BookOpen, Sparkles, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('welcome');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // App data state
  const [periods, setPeriods] = useState<PeriodRecordDTO[]>([]);
  const [cycleStats, setCycleStats] = useState<CycleStats>({
    hasSufficientData: false,
    totalRecordedPeriods: 0,
    averageCycleLength: null,
    averagePeriodDuration: null,
    lastPeriodStartDate: null,
    estimatedNextPeriodStart: null,
    estimatedNextPeriodEnd: null,
    currentCycleDay: null,
    isIrregular: false,
    explanation: 'No period logs found yet.'
  });
  const [journalEntries, setJournalEntries] = useState<JournalEntryDTO[]>([]);
  const [learningProgress, setLearningProgress] = useState<UserProgressSummary>({
    totalPoints: 0,
    completedLessonsCount: 0,
    completedLessonIds: [],
    quizzesTakenCount: 0,
    recentQuizAttempts: [],
    badges: [],
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      todayCompleted: false,
      todayActivityCount: 0,
      weeklyCalendar: [],
      encouragingMessage: "Welcome! Start your Bloom streak with today's learning.",
      totalActivitiesCompleted: 0
    },
    completedDailyActivities: [],
    unlockedDayInfo: {
      maxUnlockedDay: 1,
      programStartedAt: new Date().toISOString(),
      nextDayUnlockTime: new Date(Date.now() + 86400000).toISOString(),
      nextDayUnlockSeconds: 86400,
      serverTime: new Date().toISOString()
    }
  });

  // Modal states
  const [isLogPeriodOpen, setIsLogPeriodOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PeriodRecordDTO | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeProduct, setActiveProduct] = useState<ProductItem | null>(null);

  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [glossaryInitialTerm, setGlossaryInitialTerm] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };


  // Privacy & Settings states
  const [discreetMode, setDiscreetMode] = useState<boolean>(() => isDiscreetModeEnabled());
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(() => isPinLockEnabled() && !isSessionUnlocked());

  // Synchronize document title with discreet mode
  useEffect(() => {
    if (discreetMode) {
      document.title = 'Diary — Personal Notes';
    } else {
      document.title = 'Nurtura — Menstrual Health & Learning for Girls';
    }
  }, [discreetMode]);

  // Initial load
  useEffect(() => {
    const initApp = async () => {
      // 1. Check if PIN vault lock is active
      if (isPinLockEnabled() && !isSessionUnlocked()) {
        setIsVaultLocked(true);
      }

      // 2. Load on-device local storage as baseline
      const localPeriods = getLocalPeriods();
      const localJournal = getLocalJournal();
      if (localPeriods.length > 0) {
        setPeriods(localPeriods);
        setCycleStats(calculateCycleStats(localPeriods));
      }
      if (localJournal.length > 0) {
        setJournalEntries(localJournal);
      }

      const token = getStoredToken();
      if (!token) {
        setLoadingInitial(false);
        if (localPeriods.length > 0) {
          setCurrentPage('tracker');
        } else {
          setCurrentPage('welcome');
        }
        return;
      }

      try {
        const profile = await api.auth.getMe();
        setUser(profile);
        setCurrentPage('tracker');
        await loadUserData();
      } catch (err) {
        console.warn('Session expired or offline:', err);
        api.auth.logout();
        setUser(null);
        if (localPeriods.length > 0) {
          setCurrentPage('tracker');
        } else {
          setCurrentPage('welcome');
        }
      } finally {
        setLoadingInitial(false);
      }
    };

    initApp();
  }, []);

  const loadUserData = async () => {
    try {
      const [periodsData, journalData, progressData] = await Promise.all([
        api.periods.list().catch(() => ({ periods: [], stats: cycleStats })),
        api.journal.list().catch(() => []),
        api.learning.getProgress().catch(() => learningProgress)
      ]);

      setPeriods(periodsData.periods);
      setCycleStats(periodsData.stats);
      setJournalEntries(journalData);
      setLearningProgress(progressData);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // Auth Handlers
  const handleRegister = async (payload: any) => {
    const res = await api.auth.register(payload);
    setUser(res.user);
    showToast(`Welcome to Nurtura, ${res.user.nickname}! 🌸`);
    await loadUserData();
    setCurrentPage('tracker');
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#D7C4E8', '#B48AB8', '#F9D8DE']
    });
  };

  const handleLogin = async (credentials: any) => {
    const res = await api.auth.login(credentials);
    setUser(res.user);
    showToast(`Welcome back, ${res.user.nickname}!`);
    await loadUserData();
    setCurrentPage('tracker');
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setPeriods([]);
    setJournalEntries([]);
    setCurrentPage('welcome');
    showToast('Signed out successfully.');
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    const updated = await api.auth.updateProfile(updates);
    setUser(updated);
    showToast('Profile updated!');
  };

  const handleExportData = async () => {
    const data = await api.auth.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lavender_bloom_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Personal data file exported!');
  };

  const handleDeleteAccount = async () => {
    await api.auth.deleteAccount();
    setUser(null);
    setPeriods([]);
    setJournalEntries([]);
    setCurrentPage('welcome');
    showToast('Your account and records have been permanently deleted.');
  };

  const handleDeleteEverything = async () => {
    if (user) {
      await api.auth.deleteAccount().catch(() => null);
    }
    await deleteEverythingLocal();
    setUser(null);
    setPeriods([]);
    setJournalEntries([]);
    setCycleStats({
      hasSufficientData: false,
      totalRecordedPeriods: 0,
      averageCycleLength: null,
      averagePeriodDuration: null,
      lastPeriodStartDate: null,
      estimatedNextPeriodStart: null,
      estimatedNextPeriodEnd: null,
      currentCycleDay: null,
      isIrregular: false,
      explanation: 'No period logs found yet.'
    });
    setDiscreetMode(false);
    setIsVaultLocked(false);
    setCurrentPage('welcome');
    showToast('All local application records have been permanently cleared.');
  };

  // Period Handlers
  const handleSavePeriod = async (payload: any) => {
    if (editingPeriod) {
      if (user) {
        await api.periods.update(editingPeriod.id, payload).catch(() => null);
      }
      const updated = periods.map((p) => (p.id === editingPeriod.id ? { ...p, ...payload } : p));
      setPeriods(updated);
      saveLocalPeriods(updated);
      setCycleStats(calculateCycleStats(updated));
      showToast('Period entry updated successfully!');
    } else {
      let created: PeriodRecordDTO;
      if (user) {
        try {
          created = await api.periods.create(payload);
        } catch {
          created = {
            id: `local_p_${Date.now()}`,
            userId: user.id,
            startDate: payload.startDate,
            endDate: payload.endDate || null,
            flow: payload.flow || 'medium',
            symptoms: payload.symptoms || [],
            mood: payload.mood || undefined,
            energy: payload.energy || undefined,
            notes: payload.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      } else {
        created = {
          id: `local_p_${Date.now()}`,
          userId: 'local_user_private',
          startDate: payload.startDate,
          endDate: payload.endDate || null,
          flow: payload.flow || 'medium',
          symptoms: payload.symptoms || [],
          mood: payload.mood || undefined,
          energy: payload.energy || undefined,
          notes: payload.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      const updated = [created, ...periods.filter((p) => p.id !== created.id)].sort((a, b) =>
        b.startDate.localeCompare(a.startDate)
      );
      setPeriods(updated);
      saveLocalPeriods(updated);
      setCycleStats(calculateCycleStats(updated));
      showToast('Period entry saved successfully!');
    }
  };

  const handleDeletePeriod = async (id: string) => {
    if (user) {
      await api.periods.delete(id).catch(() => null);
    }
    const updated = periods.filter((p) => p.id !== id);
    setPeriods(updated);
    saveLocalPeriods(updated);
    setCycleStats(calculateCycleStats(updated));
    showToast('Period entry deleted.');
  };

  const handleOpenLogModal = (dateStr?: string, existing?: PeriodRecordDTO) => {
    if (existing) {
      setEditingPeriod(existing);
      setSelectedCalendarDate(existing.startDate);
    } else {
      setEditingPeriod(null);
      if (dateStr) setSelectedCalendarDate(dateStr);
    }
    setIsLogPeriodOpen(true);
  };

  // Journal Handlers
  const handleSaveJournal = async (payload: any) => {
    let entry: JournalEntryDTO;
    const entryDate = payload.date || new Date().toISOString().split('T')[0];
    if (user) {
      try {
        entry = await api.journal.upsert(payload);
      } catch {
        entry = {
          id: payload.id || `local_j_${Date.now()}`,
          userId: user.id,
          date: entryDate,
          mood: payload.mood || 'calm',
          energy: payload.energy || 'medium',
          cramps: payload.cramps || 'none',
          symptoms: payload.symptoms || [],
          notes: payload.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      entry = {
        id: payload.id || `local_j_${Date.now()}`,
        userId: 'local_user_private',
        date: entryDate,
        mood: payload.mood || 'calm',
        energy: payload.energy || 'medium',
        cramps: payload.cramps || 'none',
        symptoms: payload.symptoms || [],
        notes: payload.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    const updated = [entry, ...journalEntries.filter((j) => j.date !== entry.date)].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    setJournalEntries(updated);
    saveLocalJournal(updated);
    showToast('Check-in saved safely in your private vault!');
  };

  const handleDeleteJournal = async (id: string) => {
    if (user) {
      await api.journal.delete(id).catch(() => null);
    }
    const updated = journalEntries.filter((j) => j.id !== id);
    setJournalEntries(updated);
    saveLocalJournal(updated);
    showToast('Journal entry deleted.');
  };

  // Learning Handlers
  const handleCompleteLesson = async (lessonId: string, points: number) => {
    if (!user) {
      showToast('Completed in guest mode! Sign in to save points to your vault.');
      return;
    }
    await api.learning.completeLesson(lessonId, points);
    showToast(`Lesson completed! +${points} points earned.`);
    await loadUserData();
  };

  const handleQuizSubmit = async (quizId: string, score: number, total: number) => {
    if (!user) {
      showToast(`Quiz completed: ${score}/${total}! Sign in to save badges.`);
      return;
    }
    await api.learning.submitQuizAttempt({ quizId, score, totalQuestions: total });
    showToast('Quiz results saved to your learning profile!');
    await loadUserData();
  };

  const handleDailyActivityComplete = async (
    activityId: string,
    dayNumber: number,
    activityType: 'mcq' | 'myth_fact'
  ) => {
    if (!user) {
      showToast('Activity completed in preview! Create a free account or sign in to save your Bloom streak.');
      return;
    }

    try {
      const clientDate = new Date().toISOString().split('T')[0];
      const res = await api.learning.submitDailyActivity({
        activityId,
        dayNumber,
        activityType,
        clientDate
      });

      const wasAlreadyDoneToday = learningProgress.streak?.todayCompleted;

      setLearningProgress((prev) => {
        const alreadyHas = prev.completedDailyActivities?.includes(activityId);
        const nextActivities = alreadyHas
          ? prev.completedDailyActivities
          : [...(prev.completedDailyActivities || []), activityId];
        return {
          ...prev,
          totalPoints: alreadyHas ? prev.totalPoints : prev.totalPoints + 10,
          streak: res.streak,
          completedDailyActivities: nextActivities,
          unlockedDayInfo: (res as any).unlockedDayInfo || prev.unlockedDayInfo
        };
      });

      if (!wasAlreadyDoneToday) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#D7C4E8', '#B48AB8', '#765477']
        });
        showToast('Bloom streak updated! +10 learning points earned 🌸', 'success');
      } else {
        showToast('Activity completed! +10 learning points earned 🌸', 'success');
      }
    } catch (err: any) {
      console.error('Failed to save daily activity:', err);
      showToast(err.message || 'Could not save activity to server. Please try again.', 'error');
    }
  };

  const openGlossaryWithTerm = (term: string) => {
    setGlossaryInitialTerm(term);
    setIsGlossaryOpen(true);
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bloom-bg text-bloom-plum space-y-4">
        <PetalMascot imageSrc="/illustrations/girl-thinking.png" size="lg" />
        <p className="text-sm font-bold text-bloom-dusty animate-pulse">
          Opening your private space in Nurtura...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bloom-bg text-bloom-plum flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-fade-in">
          <div
            className={`p-4 rounded-2xl border shadow-bloomHover flex items-center gap-3 text-xs sm:text-sm font-bold ${
              toast.type === 'success'
                ? 'bg-white border-bloom-secondary text-bloom-plum'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {toast.type === 'success' ? (
              <PetalMascot imageSrc="/illustrations/girl-boba.png" size="sm" />
            ) : (
              <AlertCircle size={20} className="text-rose-500 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Bar (Desktop sidebar & mobile header for app pages) */}
      {currentPage !== 'welcome' && (
        <Navbar
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
          user={user}
          totalPoints={learningProgress.totalPoints}
          onOpenGlossary={() => {
            setGlossaryInitialTerm('');
            setIsGlossaryOpen(true);
          }}
          discreetMode={discreetMode}
        />
      )}

      {/* Content wrapper with left margin for left sidebar on desktop */}
      <div
        className={`${
          currentPage !== 'welcome' ? 'md:pl-64 lg:pl-72' : ''
        } flex-1 flex flex-col min-h-screen w-full transition-all`}
      >
        {/* Main Content Area */}
        <main
          className={`flex-1 w-full ${
            currentPage === 'welcome'
              ? 'p-0 max-w-none'
              : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8'
          }`}
        >
          {currentPage === 'welcome' && (
            <WelcomeOnboarding
              onRegister={handleRegister}
              onLogin={handleLogin}
              onExploreWithoutAccount={() => setCurrentPage('learning')}
            />
          )}

        {currentPage === 'tracker' && (
          <div className="space-y-6">
            {/* Top Tracker Action Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-bloom-plum">
                  My Cycle Tracker
                </h1>
                <p className="text-xs sm:text-sm text-bloom-dusty">
                  Track your dates, notice your personal cycle rhythms, and be prepared.
                </p>
              </div>

              <button
                onClick={() => handleOpenLogModal(selectedCalendarDate)}
                className="btn-primary py-3 px-6 text-sm font-bold shadow-bloom rounded-2xl"
              >
                <Droplet size={18} />
                <span>Log Period</span>
              </button>
            </div>

            {/* Cycle Stats & Explanation Card */}
            <CycleStatsCard
              stats={cycleStats}
              periods={periods}
              userPeriodStatus={user?.periodStatus}
              discreetMode={discreetMode}
            />

            {/* Calendar & Past History in Responsive 2-Col Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CycleCalendar
                  periods={periods}
                  stats={cycleStats}
                  selectedDate={selectedCalendarDate}
                  onSelectDate={(dateStr) => setSelectedCalendarDate(dateStr)}
                  onLogForDate={(dateStr) => handleOpenLogModal(dateStr)}
                />
              </div>

              <div className="lg:col-span-1">
                <PeriodHistoryList
                  periods={periods}
                  onEdit={(p) => handleOpenLogModal(p.startDate, p)}
                  onDelete={handleDeletePeriod}
                  onOpenLogModal={() => handleOpenLogModal(selectedCalendarDate)}
                />
              </div>
            </div>
          </div>
        )}

        {currentPage === 'learning' && (
          <div className="space-y-8">
            {/* Learn & Play Hero Banner */}
            <div className="bloom-card p-6 bg-gradient-to-r from-white via-bloom-light to-bloom-secondary/30 border border-bloom-secondary flex flex-col sm:flex-row items-center gap-6">
              <div className="shrink-0">
                <img
                  src="/illustrations/girl-studying.png"
                  alt="Girl studying and learning"
                  className="w-20 h-24 sm:w-24 sm:h-28 object-contain drop-shadow-xs"
                />
              </div>
              <div className="space-y-1.5 flex-1 text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-bloom-dusty bg-bloom-secondary/40 px-3 py-1 rounded-full">
                  Learn & Play Hub
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-bloom-plum">
                  Body Science Made Gentle & Fun
                </h1>
                <p className="text-xs sm:text-sm text-bloom-dusty leading-relaxed max-w-xl">
                  Explore 50 days of daily learning, bite-sized lessons, play Myth or Fact, and take quick quizzes to earn points and grow your Bloom streak.
                </p>
              </div>
            </div>

            {/* 50-Day Learning Journey Collection (200 Activities) */}
            <DailyCurriculumView
              completedActivityIds={learningProgress.completedDailyActivities || []}
              streak={learningProgress.streak}
              unlockedDayInfo={learningProgress.unlockedDayInfo}
              onActivityComplete={handleDailyActivityComplete}
              onRefreshProgress={loadUserData}
            />

            {/* Section A: Educational Lesson Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-bloom-plum">Bite-Sized Lessons</h2>
                  <p className="text-xs text-bloom-dusty">Tap any card to read in full</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {LESSONS_DATA.map((lesson) => {
                  const isCompleted = learningProgress.completedLessonIds.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setActiveLesson(lesson)}
                      className="bloom-card p-5 bg-white border border-bloom-border hover:border-bloom-mauve text-left flex flex-col justify-between transition group h-full"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-bloom-dusty bg-bloom-secondary/40 px-2 py-0.5 rounded-md">
                            {lesson.category}
                          </span>
                          {isCompleted ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 size={11} /> Done
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-bloom-mauve flex items-center gap-0.5">
                              <Sparkles size={11} /> +{lesson.points} pts
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-bloom-plum text-base group-hover:text-bloom-mauve transition mb-1">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-bloom-dusty line-clamp-2 leading-relaxed">
                          {lesson.summary}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-bloom-border/60 flex items-center justify-between text-xs text-bloom-dusty">
                        <span>{lesson.readTime}</span>
                        <span className="font-bold text-bloom-mauve group-hover:translate-x-1 transition-transform">
                          Read →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {currentPage === 'products' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bloom-card p-6 bg-gradient-to-r from-white via-bloom-light to-bloom-secondary/20 border border-bloom-border flex flex-col sm:flex-row items-center gap-5">
              <div className="shrink-0">
                <img
                  src="/illustrations/girl-backpack.png"
                  alt="Prepared with confidence"
                  className="w-20 h-24 sm:w-24 sm:h-28 object-contain drop-shadow-xs"
                />
              </div>
              <div className="space-y-1 flex-1 text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-bloom-dusty bg-bloom-secondary/40 px-3 py-1 rounded-full">
                  Authentic Product Guide
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-bloom-plum">
                  Period Products Guide
                </h1>
                <p className="text-xs sm:text-sm text-bloom-dusty leading-relaxed max-w-xl">
                  Learn about all 6 menstrual products with genuine photos, how-to-use steps, hygiene safety, and care instructions.
                </p>
              </div>
            </div>

            {/* 6 Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRODUCTS_GUIDE_DATA.map((product) => (
                <div
                  key={product.id}
                  className="bloom-card p-5 bg-white border border-bloom-border flex flex-col justify-between space-y-4 hover:border-bloom-mauve transition"
                >
                  <div className="space-y-3">
                    <ProductImageWithFallback
                      src={product.imageUrl}
                      alt={product.imageAlt}
                      type={product.fallbackSvgType}
                    />

                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          product.type === 'reusable'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-bloom-secondary/50 text-bloom-plum'
                        }`}
                      >
                        {product.type === 'reusable' ? '🌿 Reusable' : '📦 Disposable'}
                      </span>
                      <span className="text-bloom-dusty font-semibold capitalize">
                        {product.category}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-bloom-plum">{product.name}</h2>
                    <p className="text-xs text-bloom-dusty line-clamp-2 leading-relaxed">
                      {product.shortIntro}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveProduct(product)}
                    className="btn-secondary w-full py-2.5 rounded-xl text-xs font-bold shadow-none"
                  >
                    <span>Learn How to Use</span>
                    <span>→</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'journal' && (
          <BodyJournalView
            entries={journalEntries}
            onSaveEntry={handleSaveJournal}
            onDeleteEntry={handleDeleteJournal}
          />
        )}

        {currentPage === 'progress' && (
          <ProgressDashboard
            progress={learningProgress}
            onSelectLesson={(lessonId) => {
              const lesson = LESSONS_DATA.find((l) => l.id === lessonId);
              if (lesson) setActiveLesson(lesson);
            }}
            onContinueLearning={() => setCurrentPage('learning')}
          />
        )}

        {currentPage === 'settings' && (
          <PrivacySettingsView
            user={user}
            periods={periods}
            journalEntries={journalEntries}
            learningProgress={learningProgress}
            onUpdateProfile={handleUpdateProfile}
            onDataChanged={(updatedPeriods, updatedJournal) => {
              setPeriods(updatedPeriods);
              setJournalEntries(updatedJournal);
              saveLocalPeriods(updatedPeriods);
              saveLocalJournal(updatedJournal);
              setCycleStats(calculateCycleStats(updatedPeriods));
              showToast('Records updated successfully!');
            }}
            onDeleteEverything={handleDeleteEverything}
            onLogout={handleLogout}
            onDiscreetModeToggled={(enabled) => setDiscreetMode(enabled)}
          />
        )}
      </main>

      {/* Global Modals */}
      <LogPeriodModal
        isOpen={isLogPeriodOpen}
        onClose={() => setIsLogPeriodOpen(false)}
        onSave={handleSavePeriod}
        onDelete={handleDeletePeriod}
        initialRecord={editingPeriod}
        defaultStartDate={selectedCalendarDate}
      />

      <LessonDetailModal
        lesson={activeLesson}
        isOpen={!!activeLesson}
        onClose={() => setActiveLesson(null)}
        isCompleted={activeLesson ? learningProgress.completedLessonIds.includes(activeLesson.id) : false}
        onComplete={handleCompleteLesson}
        onOpenFullGlossary={openGlossaryWithTerm}
      />

      <ProductDetailModal
        product={activeProduct}
        isOpen={!!activeProduct}
        onClose={() => setActiveProduct(null)}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        initialTerm={glossaryInitialTerm}
      />

        {/* Footer */}
        <footer className="mt-auto py-6 border-t border-bloom-border bg-white/60 text-center text-xs text-bloom-dusty space-y-1">
          <p className="font-semibold text-bloom-plum">
            {discreetMode
              ? 'Diary — Private Notes & Personal Check-in'
              : 'Nurtura — Menstrual Health Companion & Learning Space for Girls'}
          </p>
          <p className="text-[11px]">
            {discreetMode
              ? 'Personal wellness and self-care log.'
              : 'Designed with care, privacy, and scientific accuracy. Not a substitute for medical advice from a healthcare professional.'}
          </p>
        </footer>
      </div>

      {/* 4-Digit PIN Vault Unlock Modal */}
      <PinUnlockModal
        isOpen={isVaultLocked}
        onUnlocked={(payload) => {
          setIsVaultLocked(false);
          if (payload.periods) {
            setPeriods(payload.periods);
            setCycleStats(calculateCycleStats(payload.periods));
          }
          if (payload.journal) {
            setJournalEntries(payload.journal);
          }
          showToast('Vault unlocked successfully!');
        }}
        onResetApp={handleDeleteEverything}
      />
    </div>
  );
}

export default App;
