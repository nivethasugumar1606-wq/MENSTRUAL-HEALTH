/**
 * MOONLIT — Menstrual Wellness Web Application
 * Strict Violet (#473E69) and Warm Sandal (#FAF6F0 / #F6ECE0) Design System
 * 
 * 6 Focused Sanctuary Pages (incl. Doctor Visit + Ask Mimi):
 * - 01 Home Page (Live countdown, About Moonlit, Window Art, Action Cards with Timers, & Explore)
 * - 02 Decor (Body & Food Decoder: Sensation Encyclopedia, Food Freedom, Daily Rhythm, Tiny Steps)
 * - 03 My Cycle (Menstrual Calendar Sanctuary, Live Forecast, 4-Cycle Intelligence, & Flow Logging)
 * - 04 Privacy (My Privacy, My Rules: PIN App Lock, Local Storage Audit, Data Export, Emergency Purge)
 */

import './style.css';
import { ILLUSTRATIONS, ILLUSTRATION_IMAGES } from './illustrations.js';
import { store, generateDefaultCycles } from './data/store.js';
import { 
  calculateCycleMetrics, 
  getCalendarGrid, 
  formatDateDisplay, 
  validateFourDates, 
  calculateCountdown, 
  getTodayDateString, 
  diffCalendarDays, 
  addCalendarDays,
  analyzePainPatterns
} from './logic/cycleCalculator.js';
import { DECODE_BODY_TOPICS, FOOD_FREEDOM_GUIDES } from './data/decoderData.js';
import { renderHeardPage, bindDoctorVisitEvents } from './doctorVisit.js';
import { renderAskMimiPage, bindAskMimiEvents } from './askMimi.js';

// Router State
let currentRoute = getRouteFromHash();
let activeModal = null; // 'reminders' | 'tasks' | 'manage-4-cycles' | 'log-cycle'
let activeToastNotification = null; // { title, message, items: [], actionBtn, targetType, isSuccess }

// Non-blocking toast helper
function showToast(title, message, isSuccess = true) {
  activeToastNotification = {
    title,
    message,
    items: [],
    isSuccess
  };
  render();
}

// Biological phase intelligence calculator
function getCyclePhaseInfo(state, cycleMetrics) {
  const latestCycle = state.cycles[0];
  if (!latestCycle || !latestCycle.startDate) {
    return {
      phaseName: 'Follicular Phase',
      guidance: 'A time of renewal and fresh biological energy. Nourish with leafy greens and stay hydrated.',
      hormoneNote: 'Estrogen is steadily rising, boosting clarity and natural momentum.'
    };
  }

  const todayStr = getTodayDateString();
  const daysSinceStart = diffCalendarDays(latestCycle.startDate, todayStr);
  const cycleLen = cycleMetrics.typicalLength || 28;
  const cycleDay = (daysSinceStart % cycleLen) + 1;

  if (cycleDay <= 5) {
    return {
      phaseName: `Menstrual Phase (Day ${cycleDay} of ${cycleLen})`,
      guidance: 'Your uterine lining is shedding. Rest deeply, use a warm compress, and enjoy iron-rich foods.',
      hormoneNote: 'Progesterone and estrogen are at baseline. Honor your body’s call to rest.'
    };
  } else if (cycleDay <= 13) {
    return {
      phaseName: `Follicular Phase (Day ${cycleDay} of ${cycleLen})`,
      guidance: 'Energy begins to rise. Wonderful time for creative planning, light workouts, and fresh salads.',
      hormoneNote: 'Rising estrogen increases stamina, optimism, and mental sharpness.'
    };
  } else if (cycleDay <= 16) {
    return {
      phaseName: `Ovulatory Phase (Day ${cycleDay} of ${cycleLen})`,
      guidance: 'Peak vitality and social energy. Connect with friends and stay energized with wholesome grains.',
      hormoneNote: 'Estrogen and LH peak. You may notice higher confidence and glowing skin.'
    };
  } else {
    return {
      phaseName: `Luteal Phase (Day ${cycleDay} of ${cycleLen})`,
      guidance: 'Natural energy softens. Prioritize warm broths, magnesium-rich snacks, and soothing evenings.',
      hormoneNote: 'Progesterone dominates to soothe the nervous system. Wind down without pressure.'
    };
  }
}

// Calendar View State (Defaults to current year/month)
const initialCalDate = new Date();
let calendarViewYear = initialCalDate.getFullYear();
let calendarViewMonth = initialCalDate.getMonth() + 1;
let selectedDayForLog = null;

// Countdown live seconds for Period Card
let countdownSeconds = 12;
let countdownInterval = null;

function formatRemainingTimer(dueTimestamp, isCompleted) {
  if (isCompleted) {
    return `<span class="timer-tag tag-done">✓ Done</span>`;
  }
  if (!dueTimestamp) {
    return `<span class="timer-tag tag-active">⏱ No timer</span>`;
  }
  const now = Date.now();
  const diff = dueTimestamp - now;
  if (diff <= 0) {
    const overdueMin = Math.max(1, Math.floor(Math.abs(diff) / 60000));
    return `<span class="timer-tag tag-delayed animate-pulse">⚠️ DELAYED by ${overdueMin}m</span>`;
  }
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const timeStr = m > 0 ? `${m}m ${s < 10 ? '0' : ''}${s}s` : `${s}s`;
  return `<span class="timer-tag tag-active">⏱ ${timeStr} left</span>`;
}

function startCountdownTimer() {
  if (countdownInterval) return;
  countdownInterval = setInterval(() => {
    // 1. Period Countdown
    countdownSeconds--;
    if (countdownSeconds < 0) countdownSeconds = 59;
    const timerEl = document.getElementById('countdown-live-timer');
    if (timerEl) {
      const s = countdownSeconds < 10 ? '0' + countdownSeconds : countdownSeconds;
      timerEl.textContent = `0:00:${s}`;
    }

    // 2. Reminders & Tasks Overdue Check
    const state = store.getState();
    const now = Date.now();
    let stateChanged = false;
    let overdueAlertItem = null;

    (state.reminders || []).forEach(rem => {
      if (!rem.completed && rem.dueTimestamp && now >= rem.dueTimestamp && !rem.notifiedOverdue) {
        rem.notifiedOverdue = true;
        stateChanged = true;
        if (!overdueAlertItem) {
          overdueAlertItem = { title: 'Reminder Overdue!', itemText: rem.text, type: 'reminders', id: rem.id };
        }
      }
    });

    (state.todaysTasks || []).forEach(task => {
      if (!task.completed && task.dueTimestamp && now >= task.dueTimestamp && !task.notifiedOverdue) {
        task.notifiedOverdue = true;
        stateChanged = true;
        if (!overdueAlertItem) {
          overdueAlertItem = { title: 'Task Overdue!', itemText: task.text, type: 'tasks', id: task.id };
        }
      }
    });

    if (stateChanged) {
      store.saveReminders(state.reminders);
      store.saveTasks(state.todaysTasks);
      if (overdueAlertItem) {
        activeToastNotification = {
          title: `⏰ ${overdueAlertItem.title}`,
          message: `Time got delayed for "${overdueAlertItem.itemText}"! Please complete it now.`,
          items: [overdueAlertItem.itemText],
          actionBtn: 'Mark Completed',
          targetType: overdueAlertItem.type
        };
        trySendNativeNotification('Nutura Alert: Time Delayed!', `Delayed: ${overdueAlertItem.itemText}`);
        render();
        return;
      }
    }

    // 3. Update any visible live timer badges in DOM
    document.querySelectorAll('[data-timer-due]').forEach(el => {
      const due = parseInt(el.getAttribute('data-timer-due'), 10);
      const isDone = el.getAttribute('data-timer-done') === 'true';
      el.innerHTML = formatRemainingTimer(due, isDone);
    });
  }, 1000);
}

function getRouteFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  return hash || 'home';
}

function navigateTo(route) {
  window.location.hash = '#/' + route;
}

// Listen to hash change for multi-page SPA routing
window.addEventListener('hashchange', () => {
  currentRoute = getRouteFromHash();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
});

function renderUniversalHeader(currentRoute) {
  const isHome = currentRoute === 'home' || currentRoute === 'welcome' || currentRoute === '' || currentRoute === 'reminders' || currentRoute === 'tasks';
  const isDecor = currentRoute.startsWith('decor') || currentRoute.startsWith('decode');
  const isCycle = currentRoute === 'cycle' || currentRoute === 'my-cycle';
  const isPrivacy = currentRoute.startsWith('privacy');
  const isDoctor = currentRoute.startsWith('heard') || currentRoute.startsWith('doctor');
  const isNutura = currentRoute === 'ask-nutura' || currentRoute === 'ask-mimi' || currentRoute === 'chat';

  return `
    <header class="subpage-universal-header" role="banner">
      <div class="subpage-header-container">
        <div class="subpage-brand-group" style="display: flex; align-items: center; gap: 10px;">
          <a href="/" class="subpage-switch-portal" title="Return to Welcome Portal Selection" style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; text-decoration: none; color: #D7C4E8; padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(215,196,232,0.35); font-weight: 700; background: rgba(50,35,75,0.4); transition: background 0.2s;">
            ← Switch Portal
          </a>
          <a href="#/home" class="subpage-logo-text" title="Nurtura Adult Home">
            <span style="font-size: 1.15rem; color: #EBDFFD; margin-right: 6px;">✦</span>
            <span>NURTURA</span>
          </a>
        </div>
        
        <nav class="subpage-nav-tabs" aria-label="Main Navigation">
          <a href="#/home" class="subpage-tab-link ${isHome ? 'active' : ''}">Home</a>
          <a href="#/decoder" class="subpage-tab-link ${isDecor ? 'active' : ''}">Decor</a>
          <a href="#/cycle" class="subpage-tab-link ${isCycle ? 'active' : ''}">My Cycle</a>
          <a href="#/heard" class="subpage-tab-link ${isDoctor ? 'active' : ''}">Doctor Visit</a>
          <a href="#/ask-nutura" class="subpage-tab-link ${isNutura ? 'active' : ''}">Ask Nutura</a>
          <a href="#/privacy" class="subpage-tab-link ${isPrivacy ? 'active' : ''}">Privacy</a>
        </nav>
      </div>
    </header>
  `;
}

function initApp() {
  store.subscribe(() => {
    render();
  });
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function render() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  const state = store.getState();

  // If locked, render PIN screen
  if (state.privacySettings.appLockEnabled && state.privacySettings.isLocked) {
    appContainer.innerHTML = renderAppLockScreen();
    bindAppLockEvents();
    return;
  }

  // Calculate real metrics
  const cycleMetrics = calculateCycleMetrics(state.cycles);

  const isLandingHome = (currentRoute === 'home' || currentRoute === 'welcome' || currentRoute === '' || currentRoute === 'reminders' || currentRoute === 'tasks');

  if (isLandingHome) {
    if (currentRoute === 'reminders' && !activeModal) {
      activeModal = 'reminders';
    } else if (currentRoute === 'tasks' && !activeModal) {
      activeModal = 'tasks';
    }

    document.body.classList.add('route-home');
    document.body.classList.remove('route-board');
    appContainer.innerHTML = `
      <!-- Universal Sticky Navigation Header with 3 Nav Bars -->
      ${renderUniversalHeader(currentRoute)}

      <!-- Landing Homepage -->
      <main id="main-content" class="landing-main-view">
        ${renderLandingHomePage(state, cycleMetrics)}
      </main>

      <!-- Active Modals (Image 2 Reminders & Image 3 Tasks) -->
      <div id="modal-container">
        ${renderActiveModal(state, cycleMetrics)}
      </div>

      <!-- Pop-up Notifications Container -->
      <div id="toast-notification-container">
        ${renderActiveToast()}
      </div>
    `;
    startCountdownTimer();
    bindEvents();
    return;
  }

  document.body.classList.remove('route-board');
  document.body.classList.remove('route-home');

  appContainer.innerHTML = `
    <!-- Universal Sticky Navigation Header with 3 Nav Bars -->
    ${renderUniversalHeader(currentRoute)}

    <!-- Expansive Standalone Content Container -->
    <main id="main-content" class="standalone-view-main">
      ${renderCurrentPage(currentRoute, state, cycleMetrics)}
    </main>

    <!-- Active Modals -->
    <div id="modal-container">
      ${renderActiveModal(state, cycleMetrics)}
    </div>

    <!-- Pop-up Notifications Container -->
    <div id="toast-notification-container">
      ${renderActiveToast()}
    </div>
  `;

  startCountdownTimer();
  bindEvents();
}

/**
 * PAGE ROUTER: DISPATCH TO MOONLIT PAGES (4 Pages Only)
 */
function renderCurrentPage(route, state, cycleMetrics) {
  const cleanRoute = route.split('?')[0].split('/')[0];

  // Doctor Visit routes (hub + dedicated detail views)
  if (cleanRoute.startsWith('heard') || cleanRoute === 'doctor-visit') {
    let tab = 'overview';
    if (cleanRoute === 'heard-schedule' || cleanRoute === 'heard-when' || cleanRoute === 'heard-visit') {
      tab = 'schedule';
    } else if (cleanRoute === 'heard-questions') {
      tab = 'questions';
    } else if (cleanRoute === 'heard-summary') {
      tab = 'summary';
    }
    const painMetrics = analyzePainPatterns(state.cycles, state.painLogs);
    return renderHeardPage(tab, state, cycleMetrics, painMetrics);
  }

  switch (cleanRoute) {
    case 'home':
    case 'welcome':
    case '':
    case 'reminders':
    case 'tasks':
      return renderLandingHomePage(state, cycleMetrics);
    case 'decor':
    case 'decoder':
    case 'decode-body':
    case 'food-freedom':
    case 'connect-dots':
    case 'tiny-steps':
      return renderDecoderPage();
    case 'cycle':
    case 'my-cycle':
      return renderCyclePage(state, cycleMetrics);
    case 'privacy':
    case 'privacy-lock':
    case 'privacy-storage':
    case 'privacy-export':
    case 'privacy-notif':
      return renderPrivacyPage();
    case 'ask-nutura':
    case 'ask-mimi':
    case 'chat':
      return renderAskMimiPage(state);
    default:
      return renderLandingHomePage(state, cycleMetrics);
  }
}

/* ==========================================================================
   PAGE 02: BODY & FOOD DECODER (Expansive Standalone Page)
   ========================================================================== */
function renderDecoderPage() {
  const tinySteps = store.getState().tinySteps || [];

  return `
    <div class="decor-page-wrapper">
      <div class="decor-page-container">
        <!-- Hero Banner with Authentic Artwork -->
        <div class="standalone-hero-banner" style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-lg); padding: 24px 28px; box-shadow: var(--shadow-card); display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-wrap: wrap;">
          <div class="standalone-hero-texts" style="flex: 1; min-width: 280px;">
            <span class="card-nav-crumb" style="font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; font-size: 0.8rem; color: var(--plum-primary); display: inline-block; margin-bottom: 6px;">‹ 02 Decor</span>
            <h2 class="serif-heading" style="font-size: 2.2rem; line-height: 1.15; margin: 4px 0 10px; color: var(--plum-primary);">Body & Food Decoder</h2>
            <p style="font-size: 0.95rem; line-height: 1.6; color: var(--sandal-muted); max-width: 540px; margin: 0;">
              Understand cycle sensations, nourish without fear, connect hormones to daily energy, and take gentle micro-steps toward holistic menstrual wellness.
            </p>
          </div>
          <div class="standalone-art-frame" style="width: 220px; text-align: center;">
            <img src="${ILLUSTRATION_IMAGES.decoder}" alt="Girl sitting enjoying nourishing food" style="width: 100%; border-radius: var(--radius-md); box-shadow: var(--shadow-card);" />
            <span class="handwritten-annotation" style="font-size: 1.35rem; display: block; margin-top: 8px; color: var(--plum-primary); font-family: var(--font-hand);">Good food is self care ♡</span>
          </div>
        </div>

        <!-- 4 Major Decoder Modules in 1040px Canvas -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          
          <!-- Module 1: Decode My Body (Sensation Encyclopedia Accordion) -->
          <div class="interactive-panel-card" style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-lg); padding: 24px 28px; box-shadow: var(--shadow-card);">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <h4 style="font-size: 1.35rem; font-family: var(--font-serif); color: var(--plum-primary); margin: 0;">🧘‍♀️ Sensation & Symptom Encyclopedia</h4>
              <span style="font-size: 0.78rem; color: var(--sandal-muted); font-weight: 600;">${DECODE_BODY_TOPICS.length} Clinically Reviewed Topics</span>
            </div>
            <p style="font-size: 0.88rem; color: var(--sandal-muted); margin-bottom: 18px; line-height: 1.5;">
              Click any sensation below to learn the physiological reason behind it and practical, gentle ways to soothe your body.
            </p>

            <div class="topics-accordion" style="display: flex; flex-direction: column; gap: 10px;">
              ${DECODE_BODY_TOPICS.map((topic, i) => `
                <div class="topic-card" style="border-radius: var(--radius-sm); border: 1px solid var(--sandal-border); overflow: hidden; background: #FFF; transition: box-shadow 0.2s ease;">
                  <div class="topic-header" data-topic-index="${i}" style="padding: 14px 18px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #FAF7F2; user-select: none;">
                    <div>
                      <span style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--plum-muted); font-weight: 700;">${topic.category}</span>
                      <div class="topic-title" style="font-size: 1.05rem; font-weight: 700; color: var(--plum-primary); margin-top: 2px;">${topic.title}</div>
                    </div>
                    <span class="topic-caret" style="font-size: 1.25rem; color: var(--plum-primary); font-weight: 700; transition: transform 0.2s ease;">${i === 0 ? '▴' : '▾'}</span>
                  </div>
                  <div class="topic-body" id="topic-body-${i}" style="display: ${i === 0 ? 'block' : 'none'}; padding: 18px 20px; border-top: 1px solid var(--sandal-border); background: #FFF;">
                    <p style="font-size: 0.9rem; line-height: 1.6; color: var(--sandal-muted); margin-bottom: 14px;">${topic.summary}</p>
                    
                    ${topic.physiologicalCause ? `
                      <div style="background: #FAF7F2; padding: 14px 16px; border-radius: var(--radius-sm); border-left: 4px solid var(--plum-primary); margin-bottom: 14px;">
                        <strong style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.8px; color: var(--plum-primary); display: block; margin-bottom: 4px;">Why it happens:</strong>
                        <p style="font-size: 0.86rem; color: var(--plum-dark); margin: 0; line-height: 1.5;">${topic.physiologicalCause}</p>
                      </div>
                    ` : ''}

                    ${topic.quickRelief && topic.quickRelief.length ? `
                      <div style="margin-top: 12px;">
                        <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.8px; color: var(--plum-muted); font-weight: 700; display: block; margin-bottom: 8px;">Practical Relief Steps:</span>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 8px;">
                          ${topic.quickRelief.map(tip => `
                            <div style="font-size: 0.82rem; background: #FFF9F2; border: 1px solid var(--sandal-border); padding: 9px 12px; border-radius: var(--radius-sm); color: var(--plum-primary); display: flex; align-items: center; gap: 8px;">
                              <span>✨</span>
                              <span>${tip}</span>
                            </div>
                          `).join('')}
                        </div>
                      </div>
                    ` : ''}

                    ${topic.content ? `
                      <div class="topic-rich-content" style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed var(--sandal-border); font-size: 0.86rem; line-height: 1.6; color: var(--sandal-muted);">
                        ${topic.content}
                      </div>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Module 2: Food Freedom (Nutrition Cards) -->
          <div class="interactive-panel-card" style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-lg); padding: 24px 28px; box-shadow: var(--shadow-card);">
            <h4 style="font-size: 1.35rem; font-family: var(--font-serif); color: var(--plum-primary); margin: 0 0 8px;">🥑 Food Freedom: Nourish Your Hormones</h4>
            <p style="font-size: 0.88rem; color: var(--sandal-muted); margin-bottom: 18px; line-height: 1.5;">
              Food is comfort and medicine. Discover gentle culinary choices tailored to ease cramps, stabilize blood sugar, and support hormone synthesis.
            </p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
              ${FOOD_FREEDOM_GUIDES.map(f => `
                <div style="background: #FAF7F2; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                      <span style="font-size: 1.6rem;">${f.icon || '🥑'}</span>
                      <h5 style="font-size: 1.05rem; font-weight: 700; color: var(--plum-primary); margin: 0;">${f.title}</h5>
                    </div>
                    <div style="font-size: 0.78rem; font-weight: 600; color: var(--plum-muted); margin-bottom: 6px;">${f.subtitle || ''}</div>
                    <p style="font-size: 0.84rem; line-height: 1.5; color: var(--sandal-muted); margin-bottom: 12px;">${f.description || f.content}</p>
                  </div>
                  ${f.items && f.items.length ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
                      ${f.items.map(it => `
                        <span style="background: #FFF; border: 1px solid var(--sandal-border); font-size: 0.74rem; font-weight: 600; padding: 4px 10px; border-radius: var(--radius-full); color: var(--plum-dark);">${it}</span>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Module 3: Daily Rhythm Connection -->
          <div class="interactive-panel-card" style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-lg); padding: 24px 28px; box-shadow: var(--shadow-card);">
            <h4 style="font-size: 1.35rem; font-family: var(--font-serif); color: var(--plum-primary); margin: 0 0 8px;">🌙 Connect The Dots: Cycle & Energy</h4>
            <p style="font-size: 0.88rem; color: var(--sandal-muted); margin-bottom: 18px; line-height: 1.5;">
              Your body naturally shifts across 4 distinct phases. Aligning your schedule and lifestyle with your biology brings peace.
            </p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px;">
              <div style="background: #FAF7F2; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 16px;">
                <span class="badge-phase-pill" style="margin-bottom: 8px; display: inline-block;">🩸 Menstrual</span>
                <div style="font-size: 0.76rem; color: var(--plum-muted); font-weight: 700; margin-bottom: 6px;">Winter Phase (Days 1–5)</div>
                <p style="font-size: 0.82rem; line-height: 1.5; color: var(--sandal-muted); margin: 0;">Low estrogen and progesterone. Internal reflection, restful sleep, warm broths & slow walks.</p>
              </div>
              <div style="background: #FAF7F2; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 16px;">
                <span class="badge-phase-pill" style="margin-bottom: 8px; display: inline-block;">🌱 Follicular</span>
                <div style="font-size: 0.76rem; color: var(--plum-muted); font-weight: 700; margin-bottom: 6px;">Spring Phase (Days 6–12)</div>
                <p style="font-size: 0.82rem; line-height: 1.5; color: var(--sandal-muted); margin: 0;">Rising estrogen. Creative spark, high mental clarity, fresh greens, cardio & new projects.</p>
              </div>
              <div style="background: #FAF7F2; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 16px;">
                <span class="badge-phase-pill" style="margin-bottom: 8px; display: inline-block;">☀️ Ovulatory</span>
                <div style="font-size: 0.76rem; color: var(--plum-muted); font-weight: 700; margin-bottom: 6px;">Summer Phase (Days 13–16)</div>
                <p style="font-size: 0.82rem; line-height: 1.5; color: var(--sandal-muted); margin: 0;">Peak estrogen & LH surge. High confidence, social connection, strength training & nutrient dense meals.</p>
              </div>
              <div style="background: #FAF7F2; border: 1px solid var(--sandal-border); border-radius: var(--radius-md); padding: 16px;">
                <span class="badge-phase-pill" style="margin-bottom: 8px; display: inline-block;">🍂 Luteal</span>
                <div style="font-size: 0.76rem; color: var(--plum-muted); font-weight: 700; margin-bottom: 6px;">Autumn Phase (Days 17–28)</div>
                <p style="font-size: 0.82rem; line-height: 1.5; color: var(--sandal-muted); margin: 0;">Progesterone dominates. Nesting instinct, higher caloric needs (+200 kcal), magnesium & rest.</p>
              </div>
            </div>
          </div>

          <!-- Module 4: My Tiny Steps (Gentle Habits) -->
          <div class="interactive-panel-card" style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-lg); padding: 24px 28px; box-shadow: var(--shadow-card);">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
              <h4 style="font-size: 1.35rem; font-family: var(--font-serif); color: var(--plum-primary); margin: 0;">🌿 My Tiny Steps (Gentle Habits)</h4>
              <span style="font-size: 0.78rem; color: var(--sandal-muted); font-weight: 600;">
                ${tinySteps.filter(s => s.completed).length} of ${tinySteps.length} Completed
              </span>
            </div>
            <p style="font-size: 0.88rem; color: var(--sandal-muted); margin-bottom: 18px; line-height: 1.5;">
              Zero-pressure micro-actions you can take whenever you feel ready. Click any step to toggle completion.
            </p>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px;">
              ${tinySteps.map(step => `
                <div class="btn-toggle-tiny-step" data-step-id="${step.id}" role="button" tabindex="0" style="padding: 14px 18px; background: ${step.completed ? '#F0F8F1' : '#FAF7F2'}; border: 1px solid ${step.completed ? '#81C784' : 'var(--sandal-border)'}; border-radius: var(--radius-md); cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s ease;">
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 22px; height: 22px; border-radius: 50%; border: 2px solid ${step.completed ? '#2E7D32' : 'var(--plum-muted)'}; background: ${step.completed ? '#2E7D32' : 'transparent'}; display: flex; align-items: center; justify-content: center; color: #FFF; font-size: 0.75rem; font-weight: 700;">
                      ${step.completed ? '✓' : ''}
                    </div>
                    <span style="font-size: 0.92rem; font-weight: 600; color: var(--plum-primary); text-decoration: ${step.completed ? 'line-through' : 'none'}; opacity: ${step.completed ? '0.7' : '1'};">
                      ${step.text}
                    </span>
                  </div>
                  <span style="font-size: 0.75rem; color: var(--plum-muted); font-weight: 600;">${step.completed ? 'Completed' : 'Tap to mark done'}</span>
                </div>
              `).join('')}
            </div>

            <div style="display: flex; gap: 10px;">
              <input type="text" id="input-new-tiny-step" class="optional-note-input" placeholder="Add custom gentle step (e.g. 5 min breathing)..." style="flex: 1; padding: 10px 14px; border: 1px solid var(--sandal-border); border-radius: var(--radius-sm); font-family: var(--font-sans); font-size: 0.88rem;" />
              <button class="hero-journey-btn" id="btn-add-tiny-step" style="background: var(--plum-primary); color: #FFF; font-size: 0.85rem; font-weight: 700; padding: 10px 20px; border: none; border-radius: var(--radius-sm); cursor: pointer; transition: background 0.15s ease;">Add Step</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   PAGE 03: MY PRIVACY, MY RULES (Expansive Standalone Page)
   ========================================================================== */
function renderPrivacyPage() {
  const state = store.getState();
  const logsCount = state.cycles.length;

  return `
    <div class="privacy-page-wrapper">
      <div class="privacy-page-container">
        <!-- Hero Banner with Authentic Artwork -->
        <div class="standalone-hero-banner" style="background: #FFFFFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-lg); padding: 24px 28px; box-shadow: var(--shadow-card); display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-wrap: wrap;">
          <div class="standalone-hero-texts" style="flex: 1; min-width: 280px;">
            <span class="card-nav-crumb" style="font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; font-size: 0.8rem; color: var(--plum-primary); display: inline-block; margin-bottom: 6px;">‹ 04 Privacy</span>
            <h2 class="serif-heading" style="font-size: 2.2rem; line-height: 1.15; margin: 4px 0 10px; color: var(--plum-primary);">My Privacy, My Rules</h2>
            <p style="font-size: 0.95rem; line-height: 1.6; color: var(--sandal-muted); max-width: 540px; margin: 0;">
              Your data belongs solely to you. We do not sell, synchronize, or transmit your menstrual health history to any corporate cloud or advertising network.
            </p>
          </div>
          <div class="standalone-art-frame" style="width: 220px; text-align: center;">
            <img src="${ILLUSTRATION_IMAGES.privacy}" alt="Girl working on laptop with cat and plants" style="width: 100%; border-radius: var(--radius-md); box-shadow: var(--shadow-card);" />
            <span class="handwritten-annotation" style="font-size: 1.35rem; display: block; margin-top: 8px; color: var(--plum-primary); font-family: var(--font-hand);">Your privacy matters ♡</span>
          </div>
        </div>

        <!-- 4 Security Modules Grid -->
        <div class="standalone-content-grid">
          
          <!-- Module 1: App Lock & PIN -->
          <div class="interactive-panel-card">
            <h4>🔒 App Lock & 4-Digit Security</h4>
            <p style="font-size: 0.86rem; color: var(--sandal-muted); margin-bottom: 16px;">
              Require a private 4-digit PIN every time NUTURA is opened to shield your cycle dates from prying eyes.
            </p>
            <div style="background: #FAF7F2; padding: 14px 18px; border-radius: var(--radius-sm); border: 1px solid var(--sandal-border); margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: 600; font-size: 0.88rem;">Current Status:</span>
                <span class="view-mode-btn" style="background: ${state.privacySettings.appLockEnabled ? '#2E7D32' : '#757575'}; color: #FFF; font-size: 0.75rem;">
                  ${state.privacySettings.appLockEnabled ? 'Active (PIN Set)' : 'Disabled'}
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" id="check-enable-applock" ${state.privacySettings.appLockEnabled ? 'checked' : ''} />
                <label for="check-enable-applock" style="font-size: 0.84rem; cursor: pointer;">Enable PIN Security</label>
              </div>
              <div style="margin-top: 8px;">
                <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 4px;">4-Digit PIN Code:</label>
                <input type="password" id="input-new-pin" maxlength="4" class="optional-note-input" value="${state.privacySettings.pin || '1234'}" style="max-width: 140px; text-align: center; font-size: 1.2rem; letter-spacing: 6px;" />
              </div>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button class="hero-journey-btn" id="btn-save-applock" style="background: var(--plum-primary); color: #FFF; font-size: 0.8rem; padding: 8px 18px; border: none; cursor: pointer;">
                Save PIN Settings
              </button>
              <button class="quick-action-btn" id="btn-trigger-lock-now" style="border-color: var(--plum-primary); color: var(--plum-primary);">
                Lock Screen Now
              </button>
            </div>
          </div>

          <!-- Module 2: Data Transparency -->
          <div class="interactive-panel-card">
            <h4>💾 Local Storage Transparency</h4>
            <p style="font-size: 0.86rem; color: var(--sandal-muted); margin-bottom: 16px;">
              Full audit of everything stored in your local browser sandbox. Zero bytes exist on remote servers.
            </p>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.84rem; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--sandal-border);">
                <span>Recorded Cycles:</span>
                <strong>${logsCount} records</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--sandal-border);">
                <span>Storage Protocol:</span>
                <strong>Browser localStorage (Sandbox)</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--sandal-border);">
                <span>Third-Party Trackers:</span>
                <strong style="color: #2E7D32;">0 Trackers (Blocked)</strong>
              </div>
            </div>
            <p style="font-size: 0.78rem; color: var(--sandal-muted); line-height: 1.45;">
              Clearing browser cache removes local records unless you backup below.
            </p>
          </div>

          <!-- Module 3: Export & Doctor Summary -->
          <div class="interactive-panel-card">
            <h4>📋 Export Records & Physician Report</h4>
            <p style="font-size: 0.86rem; color: var(--sandal-muted); margin-bottom: 16px;">
              Copy a clean text summary or download structured JSON backup for your doctor or peace of mind.
            </p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button class="hero-journey-btn" id="btn-copy-summary" style="background: var(--plum-primary); color: #FFF; font-size: 0.8rem; padding: 8px 18px; border: none; cursor: pointer;">
                Copy Doctor Summary 📋
              </button>
              <button class="quick-action-btn" id="btn-download-json" style="border-color: var(--plum-primary); color: var(--plum-primary);">
                Download JSON Backup 📥
              </button>
            </div>
          </div>

          <!-- Module 4: Emergency Purge -->
          <div class="interactive-panel-card" style="border-color: #FFCDD2; background: #FFF5F5;">
            <h4 style="color: #C62828;">⚠️ Emergency Purge & Data Reset</h4>
            <p style="font-size: 0.86rem; color: #B71C1C; margin-bottom: 16px;">
              Instantly and irreversibly erase all personal logs, cycles, and symptom logs from this device.
            </p>
            <button class="btn-danger-pill" id="btn-danger-purge" style="background: #C62828; color: #FFF; border: none; padding: 8px 18px; border-radius: var(--radius-full); cursor: pointer; font-size: 0.8rem; font-weight: 700;">
              Permanently Purge All Data
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   PAGE 03: MY CYCLE (Expansive Warm Sandal Menstrual Sanctuary)
   ========================================================================== */
function renderCyclePage(state, cycleMetrics) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[calendarViewMonth - 1];

  const grid = getCalendarGrid(calendarViewYear, calendarViewMonth, state.cycles, cycleMetrics);

  const daysHtml = grid.days.map(d => {
    if (d.isEmpty) {
      return `<div class="cal-day-cell empty"></div>`;
    }
    const classes = ['cal-day-cell'];
    if (d.isPeriod) classes.push('is-period');
    if (d.isPredicted) classes.push('is-predicted');
    if (d.isEstimatedCenter) classes.push('is-estimated-center');
    if (d.isOvulation) classes.push('is-ovulation');
    if (d.isToday) classes.push('is-today');

    let title = `${d.dateString}`;
    if (d.isPeriod) title += ' (Confirmed Period)';
    else if (d.isEstimatedCenter) title += ' (Estimated Period Start)';
    else if (d.isPredicted) title += ' (Predicted Period Window)';
    else if (d.isOvulation) title += ' (Estimated Ovulation)';

    return `
      <div class="${classes.join(' ')}" data-cal-date="${d.dateString}" title="${title}">
        ${d.dayNumber}
      </div>
    `;
  }).join('');

  const phaseInfo = getCyclePhaseInfo(state, cycleMetrics);

  return `
    <div class="cycle-page-wrapper">
      <div class="cycle-page-container">
        
        <!-- 1. Top Hero Card -->
        <div class="cycle-top-hero-card">
          <div class="cycle-hero-texts">
            <a href="#/home" class="card-nav-crumb">‹ 03 My Cycle</a>
            <h1 class="serif-heading cycle-main-title">My Cycle Sanctuary</h1>
            <p class="cycle-main-subtitle">Deterministic forecasting, cycle phase intelligence, and symptom awareness.</p>
          </div>
          <div class="cycle-top-actions">
            <button class="hero-journey-btn" id="btn-open-record-period" style="background: var(--plum-primary); color: #FFF; font-size: 0.85rem; padding: 10px 20px; border: none; cursor: pointer; border-radius: var(--radius-full); font-weight: 600;">
              + Record Period Arrived
            </button>
            <button class="quick-action-btn" id="btn-open-manage-4-cycles" style="font-size: 0.85rem; padding: 9px 18px; border-color: var(--plum-primary); color: var(--plum-primary); cursor: pointer; border-radius: var(--radius-full); font-weight: 600; background: #FFF;">
              ⚙️ Calibrate 4 Cycles
            </button>
          </div>
        </div>

        <!-- 2. Two Status Cards Row -->
        <div class="cycle-status-row">
          <!-- Live Forecast Card -->
          <div class="cycle-banner-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: var(--plum-muted);">
                Live Forecast ✦ Next Period Window
              </span>
              <span class="confidence-pill ${(cycleMetrics.confidence || 'high').toLowerCase()}">${cycleMetrics.confidence || 'High'} Confidence</span>
            </div>
            <div style="font-family: var(--font-serif); font-size: 1.85rem; font-weight: 700; color: var(--plum-primary); margin: 4px 0 8px;">
              ${cycleMetrics.nextPeriodWindow || 'Upcoming Cycle'}
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; border-top: 1px solid var(--sandal-border-subtle); padding-top: 10px;">
              <div style="font-size: 0.88rem; color: var(--sandal-muted); font-weight: 600;">
                ${cycleMetrics.countdown.headline}
              </div>
              <div style="font-size: 0.8rem; background: #FAF7F2; padding: 4px 10px; border-radius: var(--radius-full); border: 1px solid var(--sandal-border); color: var(--plum-primary);">
                ⏱ Interval: ${cycleMetrics.typicalLength || 28} Days
              </div>
            </div>
          </div>

          <!-- Biological Phase Card -->
          <div class="cycle-banner-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: var(--plum-muted);">
                Current Biological Rhythm
              </span>
              <span style="font-size: 1.1rem;">🌿</span>
            </div>
            <div style="font-family: var(--font-serif); font-size: 1.45rem; font-weight: 700; color: var(--plum-primary); margin: 4px 0 6px;">
              ${phaseInfo.phaseName}
            </div>
            <p style="font-size: 0.84rem; line-height: 1.5; color: var(--sandal-muted); margin: 0 0 10px;">
              ${phaseInfo.guidance}
            </p>
            <div style="font-size: 0.78rem; color: var(--plum-primary); background: #FAF7F2; padding: 6px 12px; border-radius: var(--radius-sm); border-left: 3px solid var(--plum-primary);">
              ${phaseInfo.hormoneNote}
            </div>
          </div>
        </div>

        <!-- 3. Main 2-Column Section -->
        <div class="cycle-main-columns">
          <!-- Left Column: Calendar Card -->
          <div class="cycle-calendar-card">
            <!-- Month Header Row -->
            <div class="cycle-cal-header">
              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="cycle-cal-nav-arrow" id="cal-prev-btn" title="Previous Month">‹</button>
                <span class="cycle-cal-month-title">${monthName} ${calendarViewYear}</span>
                <button class="cycle-cal-nav-arrow" id="cal-next-btn" title="Next Month">›</button>
              </div>
              <button class="quick-action-btn" id="cal-today-btn" style="font-size: 0.76rem; padding: 4px 12px; border-radius: var(--radius-full); border: 1px solid var(--sandal-border); background: #FAF7F2; color: var(--plum-primary); cursor: pointer; font-weight: 600;">
                Today ✦
              </button>
            </div>

            <!-- Weekday Labels -->
            <div class="cycle-cal-weekdays">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>

            <!-- Days Grid -->
            <div class="cycle-cal-days-grid">
              ${daysHtml}
            </div>

            <!-- Legend -->
            <div class="cycle-cal-legend">
              <span class="legend-item"><span class="legend-dot period-dot"></span><span>Period</span></span>
              <span class="legend-item"><span class="legend-dot predicted-dot"></span><span>Predicted</span></span>
              <span class="legend-item"><span class="legend-dot ovulation-dot"></span><span>Ovulation</span></span>
              <span class="legend-item"><span class="legend-dot today-dot" style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; outline: 2px solid #B4A7D6;"></span><span>Today</span></span>
            </div>

            <!-- Calendar bottom note & action -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: #FAF7F2; border: 1px solid var(--sandal-border); border-radius: var(--radius-sm); padding: 10px 14px; margin-top: 4px;">
              <span style="font-size: 0.8rem; color: var(--sandal-muted);">💡 Tap any date on the calendar to log flow or symptoms.</span>
              <button class="hero-journey-btn" id="btn-open-log-cycle" style="font-size: 0.78rem; padding: 6px 14px; background: var(--plum-primary); color: #FFF; border: none; border-radius: var(--radius-full); cursor: pointer;">
                + Log Flow
              </button>
            </div>
          </div>

          <!-- Right Column: Cycle Rhythm & Multi-Cycle History -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <!-- Intelligence & Statistics Card -->
            <div class="interactive-panel-card" style="background: #FFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-lg); padding: 20px 22px; box-shadow: 0 4px 18px rgba(71, 62, 105, 0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <h3 class="serif-heading" style="font-size: 1.3rem; color: var(--plum-primary); margin: 0;">Cycle Rhythm Intelligence</h3>
                <span class="confidence-pill ${(cycleMetrics.confidence || 'high').toLowerCase()}">${cycleMetrics.confidence}</span>
              </div>

              <!-- 4 Stats Boxes -->
              <div class="cycle-stats-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px;">
                <div class="cycle-stat-box" style="background: #FAF7F2; border: 1px solid var(--sandal-border); border-radius: var(--radius-sm); padding: 10px 14px;">
                  <div class="cycle-stat-label" style="font-size: 0.72rem; text-transform: uppercase; color: var(--plum-muted); font-weight: 700;">Typical Cycle</div>
                  <div class="cycle-stat-val" style="font-size: 1.3rem; font-weight: 700; color: var(--plum-primary);">${cycleMetrics.typicalLength || 28} <span style="font-size: 0.8rem; font-weight: 400;">days</span></div>
                </div>
                <div class="cycle-stat-box" style="background: #FAF7F2; border: 1px solid var(--sandal-border); border-radius: var(--radius-sm); padding: 10px 14px;">
                  <div class="cycle-stat-label" style="font-size: 0.72rem; text-transform: uppercase; color: var(--plum-muted); font-weight: 700;">Mean Interval</div>
                  <div class="cycle-stat-val" style="font-size: 1.3rem; font-weight: 700; color: var(--plum-primary);">${cycleMetrics.meanLength || 28.5} <span style="font-size: 0.8rem; font-weight: 400;">days</span></div>
                </div>
                <div class="cycle-stat-box" style="background: #FAF7F2; border: 1px solid var(--sandal-border); border-radius: var(--radius-sm); padding: 10px 14px;">
                  <div class="cycle-stat-label" style="font-size: 0.72rem; text-transform: uppercase; color: var(--plum-muted); font-weight: 700;">Variability</div>
                  <div class="cycle-stat-val" style="font-size: 1.3rem; font-weight: 700; color: var(--plum-primary);">±${cycleMetrics.stdDev || 1.2} <span style="font-size: 0.8rem; font-weight: 400;">days</span></div>
                </div>
                <div class="cycle-stat-box" style="background: #FAF7F2; border: 1px solid var(--sandal-border); border-radius: var(--radius-sm); padding: 10px 14px;">
                  <div class="cycle-stat-label" style="font-size: 0.72rem; text-transform: uppercase; color: var(--plum-muted); font-weight: 700;">Observed Range</div>
                  <div class="cycle-stat-val" style="font-size: 1.3rem; font-weight: 700; color: var(--plum-primary);">${cycleMetrics.minLength || 27}–${cycleMetrics.maxLength || 30} <span style="font-size: 0.8rem; font-weight: 400;">days</span></div>
                </div>
              </div>

              <p style="font-size: 0.84rem; line-height: 1.5; color: var(--sandal-muted); margin: 0 0 10px;">
                ${cycleMetrics.explanation}
              </p>

              ${cycleMetrics.durationInsight ? `
                <div style="font-size: 0.82rem; color: var(--plum-primary); background: #FAF7F2; padding: 8px 12px; border-radius: var(--radius-sm); border-left: 3px solid var(--plum-primary); margin-bottom: 12px;">
                  🩸 ${cycleMetrics.durationInsight}
                </div>
              ` : ''}

              <!-- Recorded Cycles & Intervals List -->
              <div style="border-top: 1px solid var(--sandal-border-subtle); padding-top: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 0.85rem; font-weight: 700; color: var(--plum-primary);">Recorded Cycles & Intervals:</span>
                  <button class="quick-action-btn" id="btn-open-manage-4-cycles-alt" style="font-size: 0.74rem; padding: 4px 10px; border-radius: var(--radius-full); cursor: pointer;">⚙️ Manage 4 Cycles</button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  ${(cycleMetrics.sortedCycles || []).map((c, i, arr) => {
                    let intervalText = '';
                    if (i < arr.length - 1) {
                      const nextOlder = arr[i + 1];
                      const interval = diffCalendarDays(nextOlder.startDate, c.startDate);
                      intervalText = `<span style="font-size: 0.75rem; color: var(--plum-muted); font-weight: 600;">(Interval: ${interval}d)</span>`;
                    }
                    return `
                      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; background: #FAF7F2; padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--sandal-border);">
                        <div>
                          <strong>${c.name || formatDateDisplay(c.startDate)}</strong>: ${c.startDate} (${c.durationDays || 5}d bleeding)
                        </div>
                        ${intervalText}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- Artwork and Comfort Card -->
            <div style="background: #FFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-lg); padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; box-shadow: 0 4px 18px rgba(71, 62, 105, 0.05);">
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 72px; height: 72px; border-radius: 50%; overflow: hidden; border: 2px solid var(--sandal-border); flex-shrink: 0;">
                  <img src="${ILLUSTRATION_IMAGES.cycle}" alt="Girl daydreaming" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <div>
                  <div class="serif-heading" style="font-size: 1.15rem; color: var(--plum-primary); margin: 0 0 2px;">Your Sanctuary Rhythm</div>
                  <p style="font-size: 0.82rem; color: var(--sandal-muted); margin: 0;">Every cycle is unique. Listen to your body and rest without guilt.</p>
                </div>
              </div>
              <div class="cycle-note-handwritten" style="font-family: var(--font-handwritten, cursive); font-size: 1.3rem; color: var(--plum-primary); flex-shrink: 0;">
                You got this ♡
              </div>
            </div>
          </div>
        </div>

        <!-- Medical Disclaimer -->
        <p style="font-size: 0.76rem; line-height: 1.45; color: var(--sandal-muted); margin-top: 10px; border-top: 1px solid var(--sandal-border-subtle); padding-top: 12px; text-align: center;">
          ⚠️ <em>Educational Prediction Notice:</em> Cycle forecasts are computed deterministically from your recorded start intervals. Hormonal cycles naturally vary with stress, sleep, and lifestyle. This tool provides menstrual wellness awareness and is not certified for diagnostic medical evaluation or contraception.
        </p>
      </div>
    </div>
  `;
}

function renderManage4CyclesModal(state, cycleMetrics) {
  const defaults = generateDefaultCycles().reverse(); // oldest first
  const sortedAsc = [...(state.cycles || [])].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const s1 = (sortedAsc[0] && sortedAsc[0].startDate) ? sortedAsc[0].startDate : defaults[0].startDate;
  const s2 = (sortedAsc[1] && sortedAsc[1].startDate) ? sortedAsc[1].startDate : defaults[1].startDate;
  const s3 = (sortedAsc[2] && sortedAsc[2].startDate) ? sortedAsc[2].startDate : defaults[2].startDate;
  const s4 = (sortedAsc[3] && sortedAsc[3].startDate) ? sortedAsc[3].startDate : defaults[3].startDate;

  const d1 = sortedAsc[0] ? (sortedAsc[0].durationDays || 5) : 5;
  const d2 = sortedAsc[1] ? (sortedAsc[1].durationDays || 4) : 4;
  const d3 = sortedAsc[2] ? (sortedAsc[2].durationDays || 5) : 5;
  const d4 = sortedAsc[3] ? (sortedAsc[3].durationDays || 4) : 4;

  return `
    <div class="modal-theme-panel" role="dialog" aria-modal="true" aria-labelledby="manage-cycles-title" style="max-width: 580px;">
      <div class="modal-theme-header">
        <div class="modal-theme-header-left">
          <div class="modal-theme-icon-box">⚙️</div>
          <div>
            <h2 class="modal-theme-title" id="manage-cycles-title">4 Cycles History & Predictor Setup</h2>
            <p class="modal-theme-sub">Provide your last 4 period start dates (oldest to newest) to calibrate your prediction engine.</p>
          </div>
        </div>
        <button class="modal-close-cross-btn" id="modal-close-btn" title="Close" style="color: var(--plum-primary);">✕</button>
      </div>

      <form id="form-manage-4-cycles">
        <div id="manage-4-cycles-error" style="display: none; background: #FFEBEE; border: 1px solid #FFCDD2; color: #C62828; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.84rem; margin-bottom: 14px;"></div>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 18px;">
          <!-- S1 -->
          <div style="background: #FFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-sm); padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <div>
              <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; color: var(--plum-muted);">S1 (Oldest Cycle)</span>
              <div style="font-size: 0.85rem; font-weight: 600; color: var(--plum-primary);">Period 1 Start Date:</div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="date" id="input-s1-date" value="${s1}" required class="optional-note-input" style="padding: 6px 10px; font-size: 0.85rem;" />
              <input type="number" id="input-d1-dur" value="${d1}" min="1" max="15" title="Bleeding duration (days)" class="optional-note-input" style="width: 55px; text-align: center; padding: 6px; font-size: 0.85rem;" />
              <span style="font-size: 0.75rem; color: var(--sandal-muted);">days</span>
            </div>
          </div>

          <!-- S2 -->
          <div style="background: #FFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-sm); padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <div>
              <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; color: var(--plum-muted);">S2 (2nd Cycle)</span>
              <div style="font-size: 0.85rem; font-weight: 600; color: var(--plum-primary);">Period 2 Start Date:</div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="date" id="input-s2-date" value="${s2}" required class="optional-note-input" style="padding: 6px 10px; font-size: 0.85rem;" />
              <input type="number" id="input-d2-dur" value="${d2}" min="1" max="15" title="Bleeding duration (days)" class="optional-note-input" style="width: 55px; text-align: center; padding: 6px; font-size: 0.85rem;" />
              <span style="font-size: 0.75rem; color: var(--sandal-muted);">days</span>
            </div>
          </div>

          <!-- S3 -->
          <div style="background: #FFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-sm); padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <div>
              <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; color: var(--plum-muted);">S3 (3rd Cycle)</span>
              <div style="font-size: 0.85rem; font-weight: 600; color: var(--plum-primary);">Period 3 Start Date:</div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="date" id="input-s3-date" value="${s3}" required class="optional-note-input" style="padding: 6px 10px; font-size: 0.85rem;" />
              <input type="number" id="input-d3-dur" value="${d3}" min="1" max="15" title="Bleeding duration (days)" class="optional-note-input" style="width: 55px; text-align: center; padding: 6px; font-size: 0.85rem;" />
              <span style="font-size: 0.75rem; color: var(--sandal-muted);">days</span>
            </div>
          </div>

          <!-- S4 -->
          <div style="background: #FFF; border: 1px solid var(--sandal-border); border-radius: var(--radius-sm); padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <div>
              <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; color: var(--plum-muted);">S4 (Most Recent Cycle)</span>
              <div style="font-size: 0.85rem; font-weight: 600; color: var(--plum-primary);">Period 4 Start Date:</div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="date" id="input-s4-date" value="${s4}" required class="optional-note-input" style="padding: 6px 10px; font-size: 0.85rem;" />
              <input type="number" id="input-d4-dur" value="${d4}" min="1" max="15" title="Bleeding duration (days)" class="optional-note-input" style="width: 55px; text-align: center; padding: 6px; font-size: 0.85rem;" />
              <span style="font-size: 0.75rem; color: var(--sandal-muted);">days</span>
            </div>
          </div>
        </div>

        <div style="font-size: 0.78rem; color: var(--sandal-muted); line-height: 1.45; margin-bottom: 16px;">
          ℹ️ Dates must be strictly chronological (S1 &lt; S2 &lt; S3 &lt; S4) with at least 15 days between consecutive starts. No future dates.
        </div>

        <div class="modal-actions-bar-theme">
          <button type="submit" class="btn-commit-theme" id="btn-save-4-cycles">
            <span>Save & Calibrate Predictor ✓</span>
          </button>
          <button type="button" class="btn-dismiss-theme" id="btn-cancel-4-cycles">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderLogCycleModal(state, cycleMetrics, defaultDate) {
  const initialDate = defaultDate || (cycleMetrics && cycleMetrics.estimatedStartDate ? cycleMetrics.estimatedStartDate : getTodayDateString());

  return `
    <div class="modal-theme-panel" role="dialog" aria-modal="true" aria-labelledby="log-cycle-title" style="max-width: 540px;">
      <div class="modal-theme-header">
        <div class="modal-theme-header-left">
          <div class="modal-theme-icon-box">🩸</div>
          <div>
            <h2 class="modal-theme-title" id="log-cycle-title">Record Period & Symptoms</h2>
            <p class="modal-theme-sub">Log when your actual period arrived to refine future cycle predictions.</p>
          </div>
        </div>
        <button class="modal-close-cross-btn" id="modal-close-btn" title="Close" style="color: var(--plum-primary);">✕</button>
      </div>

      <form id="form-log-cycle">
        <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 18px;">
          <!-- Period Start Date -->
          <div>
            <label style="font-size: 0.82rem; font-weight: 700; color: var(--plum-primary); display: block; margin-bottom: 4px;">
              Period Start Date:
            </label>
            <input type="date" id="input-log-start-date" value="${initialDate}" required class="optional-note-input" style="width: 100%; font-size: 0.95rem; padding: 8px 12px;" />
          </div>

          <!-- Duration & Flow Row -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.82rem; font-weight: 700; color: var(--plum-primary); display: block; margin-bottom: 4px;">
                Bleeding Duration:
              </label>
              <select id="select-log-duration" class="modal-select-timer" style="width: 100%; border-radius: var(--radius-sm); padding: 8px 10px;">
                <option value="3">3 Days</option>
                <option value="4">4 Days</option>
                <option value="5" selected>5 Days (Standard)</option>
                <option value="6">6 Days</option>
                <option value="7">7 Days</option>
                <option value="8">8 Days</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.82rem; font-weight: 700; color: var(--plum-primary); display: block; margin-bottom: 4px;">
                Flow Level:
              </label>
              <select id="select-log-flow" class="modal-select-timer" style="width: 100%; border-radius: var(--radius-sm); padding: 8px 10px;">
                <option value="spotting">Spotting</option>
                <option value="light">Light</option>
                <option value="medium" selected>Medium</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
          </div>

          <!-- Symptoms Checkboxes -->
          <div>
            <label style="font-size: 0.82rem; font-weight: 700; color: var(--plum-primary); display: block; margin-bottom: 6px;">
              Observed Sensations & Symptoms:
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              ${['Mild cramping', 'Sharp cramps', 'Lower back ache', 'Bloating', 'Fatigue / Low energy', 'Headache', 'Mood shift', 'Tender breasts'].map(sym => `
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; background: #FFF; padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid var(--sandal-border); cursor: pointer;">
                  <input type="checkbox" name="log-symptom" value="${sym}" />
                  <span>${sym}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Personal Notes -->
          <div>
            <label style="font-size: 0.82rem; font-weight: 700; color: var(--plum-primary); display: block; margin-bottom: 4px;">
              Personal Reflection / Comfort Notes:
            </label>
            <textarea id="textarea-log-notes" class="optional-note-input" rows="2" placeholder="Warmed up with peppermint tea, rested with heating pad..." style="width: 100%; font-size: 0.85rem; padding: 8px 12px; resize: vertical;"></textarea>
          </div>
        </div>

        <div class="modal-actions-bar-theme">
          <button type="submit" class="btn-commit-theme" id="btn-save-period-log">
            <span>Save Period Record 🩸</span>
          </button>
          <button type="button" class="btn-dismiss-theme" id="btn-cancel-period-log">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;
}

/* ==========================================================================
   HELPERS & MODALS
   ========================================================================== */
function renderActiveModal(state, cycleMetrics) {
  if (!activeModal) return '';

  if (activeModal === 'reminders') {
    return `
      <div class="moonlit-dark-modal-backdrop" id="modal-backdrop">
        ${renderRemindersCard(state)}
      </div>
    `;
  }

  if (activeModal === 'tasks') {
    return `
      <div class="moonlit-dark-modal-backdrop" id="modal-backdrop">
        ${renderTasksCard(state)}
      </div>
    `;
  }

  if (activeModal === 'manage-4-cycles') {
    return `
      <div class="moonlit-dark-modal-backdrop" id="modal-backdrop">
        ${renderManage4CyclesModal(state, cycleMetrics)}
      </div>
    `;
  }

  if (activeModal === 'log-cycle') {
    return `
      <div class="moonlit-dark-modal-backdrop" id="modal-backdrop">
        ${renderLogCycleModal(state, cycleMetrics, selectedDayForLog)}
      </div>
    `;
  }

  return '';
}

function renderAppLockScreen() {
  return `
    <div class="app-lock-overlay" role="dialog" aria-modal="true" aria-labelledby="lock-title">
      <div class="lock-box">
        <span style="font-size: 2.2rem;">🔒</span>
        <h2 class="serif-heading" id="lock-title" style="font-size: 1.6rem; margin: 12px 0 6px;">Your Sanctuary is Locked</h2>
        <p style="font-size: 0.85rem; color: var(--violet-muted-text); margin-bottom: 20px;">
          Enter your 4-digit PIN to access your private menstrual health journal.
        </p>

        <form id="form-unlock">
          <input type="password" id="input-pin-attempt" maxlength="4" class="optional-note-input" style="text-align: center; letter-spacing: 12px; font-size: 1.6rem; color: var(--sandal-primary); background: var(--violet-deep); border-color: var(--violet-border);" autofocus placeholder="••••" required />
          <div id="unlock-error" style="color: #FFB3B3; font-size: 0.8rem; height: 20px; margin-top: 6px;"></div>
          <button type="submit" class="btn-primary-pill" style="margin-top: 14px; width: 100%; justify-content: center;">Unlock NUTURA</button>
        </form>
      </div>
    </div>
  `;
}

function bindAppLockEvents() {
  const form = document.getElementById('form-unlock');
  const input = document.getElementById('input-pin-attempt');
  const errorDiv = document.getElementById('unlock-error');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = input.value;
      const success = store.unlockApp(entered);
      if (!success) {
        errorDiv.textContent = 'Incorrect PIN. Try default (1234).';
        input.value = '';
        input.focus();
      }
    });
  }
}

/**
 * DOM EVENT LISTENERS
 */
function bindEvents() {
  // Modal Backdrop Close
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalClose = document.getElementById('modal-close-btn');
  if (modalClose) {
    modalClose.addEventListener('click', () => { activeModal = null; render(); });
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) { activeModal = null; render(); }
    });
  }

  // Global Lock
  const btnGlobalLock = document.getElementById('btn-global-lock');
  if (btnGlobalLock) {
    btnGlobalLock.addEventListener('click', () => {
      const state = store.getState();
      if (state.privacySettings.appLockEnabled) {
        store.lockApp();
      } else {
        navigateTo('privacy');
      }
    });
  }

  // Accordion in Decode Body
  // Accordion in Decode Body
  const topicHeaders = document.querySelectorAll('.topic-header');
  topicHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const idx = th.getAttribute('data-topic-index');
      const body = document.getElementById(`topic-body-${idx}`);
      const caret = th.querySelector('.topic-caret');
      if (body) {
        const isHidden = (body.style.display === 'none' || !body.style.display);
        body.style.display = isHidden ? 'block' : 'none';
        if (caret) caret.textContent = isHidden ? '▴' : '▾';
      }
    });
  });

  // Tiny Steps Toggle & Add
  const tinyStepButtons = document.querySelectorAll('.btn-toggle-tiny-step');
  tinyStepButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-step-id');
      store.toggleTinyStep(id);
      render();
    });
  });

  const btnAddTinyStep = document.getElementById('btn-add-tiny-step');
  const inputNewTinyStep = document.getElementById('input-new-tiny-step');

  const handleAddTinyStep = () => {
    if (inputNewTinyStep && inputNewTinyStep.value.trim()) {
      store.addTinyStep(inputNewTinyStep.value.trim());
      inputNewTinyStep.value = '';
      render();
      showToast('Gentle Step Added! 🌿', 'Your new wellness habit has been saved.');
    }
  };

  if (btnAddTinyStep) {
    btnAddTinyStep.addEventListener('click', handleAddTinyStep);
  }
  if (inputNewTinyStep) {
    inputNewTinyStep.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTinyStep();
      }
    });
  }

  // App Lock save & trigger
  const btnSaveApplock = document.getElementById('btn-save-applock');
  if (btnSaveApplock) {
    btnSaveApplock.addEventListener('click', () => {
      const enabled = document.getElementById('check-enable-applock').checked;
      const pin = document.getElementById('input-new-pin').value;
      store.setAppLock(enabled, pin);
      showToast('Security PIN Saved! 🔒', 'Your 4-digit security PIN is now updated.');
    });
  }

  const btnTriggerLock = document.getElementById('btn-trigger-lock-now');
  if (btnTriggerLock) {
    btnTriggerLock.addEventListener('click', () => {
      const pin = document.getElementById('input-new-pin').value;
      store.setAppLock(true, pin);
      store.lockApp();
    });
  }

  // Copy summary
  const btnCopySummary = document.getElementById('btn-copy-summary');
  if (btnCopySummary) {
    btnCopySummary.addEventListener('click', () => {
      navigator.clipboard.writeText(store.exportReadableSummary());
      showToast('Summary Copied! 📋', 'Your menstrual health report has been copied to clipboard.');
    });
  }

  const btnDownloadJSON = document.getElementById('btn-download-json');
  if (btnDownloadJSON) {
    btnDownloadJSON.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(store.exportDataJSON());
      const a = document.createElement('a');
      a.setAttribute("href", dataStr);
      a.setAttribute("download", `nutura_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Backup Downloaded! 📥', 'Your nutura-data.json backup is saved.');
    });
  }

  const btnPurge = document.getElementById('btn-danger-purge');
  if (btnPurge) {
    btnPurge.addEventListener('click', () => {
      if (confirm('Permanently delete all your records? This cannot be undone.')) {
        store.resetAllData();
        navigateTo('decoder');
        showToast('Data Erased 🗑️', 'All records have been permanently cleared from this device.');
      }
    });
  }

  // ==========================================
  // HOMEPAGE INTERACTIONS
  // ==========================================
  const btnOpenReminders = document.getElementById('btn-open-reminders');
  if (btnOpenReminders) {
    btnOpenReminders.addEventListener('click', () => {
      activeModal = 'reminders';
      render();
    });
  }

  const btnOpenTasks = document.getElementById('btn-open-tasks');
  if (btnOpenTasks) {
    btnOpenTasks.addEventListener('click', () => {
      activeModal = 'tasks';
      render();
    });
  }

  // ==========================================
  // REMINDERS INTERACTIONS
  // ==========================================
  const btnCloseReminders = document.getElementById('btn-close-reminders-modal');
  const btnDismissReminders = document.getElementById('btn-dismiss-reminders');
  const handleCloseReminders = () => {
    activeModal = null;
    if (window.location.hash.includes('reminders')) {
      window.location.hash = '#/home';
    }
    const state = store.getState();
    const uncompleted = (state.reminders || []).filter(r => !r.completed);
    if (uncompleted.length > 0) {
      triggerUncompletedNotification('reminders');
    } else {
      render();
    }
  };
  if (btnCloseReminders) btnCloseReminders.addEventListener('click', handleCloseReminders);
  if (btnDismissReminders) btnDismissReminders.addEventListener('click', handleCloseReminders);

  const btnFocusReminderInput = document.getElementById('btn-focus-reminder-input');
  if (btnFocusReminderInput) {
    btnFocusReminderInput.addEventListener('click', () => {
      const input = document.getElementById('input-new-reminder');
      if (input) input.focus();
    });
  }

  const formAddReminder = document.getElementById('form-add-reminder');
  if (formAddReminder) {
    formAddReminder.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('input-new-reminder');
      const timerSelect = document.getElementById('select-reminder-timer');
      const timerMinutes = timerSelect ? parseInt(timerSelect.value, 10) : 15;
      if (input && input.value.trim()) {
        store.addReminder(input.value.trim(), timerMinutes);
        input.value = '';
        render();
        setTimeout(() => {
          const nextInput = document.getElementById('input-new-reminder');
          if (nextInput) nextInput.focus();
        }, 50);
      }
    });
  }

  // Toggle Reminder completion
  document.querySelectorAll('.btn-toggle-reminder').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-rem-id');
      if (id) {
        const item = store.toggleReminder(id);
        if (item && !item.completed) {
          triggerUncompletedNotification('reminders');
        } else {
          render();
        }
      }
    });
  });

  // Delete Reminder
  document.querySelectorAll('.btn-delete-reminder').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-rem-id');
      if (id) {
        store.deleteReminder(id);
        render();
      }
    });
  });

  // Commit Changes button for Reminders
  const btnCommitReminders = document.getElementById('btn-commit-reminders');
  if (btnCommitReminders) {
    btnCommitReminders.addEventListener('click', () => {
      activeModal = null;
      if (window.location.hash.includes('reminders')) {
        window.location.hash = '#/home';
      }
      triggerUncompletedNotification('reminders');
    });
  }

  // ==========================================
  // TODAY'S TASKS INTERACTIONS
  // ==========================================
  const btnCloseTasks = document.getElementById('btn-close-tasks-modal');
  const btnDismissTasks = document.getElementById('btn-dismiss-tasks');
  const handleCloseTasks = () => {
    activeModal = null;
    if (window.location.hash.includes('tasks')) {
      window.location.hash = '#/home';
    }
    const state = store.getState();
    const uncompleted = (state.todaysTasks || []).filter(t => !t.completed);
    if (uncompleted.length > 0) {
      triggerUncompletedNotification('tasks');
    } else {
      render();
    }
  };
  if (btnCloseTasks) btnCloseTasks.addEventListener('click', handleCloseTasks);
  if (btnDismissTasks) btnDismissTasks.addEventListener('click', handleCloseTasks);

  const formAddTask = document.getElementById('form-add-task');
  if (formAddTask) {
    formAddTask.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('input-new-task');
      const timerSelect = document.getElementById('select-task-timer');
      const timerMinutes = timerSelect ? parseInt(timerSelect.value, 10) : 30;
      if (input && input.value.trim()) {
        store.addTask(input.value.trim(), '✦', timerMinutes);
        input.value = '';
        render();
        setTimeout(() => {
          const nextInput = document.getElementById('input-new-task');
          if (nextInput) nextInput.focus();
        }, 50);
      }
    });
  }

  // Toggle Task completion
  document.querySelectorAll('.btn-toggle-task').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-task-id');
      if (id) {
        const item = store.toggleTask(id);
        if (item && !item.completed) {
          triggerUncompletedNotification('tasks');
        } else {
          render();
        }
      }
    });
  });

  // Delete Task
  document.querySelectorAll('.btn-delete-task').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-task-id');
      if (id) {
        store.deleteTask(id);
        render();
      }
    });
  });

  // Commit Changes button for Tasks
  const btnCommitTasks = document.getElementById('btn-commit-tasks');
  if (btnCommitTasks) {
    btnCommitTasks.addEventListener('click', () => {
      activeModal = null;
      if (window.location.hash.includes('tasks')) {
        window.location.hash = '#/home';
      }
      triggerUncompletedNotification('tasks');
    });
  }

  // ==========================================
  // TOAST NOTIFICATION ACTIONS
  // ==========================================
  const btnCloseToast = document.getElementById('btn-close-toast');
  const btnDismissToast = document.getElementById('btn-toast-dismiss');
  if (btnCloseToast) {
    btnCloseToast.addEventListener('click', () => {
      activeToastNotification = null;
      render();
    });
  }
  if (btnDismissToast) {
    btnDismissToast.addEventListener('click', () => {
      activeToastNotification = null;
      render();
    });
  }

  const btnToastMarkAll = document.getElementById('btn-toast-mark-all');
  if (btnToastMarkAll && activeToastNotification) {
    btnToastMarkAll.addEventListener('click', () => {
      const state = store.getState();
      if (activeToastNotification.targetType === 'reminders') {
        const list = (state.reminders || []).map(r => ({ ...r, completed: true }));
        store.saveReminders(list);
      } else if (activeToastNotification.targetType === 'tasks') {
        const list = (state.todaysTasks || []).map(t => ({ ...t, completed: true }));
        store.saveTasks(list);
      }
      activeToastNotification = {
        title: 'All Completed! ✨',
        message: 'Great job! Everything is checked off and completed.',
        items: [],
        isSuccess: true
      };
      render();
    });
  }

  // ==========================================
  // MY CYCLE PAGE & CALENDAR INTERACTIONS
  // ==========================================
  const calPrevBtn = document.getElementById('cal-prev-btn');
  if (calPrevBtn) {
    calPrevBtn.addEventListener('click', () => {
      calendarViewMonth--;
      if (calendarViewMonth < 1) {
        calendarViewMonth = 12;
        calendarViewYear--;
      }
      render();
    });
  }

  const calNextBtn = document.getElementById('cal-next-btn');
  if (calNextBtn) {
    calNextBtn.addEventListener('click', () => {
      calendarViewMonth++;
      if (calendarViewMonth > 12) {
        calendarViewMonth = 1;
        calendarViewYear++;
      }
      render();
    });
  }

  const calTodayBtn = document.getElementById('cal-today-btn');
  if (calTodayBtn) {
    calTodayBtn.addEventListener('click', () => {
      const now = new Date();
      calendarViewYear = now.getFullYear();
      calendarViewMonth = now.getMonth() + 1;
      render();
    });
  }

  // Click on any day cell to open quick log for that day
  document.querySelectorAll('.cal-day-cell[data-cal-date]').forEach(cell => {
    cell.addEventListener('click', () => {
      const d = cell.getAttribute('data-cal-date');
      selectedDayForLog = d;
      activeModal = 'log-cycle';
      render();
    });
  });

  // Open Log Cycle Modal
  const btnOpenLogCycle = document.getElementById('btn-open-log-cycle');
  if (btnOpenLogCycle) {
    btnOpenLogCycle.addEventListener('click', () => {
      selectedDayForLog = getTodayDateString();
      activeModal = 'log-cycle';
      render();
    });
  }

  const btnOpenRecordPeriod = document.getElementById('btn-open-record-period');
  if (btnOpenRecordPeriod) {
    btnOpenRecordPeriod.addEventListener('click', () => {
      selectedDayForLog = getTodayDateString();
      activeModal = 'log-cycle';
      render();
    });
  }

  // Universal Modal Dismiss / Cancel Handlers
  document.querySelectorAll('.modal-close-cross-btn, #btn-cancel-4-cycles, #btn-cancel-period-log').forEach(btn => {
    btn.addEventListener('click', () => {
      activeModal = null;
      render();
    });
  });

  // Form Log Cycle Submit
  const formLogCycle = document.getElementById('form-log-cycle');
  if (formLogCycle) {
    formLogCycle.addEventListener('submit', (e) => {
      e.preventDefault();
      const startDate = document.getElementById('input-log-start-date').value;
      const durationSelect = document.getElementById('select-log-duration');
      const duration = durationSelect ? parseInt(durationSelect.value, 10) : 5;
      const flowSelect = document.getElementById('select-log-flow');
      const flow = flowSelect ? flowSelect.value : 'medium';
      const symptoms = [];
      document.querySelectorAll('input[name="log-symptom"]:checked').forEach(cb => {
        symptoms.push(cb.value);
      });
      const notesEl = document.getElementById('textarea-log-notes');
      const notes = notesEl ? notesEl.value.trim() : '';

      const state = store.getState();
      const latestCycle = state.cycles[0];
      if (latestCycle && latestCycle.startDate && latestCycle.startDate !== startDate) {
        const diff = Math.abs(diffCalendarDays(latestCycle.startDate, startDate));
        if (diff < 15) {
          showToast('Validation Notice ⚠️', `A period cannot start within 15 days of your previous recorded period (${latestCycle.startDate}). Interval was only ${diff} days.`, false);
          return;
        }
      }

      store.recordActualPeriod(startDate, duration, flow, symptoms, notes);
      activeModal = null;
      showToast('Period Recorded! 🩸', 'Your flow record has been saved and cycle predictions updated.');
    });
  }

  // Open 4-Cycles History Setup Modal
  const btnOpenManage4 = document.getElementById('btn-open-manage-4-cycles');
  const btnOpenManage4Alt = document.getElementById('btn-open-manage-4-cycles-alt');
  const handleOpenManage4 = () => {
    activeModal = 'manage-4-cycles';
    render();
  };
  if (btnOpenManage4) btnOpenManage4.addEventListener('click', handleOpenManage4);
  if (btnOpenManage4Alt) btnOpenManage4Alt.addEventListener('click', handleOpenManage4);

  // Form Manage 4-Cycles Submit
  const formManage4 = document.getElementById('form-manage-4-cycles');
  if (formManage4) {
    formManage4.addEventListener('submit', (e) => {
      e.preventDefault();
      const s1 = document.getElementById('input-s1-date').value;
      const s2 = document.getElementById('input-s2-date').value;
      const s3 = document.getElementById('input-s3-date').value;
      const s4 = document.getElementById('input-s4-date').value;

      const d1 = parseInt(document.getElementById('input-d1-dur').value, 10) || 5;
      const d2 = parseInt(document.getElementById('input-d2-dur').value, 10) || 4;
      const d3 = parseInt(document.getElementById('input-d3-dur').value, 10) || 5;
      const d4 = parseInt(document.getElementById('input-d4-dur').value, 10) || 4;

      const validation = validateFourDates([s1, s2, s3, s4]);
      const errorBox = document.getElementById('manage-4-cycles-error');

      if (!validation.valid && !validation.isValid) {
        if (errorBox) {
          errorBox.textContent = `⚠️ ${validation.error}`;
          errorBox.style.display = 'block';
        }
        return;
      }

      store.setFourHistoricalCycles([s1, s2, s3, s4], [d1, d2, d3, d4]);
      activeModal = null;
      showToast('Predictor Calibrated! ✨', 'Your 4 historical cycle intervals have been calibrated and predictions updated.');
    });
  }

  // Doctor Visit event bindings
  if (currentRoute.startsWith('heard') || currentRoute.startsWith('doctor')) {
    bindDoctorVisitEvents(render);
  }

  // Ask Nutura chatbot bindings
  if (currentRoute === 'ask-nutura' || currentRoute === 'ask-mimi' || currentRoute === 'chat') {
    bindAskMimiEvents(render);
  }
}

// HTML escape helper
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   HOMEPAGE: REFINED SANDAL & PLUM DESIGN
   ========================================================================== */
function renderLandingHomePage(state, cycleMetrics) {
  const currentState = state || store.getState();
  const reminders = currentState.reminders || [];
  const uncompletedReminders = reminders.filter(r => !r.completed).length;

  const tasks = currentState.todaysTasks || [];
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const previewTasks = tasks.slice(0, 3);

  const tasksPreviewHtml = previewTasks.length > 0 ? previewTasks.map(t => `
    <div class="task-preview-pill-theme">
      <span>${t.icon || '✦'}</span>
      <span>${escapeHtml(t.text)}</span>
    </div>
  `).join('') : `
    <div class="task-preview-pill-theme">🧘 Gentle Stretch</div>
    <div class="task-preview-pill-theme">🥦 Nourish Well</div>
  `;

  return `
    <div class="moonlit-home-wrapper">
      <div class="moonlit-home-canvas">

        <!-- 1. Hero Section: About Nutura + Anime Window Scene -->
        <section class="home-hero-row">
          <!-- Left: About Nutura Card -->
          <div class="home-about-card">
            <div class="about-icon-circle">
              <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 8C14.268 8 8 14.268 8 22C8 29.732 14.268 36 22 36C26.1132 36 29.7997 34.2255 32.3536 31.4239C24.8 30.5 19 24.5 19 17C19 13.5 20.3 10.3 22.5 8C22.33 8 22.17 8 22 8Z" fill="#FAF6F0" />
                <circle cx="34" cy="14" r="2.5" fill="#FAF6F0"/>
                <circle cx="38" cy="22" r="1.5" fill="#FAF6F0"/>
              </svg>
            </div>
            <div>
              <h2 class="about-card-title">About Nutura</h2>
              <p class="about-card-desc">
                A private, evidence-informed digital sanctuary for menstrual wellness, cycle tracking, hormonal clarity, and clinical consultation readiness. We provide a calm, dignified space to anticipate biological shifts, understand symptoms without fear, soothe discomfort with gentle micro-routines, and advocate for your care — 100% offline and protected on your device.
              </p>
              <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                <span class="task-preview-pill-theme" style="background: #FFF; border-color: var(--sandal-border);">🌿 Gentle Routine</span>
                <span class="task-preview-pill-theme" style="background: #FFF; border-color: var(--sandal-border);">🔒 100% Offline &amp; Private</span>
                <span class="task-preview-pill-theme" style="background: #FFF; border-color: var(--sandal-border);">🩺 Doctor Visit Advocacy</span>
                <span class="task-preview-pill-theme" style="background: #FFF; border-color: var(--sandal-border);">🌸 Endocrine Clarity</span>
              </div>
            </div>
          </div>

          <!-- Right: Anime Girl Sitting by Starry Window -->
          <div class="home-window-art-card">
            <img src="${ILLUSTRATION_IMAGES.hero}" alt="Girl sitting by the window with headphones" class="home-window-art-img" />
            <div class="home-window-art-quote">
              Some girl.<br />Different days.<br />Same dreams ♡
            </div>
          </div>
        </section>

        <!-- 2. Period Countdown Banner with Live Clock -->
        <a href="#/cycle" class="home-countdown-card" style="text-decoration: none; color: inherit; cursor: pointer;" title="Open My Cycle Calendar">
          <div class="countdown-left-group">
            <div class="countdown-calendar-icon">📅</div>
            <div>
              <div style="font-size: 0.72rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--plum-muted); margin-bottom: 2px;">
                ${cycleMetrics.countdown.subtext || 'Cycle Forecast • ' + cycleMetrics.countdown.label}
              </div>
              <h1 class="countdown-main-heading">
                ${cycleMetrics.countdown.headline}
              </h1>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="countdown-timer-badge" id="countdown-live-timer" title="Live Clock">0:00:12</div>
            <span style="font-size: 0.88rem; color: var(--plum-primary); font-weight: 700;">Open Calendar →</span>
          </div>
        </a>

        <!-- 3. Interactive Action Cards: Reminders & Tasks -->
        <section class="home-action-grid">
          <!-- Reminders Card -->
          <div class="home-action-button-card" id="btn-open-reminders" role="button" tabindex="0" title="Click to view and edit Reminders">
            <div class="action-card-left">
              <div class="action-card-icon-box">🔔</div>
              <div>
                <h3 class="action-card-title">Reminders</h3>
                <p class="action-card-sub">${reminders.length} item${reminders.length !== 1 ? 's' : ''} • ${uncompletedReminders} pending</p>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
              <span class="timer-tag tag-active" style="cursor: pointer;">Set Timer ⏱</span>
              <span style="color: var(--plum-primary); font-size: 0.8rem; font-weight: 700;">Open →</span>
            </div>
          </div>

          <!-- Today's Tasks Card -->
          <div class="home-action-button-card" id="btn-open-tasks" role="button" tabindex="0" title="Click to view and edit Today's Tasks">
            <div class="action-card-left">
              <div class="action-card-icon-box">☑</div>
              <div>
                <h3 class="action-card-title">Today's Tasks</h3>
                <p class="action-card-sub">${completedTasks} / ${totalTasks} completed</p>
              </div>
            </div>
            <div class="home-tasks-preview-list-theme">
              ${tasksPreviewHtml}
            </div>
          </div>
        </section>

        <!-- 4. Nutura Pillars of Care & Cyclical Architecture -->
        <section class="nutura-pillars-section">
          <div class="nutura-section-header">
            <span class="nutura-badge-pill">✦ The Nutura Framework</span>
            <h2 class="nutura-section-title">Designed for Bodily Autonomy &amp; Clinical Clarity</h2>
            <p class="nutura-section-desc">
              Nutura bridges the gap between daily cycle awareness and professional healthcare. Every feature is rooted in clinical safety, endocrine balance, and complete data privacy.
            </p>
          </div>

          <div class="nutura-pillars-grid">
            <!-- Pillar 1: Cyclical Intelligence -->
            <a href="#/cycle" class="nutura-pillar-card" title="Open My Cycle Calendar">
              <div>
                <div class="nutura-pillar-top">
                  <div class="nutura-pillar-icon">🌙</div>
                  <div>
                    <h3 class="nutura-pillar-title">Cyclical Rhythm Intelligence</h3>
                    <span class="nutura-pillar-tag">Phase Harmony</span>
                  </div>
                </div>
                <p class="nutura-pillar-desc">
                  Follow the biological transitions across Menstrual, Follicular, Ovulatory, and Luteal phases. Understand fluctuations in energy, mood, and sleep with gentle predictive tracking calibrated to your body.
                </p>
              </div>
              <div class="nutura-pillar-bottom">
                <span style="font-size: 0.76rem; color: var(--sandal-muted);">Real Personal History</span>
                <span class="nutura-pillar-action">Open Calendar →</span>
              </div>
            </a>

            <!-- Pillar 2: Endocrine & Nutritional Clarity -->
            <a href="#/decoder" class="nutura-pillar-card" title="Open Body &amp; Food Decoder">
              <div>
                <div class="nutura-pillar-top">
                  <div class="nutura-pillar-icon">🥑</div>
                  <div>
                    <h3 class="nutura-pillar-title">Endocrine &amp; Body Literacy</h3>
                    <span class="nutura-pillar-tag">Symptom Decoding</span>
                  </div>
                </div>
                <p class="nutura-pillar-desc">
                  Demystify cravings, bloating, fatigue, and PCOS/PCOD indicators. Connect the dots between blood sugar rhythm and hormonal health through non-restrictive, evidence-based nutrition freedom.
                </p>
              </div>
              <div class="nutura-pillar-bottom">
                <span style="font-size: 0.76rem; color: var(--sandal-muted);">Holistic Education</span>
                <span class="nutura-pillar-action">Explore Decor →</span>
              </div>
            </a>

            <!-- Pillar 3: Clinical Consultation Advocacy -->
            <a href="#/heard" class="nutura-pillar-card" title="Open Doctor Visit Hub">
              <div>
                <div class="nutura-pillar-top">
                  <div class="nutura-pillar-icon">🩺</div>
                  <div>
                    <h3 class="nutura-pillar-title">Clinical Visit Empowerment</h3>
                    <span class="nutura-pillar-tag">Doctor Preparation</span>
                  </div>
                </div>
                <p class="nutura-pillar-desc">
                  Never feel unheard in medical appointments again. Generate a chronological symptom summary, track peak pain patterns, and review categorized physician questions built from clinical guidelines.
                </p>
              </div>
              <div class="nutura-pillar-bottom">
                <span style="font-size: 0.76rem; color: var(--sandal-muted);">Printable Summaries</span>
                <span class="nutura-pillar-action">Prepare Visit →</span>
              </div>
            </a>

            <!-- Pillar 4: Ask Nutura Private Assistant -->
            <a href="#/ask-nutura" class="nutura-pillar-card" title="Chat with Ask Nutura">
              <div>
                <div class="nutura-pillar-top">
                  <div class="nutura-pillar-icon">🌸</div>
                  <div>
                    <h3 class="nutura-pillar-title">Ask Nutura Offline Companion</h3>
                    <span class="nutura-pillar-tag">100% On-Device</span>
                  </div>
                </div>
                <p class="nutura-pillar-desc">
                  Get safe answers on menstrual sensations, puberty, and PCOS without exposing personal questions to remote servers. Governed by a 3-tier clinical safety triage engine that always puts human health first.
                </p>
              </div>
              <div class="nutura-pillar-bottom">
                <span style="font-size: 0.76rem; color: var(--sandal-muted);">Zero Cloud Requests</span>
                <span class="nutura-pillar-action">Chat Privately →</span>
              </div>
            </a>
          </div>

          <!-- Daily Wisdom / Affirmation Callout -->
          <div class="nutura-quote-banner">
            <span class="nutura-quote-symbol">✦</span>
            <p class="nutura-quote-text">
              "Your body is a cyclical rhythm, not an uninterrupted clock. Rest without guilt during quiet days, nourish with freedom, and honor your personal biological timeline."
            </p>
          </div>
        </section>

      </div>
    </div>
  `;
}

/* ==========================================================================
   IMAGE 2: REMINDERS MODAL CARD WITH TIMERS
   ========================================================================== */
function renderRemindersCard(state) {
  const currentState = state || store.getState();
  const reminders = currentState.reminders || [];

  return `
    <div class="modal-theme-panel" role="dialog" aria-modal="true" aria-labelledby="reminders-modal-title">
      <!-- Header -->
      <div class="modal-theme-header">
        <div class="modal-theme-header-left">
          <div class="modal-theme-icon-box">🔔</div>
          <div>
            <h2 class="modal-theme-title" id="reminders-modal-title">Reminders</h2>
            <p class="modal-theme-sub">Write down anything you want to remember with a timer.</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="modal-close-cross-btn" id="btn-close-reminders-modal" title="Close" style="color: var(--plum-primary); background: rgba(71, 62, 105, 0.1);">✕</button>
        </div>
      </div>

      <!-- Input Field Row with Timer Select and + button -->
      <form id="form-add-reminder" class="modal-input-row-theme">
        <input 
          type="text" 
          id="input-new-reminder" 
          class="modal-input-field-theme" 
          placeholder="Type your reminder..." 
          autocomplete="off" 
          required 
        />
        <select id="select-reminder-timer" class="modal-select-timer" title="Select timer duration">
          <option value="1">⏱ 1 min (Test / Fast)</option>
          <option value="5">⏱ 5 mins</option>
          <option value="15" selected>⏱ 15 mins</option>
          <option value="30">⏱ 30 mins</option>
          <option value="60">⏱ 1 hour</option>
          <option value="120">⏱ 2 hours</option>
        </select>
        <button type="submit" class="modal-btn-add-theme" title="Add reminder">+</button>
      </form>

      <!-- Reminders List -->
      <div class="modal-items-list-theme" id="reminders-list-container">
        ${reminders.length === 0 ? `
          <div style="text-align: center; color: var(--sandal-muted); padding: 24px 0; font-size: 0.9rem;">
            No reminders yet. Add one with a timer above!
          </div>
        ` : reminders.map(rem => `
          <div class="modal-item-row-theme" data-rem-id="${rem.id}">
            <div class="item-left-group-theme btn-toggle-reminder" data-rem-id="${rem.id}" style="cursor: pointer;">
              <div class="item-circle-check-theme ${rem.completed ? 'checked' : 'unchecked'}">
                ${rem.completed ? '✓' : ''}
              </div>
              <div>
                <span class="modal-item-text-theme ${rem.completed ? 'is-done' : ''}">${escapeHtml(rem.text)}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div data-timer-due="${rem.dueTimestamp || ''}" data-timer-done="${rem.completed}">
                ${formatRemainingTimer(rem.dueTimestamp, rem.completed)}
              </div>
              <button class="modal-item-delete-btn btn-delete-reminder" data-rem-id="${rem.id}" title="Delete reminder" style="color: var(--sandal-muted);">✕</button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Action Bar with 'Commit Changes' button -->
      <div class="modal-actions-bar-theme">
        <button type="button" class="btn-commit-theme" id="btn-commit-reminders">
          <span>Commit Changes ✓</span>
        </button>
        <button type="button" class="btn-dismiss-theme" id="btn-dismiss-reminders">
          Back to Home
        </button>
      </div>
    </div>
  `;
}

/* ==========================================================================
   IMAGE 3: TODAY'S TASKS MODAL CARD WITH TIMERS
   ========================================================================== */
function renderTasksCard(state) {
  const currentState = state || store.getState();
  const tasks = currentState.todaysTasks || [];
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return `
    <div class="modal-theme-panel" role="dialog" aria-modal="true" aria-labelledby="tasks-modal-title">
      <!-- Header -->
      <div class="modal-theme-header">
        <div class="modal-theme-header-left">
          <div class="modal-theme-icon-box">☑</div>
          <div>
            <h2 class="modal-theme-title" id="tasks-modal-title">Today's Tasks</h2>
            <p class="modal-theme-sub">Mark completed tasks. Timers keep your routine focused.</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="countdown-timer-badge" style="font-size: 0.8rem; padding: 4px 10px;">${completedCount} / ${totalCount} Done</span>
          <button class="modal-close-cross-btn" id="btn-close-tasks-modal" title="Close" style="color: var(--plum-primary); background: rgba(71, 62, 105, 0.1);">✕</button>
        </div>
      </div>

      <!-- Input Field Row with Timer Select and + button -->
      <form id="form-add-task" class="modal-input-row-theme">
        <input 
          type="text" 
          id="input-new-task" 
          class="modal-input-field-theme" 
          placeholder="Type your task..." 
          autocomplete="off" 
          required 
        />
        <select id="select-task-timer" class="modal-select-timer" title="Select task timer duration">
          <option value="1">⏱ 1 min (Test / Fast)</option>
          <option value="5">⏱ 5 mins</option>
          <option value="15">⏱ 15 mins</option>
          <option value="30" selected>⏱ 30 mins</option>
          <option value="60">⏱ 1 hour</option>
          <option value="120">⏱ 2 hours</option>
        </select>
        <button type="submit" class="modal-btn-add-theme" title="Add task">+</button>
      </form>

      <!-- Task List -->
      <div class="modal-items-list-theme" id="tasks-list-container">
        ${tasks.length === 0 ? `
          <div style="text-align: center; color: var(--sandal-muted); padding: 24px 0; font-size: 0.9rem;">
            No tasks yet. Add one with a timer above!
          </div>
        ` : tasks.map(task => `
          <div class="modal-item-row-theme" data-task-id="${task.id}">
            <div class="item-left-group-theme btn-toggle-task" data-task-id="${task.id}" style="cursor: pointer;">
              <div class="item-square-check-theme ${task.completed ? 'checked' : 'unchecked'}">
                ${task.completed ? '✓' : ''}
              </div>
              <div>
                <span class="modal-item-text-theme ${task.completed ? 'is-done' : ''}">${escapeHtml(task.text)}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div data-timer-due="${task.dueTimestamp || ''}" data-timer-done="${task.completed}">
                ${formatRemainingTimer(task.dueTimestamp, task.completed)}
              </div>
              <button class="modal-item-delete-btn btn-delete-task" data-task-id="${task.id}" title="Delete task" style="color: var(--sandal-muted);">✕</button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Action Bar with 'Commit Changes' button -->
      <div class="modal-actions-bar-theme">
        <button type="button" class="btn-commit-theme" id="btn-commit-tasks">
          <span>Commit Changes ✓</span>
        </button>
        <button type="button" class="btn-dismiss-theme" id="btn-dismiss-tasks">
          Back to Home
        </button>
      </div>
    </div>
  `;
}

/* ==========================================================================
   UNCOMPLETED / DELAYED NOTIFICATION POPUP SYSTEM
   ========================================================================== */
function renderActiveToast() {
  if (!activeToastNotification) return '';

  const isSuccess = activeToastNotification.isSuccess;

  return `
    <div class="moonlit-toast-popup-container" id="toast-popup-box" role="alert">
      <div class="moonlit-toast-card-theme ${isSuccess ? 'is-success' : ''}">
        <div class="toast-header-row-theme">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.3rem;">${isSuccess ? '✨' : '⏰'}</span>
            <span class="toast-title-text-theme ${isSuccess ? 'is-success' : ''}">${activeToastNotification.title}</span>
          </div>
          <button class="modal-close-cross-btn" id="btn-close-toast" title="Close" style="color: var(--plum-primary);">✕</button>
        </div>
        <div style="font-size: 0.88rem; line-height: 1.5; color: var(--plum-dark); margin-bottom: 12px;">
          ${activeToastNotification.message}
        </div>
        ${activeToastNotification.items && activeToastNotification.items.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px;">
            ${activeToastNotification.items.map(it => `
              <div style="font-size: 0.82rem; background: #FAF7F2; border: 1px solid var(--sandal-border); padding: 6px 10px; border-radius: var(--radius-sm); font-weight: 600; color: var(--plum-primary);">
                ○ ${escapeHtml(it)}
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          ${activeToastNotification.actionBtn ? `
            <button class="btn-commit-theme" id="btn-toast-mark-all" style="padding: 8px 18px; font-size: 0.82rem;">${activeToastNotification.actionBtn}</button>
          ` : ''}
          <button class="btn-dismiss-theme" id="btn-toast-dismiss" style="padding: 7px 14px; font-size: 0.82rem;">Dismiss</button>
        </div>
      </div>
    </div>
  `;
}

function triggerUncompletedNotification(type = 'reminders') {
  const state = store.getState();
  const now = Date.now();

  if (type === 'reminders') {
    const uncompleted = (state.reminders || []).filter(r => !r.completed);
    const delayed = uncompleted.filter(r => r.dueTimestamp && now >= r.dueTimestamp);

    if (delayed.length > 0) {
      activeToastNotification = {
        title: '⏰ Delayed Reminders Alert!',
        message: `You have ${delayed.length} delayed reminder${delayed.length > 1 ? 's' : ''}! Please complete them.`,
        items: delayed.map(r => r.text),
        actionBtn: 'Mark All Reminders Done',
        targetType: 'reminders'
      };
      trySendNativeNotification('Nutura Alert: Reminders Delayed!', `Delayed: ${delayed.map(r => r.text).join(', ')}`);
    } else if (uncompleted.length > 0) {
      activeToastNotification = {
        title: 'Pending Reminders Alert',
        message: `You have ${uncompleted.length} uncompleted reminder${uncompleted.length > 1 ? 's' : ''}. Don't forget to take care of yourself!`,
        items: uncompleted.map(r => r.text),
        actionBtn: 'Mark All Reminders Done',
        targetType: 'reminders'
      };
      trySendNativeNotification('Nutura Reminder', `You have ${uncompleted.length} pending reminder(s)`);
    } else {
      activeToastNotification = {
        title: 'All Reminders Completed! ✨',
        message: 'Everything is checked off! You are taking wonderful care of your routine.',
        items: [],
        targetType: 'reminders',
        isSuccess: true
      };
    }
  } else if (type === 'tasks') {
    const uncompleted = (state.todaysTasks || []).filter(t => !t.completed);
    const delayed = uncompleted.filter(t => t.dueTimestamp && now >= t.dueTimestamp);

    if (delayed.length > 0) {
      activeToastNotification = {
        title: '⏰ Delayed Tasks Alert!',
        message: `You have ${delayed.length} delayed task${delayed.length > 1 ? 's' : ''}! Let's finish them up.`,
        items: delayed.map(t => t.text),
        actionBtn: 'Mark All Tasks Done',
        targetType: 'tasks'
      };
      trySendNativeNotification('Nutura Alert: Tasks Delayed!', `Delayed: ${delayed.map(t => t.text).join(', ')}`);
    } else if (uncompleted.length > 0) {
      activeToastNotification = {
        title: 'Pending Tasks Alert',
        message: `You have ${uncompleted.length} uncompleted task${uncompleted.length > 1 ? 's' : ''}. Keep going, you're doing great!`,
        items: uncompleted.map(t => t.text),
        actionBtn: 'Mark All Tasks Done',
        targetType: 'tasks'
      };
      trySendNativeNotification('Nutura Tasks', `You have ${uncompleted.length} pending task(s)`);
    } else {
      activeToastNotification = {
        title: 'All Tasks Completed! 🎉',
        message: 'Amazing! All your daily goals are 100% completed!',
        items: [],
        targetType: 'tasks',
        isSuccess: true
      };
    }
  }
  render();
}

function trySendNativeNotification(title, body) {
  try {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body });
          }
        });
      }
    }
  } catch (e) {
    // Ignore notification errors in restricted contexts
  }
}
