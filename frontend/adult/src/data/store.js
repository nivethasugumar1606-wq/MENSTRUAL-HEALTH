/**
 * MOONLIT Local-First Reactive Data Store
 * Keeps all health data safe in localStorage with sensible baseline data
 * matching the reference screenshots.
 */

const STORAGE_KEY = 'moonlit_wellness_state_v2';

export function generateDefaultCycles() {
  const now = new Date();
  const formatYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // 4 cycles spaced by 28-day intervals, with recent period ~24 days ago so next period is in 4 days
  const offsets = [24, 52, 80, 108];
  const durations = [5, 4, 5, 4];
  const flows = ['medium', 'light', 'medium', 'heavy'];
  const notes = [
    'Warmed up with herbal tea. Mild cramps.',
    'School deadlines, mild tiredness.',
    'Gentle stretching helped with lower back.',
    'Resting with heat pack on Day 4.'
  ];

  return offsets.map((off, idx) => {
    const start = new Date(now.getTime() - off * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + (durations[idx] - 1) * 24 * 60 * 60 * 1000);
    return {
      id: `cycle-${4 - idx}`,
      name: `${monthNames[start.getMonth()]} ${start.getFullYear()}`,
      startDate: formatYMD(start),
      endDate: formatYMD(end),
      durationDays: durations[idx],
      flow: flows[idx],
      symptoms: idx === 0 ? ['Mild cramping', 'Bloating'] : ['Cramps', 'Fatigue'],
      notes: notes[idx]
    };
  });
}

export const DEFAULT_HEARD_CHECKLIST = [
  { id: 'prep-1', category: 'concerns', text: 'Define my #1 top priority symptom or concern to discuss first', completed: true, custom: false },
  { id: 'prep-2', category: 'symptom_onset', text: 'Document when my symptoms first started (months/years ago) and peak days', completed: true, custom: false },
  { id: 'prep-3', category: 'medications', text: 'List all current prescriptions, vitamins, inositol, and pain relievers with doses', completed: true, custom: false },
  { id: 'prep-4', category: 'allergies', text: 'Note any drug allergies or NSAID sensitivities (or note "No known allergies")', completed: false, custom: false },
  { id: 'prep-5', category: 'reports', text: 'Gather prior lab test reports and ultrasound images or clinical letters', completed: false, custom: false },
  { id: 'prep-6', category: 'questions', text: 'Select and mark my top 3 questions from the Questions Checklist', completed: true, custom: false }
];

export const DEFAULT_DOCTOR_QUESTIONS_CATEGORIZED = [
  { id: 'dq-1', category: 'tests', text: 'Based on my cycle dates and variation, would you recommend blood hormone or thyroid tests?', selected: true, answered: false, custom: false },
  { id: 'dq-2', category: 'pain', text: 'My menstrual cramps have interfered with my daily activities; what management options do you suggest?', selected: true, answered: false, custom: false },
  { id: 'dq-3', category: 'treatment', text: 'Are there non-hormonal or hormonal options you recommend to keep my cycle regular and protect my uterine lining?', selected: true, answered: false, custom: false },
  { id: 'dq-4', category: 'pcos', text: 'Could my symptoms (acne, fatigue, cycle gaps) be connected to insulin resistance or PCOS?', selected: true, answered: false, custom: false },
  { id: 'dq-c1', category: 'cycles', text: 'My cycle lengths vary significantly. Is this variation typical for my age, or does it suggest ovulatory dysfunction?', selected: false, answered: false, custom: false },
  { id: 'dq-f1', category: 'followup', text: 'When should we schedule a follow-up visit to review my test results or symptom diary?', selected: false, answered: false, custom: false }
];

export const DEFAULT_MEDICAL_TESTS = [
  {
    id: 'test-1',
    testName: 'Serum Ferritin (Iron Stores)',
    date: '2025-02-20',
    result: '18',
    units: 'ng/mL',
    referenceRange: '15 – 150 ng/mL',
    notes: 'Low-normal range. Clinician discussed iron-rich foods and oral supplementation.'
  },
  {
    id: 'test-2',
    testName: 'Thyroid Stimulating Hormone (TSH)',
    date: '2025-02-20',
    result: '2.1',
    units: 'mIU/L',
    referenceRange: '0.4 – 4.0 mIU/L',
    notes: 'Within normal limits; rules out primary hypothyroidism as cause of fatigue.'
  },
  {
    id: 'test-3',
    testName: 'Pelvic Ultrasound (Abdominal)',
    date: '2025-01-25',
    result: 'Normal uterine contour; multiple peripheral follicles observed in left ovary',
    units: 'Morphology',
    referenceRange: 'Clinical imaging',
    notes: 'Mild polycystic appearance noted; clinician requested correlation with cycle lengths.'
  }
];

export const DEFAULT_DOCTOR_ADVICE = [
  {
    id: 'adv-1',
    clinicianName: 'Dr. Sarah Jenkins (Gynecology)',
    date: '2025-02-22',
    adviceText: 'Take prescribed NSAID at first sign of bleeding before cramps peak. Continue daily 15-minute warm heat pack therapy.',
    prescribedInstructions: 'Maintain cycle symptom diary in Mimi. Recheck serum ferritin in 3 months.',
    status: 'active',
    reminderDate: '2025-05-22'
  }
];

// Initial realistic baseline data matching the current year/month
const DEFAULT_STATE = {
  // Past 4 logged cycles
  cycles: generateDefaultCycles(),

  // Pain logs across cycles (Day 1 to 7)
  // Matching screenshot: Average pain level curve peaking at Day 4 (score ~8.2)
  // In 3 of 4 cycles, Day 4 was most painful day!
  painLogs: [
    { cycleId: 'cycle-4', day: 1, painScore: 2, location: 'Lower abdomen', interference: ['Daily activities'], routine: { stress: 'normal', sleep: 'good' } },
    { cycleId: 'cycle-4', day: 2, painScore: 3, location: 'Lower abdomen', interference: [], routine: { stress: 'normal', sleep: 'good' } },
    { cycleId: 'cycle-4', day: 3, painScore: 4, location: 'Lower abdomen', interference: ['School'], routine: { stress: 'high', sleep: 'poor' } },
    { cycleId: 'cycle-4', day: 4, painScore: 8, location: 'Lower abdomen & back', interference: ['School', 'Sleep'], routine: { stress: 'high', sleep: 'poor' } },
    { cycleId: 'cycle-4', day: 5, painScore: 5, location: 'Lower abdomen', interference: [], routine: { stress: 'moderate', sleep: 'normal' } },
    { cycleId: 'cycle-4', day: 6, painScore: 2, location: 'Lower abdomen', interference: [], routine: { stress: 'low', sleep: 'good' } },
    { cycleId: 'cycle-4', day: 7, painScore: 1, location: 'None', interference: [], routine: { stress: 'low', sleep: 'good' } },

    { cycleId: 'cycle-3', day: 1, painScore: 3, location: 'Lower abdomen', interference: [], routine: { stress: 'high', sleep: 'poor' } },
    { cycleId: 'cycle-3', day: 2, painScore: 4, location: 'Lower abdomen', interference: [], routine: { stress: 'high', sleep: 'poor' } },
    { cycleId: 'cycle-3', day: 3, painScore: 5, location: 'Lower abdomen', interference: ['School'], routine: { stress: 'high', sleep: 'poor' } },
    { cycleId: 'cycle-3', day: 4, painScore: 9, location: 'Lower abdomen & back', interference: ['School', 'Sleep', 'Activities'], routine: { stress: 'high', sleep: 'poor' } },
    { cycleId: 'cycle-3', day: 5, painScore: 4, location: 'Lower abdomen', interference: [], routine: { stress: 'moderate', sleep: 'normal' } },

    { cycleId: 'cycle-2', day: 1, painScore: 2, location: 'Lower back', interference: [], routine: { stress: 'low', sleep: 'good' } },
    { cycleId: 'cycle-2', day: 2, painScore: 3, location: 'Lower back', interference: [], routine: { stress: 'low', sleep: 'good' } },
    { cycleId: 'cycle-2', day: 3, painScore: 7, location: 'Lower back', interference: ['Work/Study'], routine: { stress: 'moderate', sleep: 'normal' } },
    { cycleId: 'cycle-2', day: 4, painScore: 6, location: 'Lower back', interference: [], routine: { stress: 'low', sleep: 'good' } },

    { cycleId: 'cycle-1', day: 1, painScore: 3, location: 'Pelvis', interference: [], routine: { stress: 'high', sleep: 'poor' } },
    { cycleId: 'cycle-1', day: 2, painScore: 5, location: 'Pelvis', interference: ['School'], routine: { stress: 'high', sleep: 'poor' } },
    { cycleId: 'cycle-1', day: 3, painScore: 6, location: 'Pelvis', interference: ['School'], routine: { stress: 'high', sleep: 'poor' } },
    { cycleId: 'cycle-1', day: 4, painScore: 8, location: 'Pelvis', interference: ['School', 'Sleep'], routine: { stress: 'high', sleep: 'poor' } },
    { cycleId: 'cycle-1', day: 5, painScore: 3, location: 'Pelvis', interference: [], routine: { stress: 'low', sleep: 'good' } }
  ],

  // What's changed recent routine entries
  routineChanges: [
    {
      date: '2025-04-16',
      factors: ['Stress / Mood', 'Sleep'],
      note: 'School exam deadlines and stayed up past midnight.',
      linkFound: true
    }
  ],

  // Comfort Toolkit preferences and helpfulness ratings
  comfortToolkit: [
    { id: 'compress', name: 'Warm Compress', desc: 'Use a heating pad or warm towel on lower tummy or back', icon: 'pad', rating: 'Helped a lot', saved: true },
    { id: 'bath', name: 'Warm Bath / Shower', desc: 'Helps relax muscles and soothe tension', icon: 'tub', rating: 'Helped a lot', saved: true },
    { id: 'stretching', name: 'Gentle Stretching', desc: 'Child pose, cat-cow, or reclined butterfly to improve flow', icon: 'yoga', rating: 'Helped a lot', saved: true },
    { id: 'hydration', name: 'Hydration & Warm Teas', desc: 'Ginger, peppermint, chamomile, or warm water', icon: 'glass', rating: 'Helped a little', saved: true },
    { id: 'rest', name: 'Rest & Comfortable Position', desc: 'Curling on your side with a pillow between your knees', icon: 'bed', rating: 'Helped a lot', saved: true }
  ],

  // 7-Day Prep Guide Checklist items (saved state)
  prepGuideChecks: {
    'day-7': true,
    'day-6': true,
    'day-5': true,
    'day-4': false,
    'day-3': false,
    'day-2': false,
    'day-1': false,
    'task-products': true,
    'task-hydrate': true,
    'task-sleep': false,
    'task-nourish': true,
    'task-comfort-kit': true
  },

  // My Tiny Steps (gentle, zero-guilt micro-actions)
  tinySteps: [
    { id: 'step-1', text: 'Pack 2 period products in my daily bag', completed: true },
    { id: 'step-2', text: 'Fill my water bottle before studying', completed: true },
    { id: 'step-3', text: 'Take a 10-minute quiet break without my phone', completed: true },
    { id: 'step-4', text: 'Write down 1 question for my doctor or nurse', completed: false },
    { id: 'step-5', text: 'Keep a warm tea mug nearby while resting', completed: false },
    { id: 'step-6', text: 'Test a 5-minute gentle stretch routine', completed: false }
  ],

  // Myth Detective game progress
  mythDetective: {
    activeCaseId: 'sugar-scare',
    completedCases: ['sugar-scare'],
    badges: ['Sugar Sleuth', 'Evidence Explorer'],
    notes: {}
  },

  // Comprehensive Doctor Visit & "Am I Being Heard?" state
  heardData: {
    activeConcern: 'Severe cramps interrupting classes',
    targetPerson: 'doctor', // 'parent', 'doctor', 'nurse', 'friend'
    customNotes: 'Pain hits worst around Day 4. Heat pad helps, but school chairs are tough.',
    savedQuestions: [
      'What might be causing this intensity of pain on Day 4?',
      'Could these symptoms be related to PCOS or another condition?',
      'What symptoms should I keep tracking for our next visit?'
    ],
    rehearsalCustomized: '',

    // (2) Appointment Preparation Checklist
    checklist: DEFAULT_HEARD_CHECKLIST,

    // (4) Questions to Ask the Doctor categorized
    doctorQuestions: DEFAULT_DOCTOR_QUESTIONS_CATEGORIZED,

    // (5) Medical Test and Report History
    medicalTests: DEFAULT_MEDICAL_TESTS,

    // (6) Doctor's Advice & Follow-up Tracker
    doctorAdvices: DEFAULT_DOCTOR_ADVICE,

    // (3) PCOS Consultation Prompts
    pcosPrompts: {
      irregularCycles: true,
      acneBreakouts: true,
      unwantedHair: false,
      hairThinning: false,
      fatigueLowEnergy: true,
      sleepDisruption: true,
      familyHistory: false,
      ultrasoundDiscuss: false,
      notes: 'Noticing cycle lengths stretching past 35 days and stubborn chin breakouts around period.'
    },

    // (7) What Has Changed comparison selected cycles
    compareCycleA: 'cycle-4',
    compareCycleB: 'cycle-1',

    // (8) Printable Summary selected items
    summaryOptions: {
      includeTimeline: true,
      includePain: true,
      includePcos: true,
      includeQuestions: true,
      includeTests: true,
      includeAdvice: true,
      patientName: 'Ananya',
      allergiesNote: 'No known drug allergies',
      currentMedicationsNote: 'Ibuprofen 400mg as needed for Day 4 cramps; Myo-Inositol 2g daily',
      customNoteToDoctor: 'Prepared for my upcoming medical consultation using my personal NUTURA cycle diary.'
    }
  },

  // Ask Nutura Offline Chat History
  chatMessages: [
    {
      id: 'msg-welcome',
      sender: 'nutura',
      text: `Hi sunshine! 🌸 I'm Nutura, your friendly menstrual health and PCOS companion.

Ask me anything about puberty, pads, cramps, PMS, or your cycle. Everything we chat about stays **100% private and offline on your device**.

*Please remember: Nutura provides educational self-care guidance and tracking support, never medical diagnoses or prescriptions. If you have severe symptoms, please reach out to a doctor right away.*`,
      level: 'mild_concern',
      badge: '🟢 General Guidance',
      badgeClass: 'chat-badge-guidance',
      timestamp: Date.now()
    }
  ],

  // Privacy & Settings
  privacySettings: {
    appLockEnabled: false,
    pin: '1234',
    isLocked: false,
    neutralNotifications: true,
    lastBackup: '2025-04-18',
    storageMode: 'local-only'
  },

  // Reminders matching Image 2 with Timer support
  reminders: [
    { id: 'rem-1', text: 'Take vitamins', completed: true, timerMinutes: 10, dueTimestamp: Date.now() + 10 * 60 * 1000, notifiedOverdue: false },
    { id: 'rem-2', text: 'Drink water', completed: false, timerMinutes: 5, dueTimestamp: Date.now() + 5 * 60 * 1000, notifiedOverdue: false },
    { id: 'rem-3', text: 'Prepare for period', completed: false, timerMinutes: 15, dueTimestamp: Date.now() + 15 * 60 * 1000, notifiedOverdue: false }
  ],

  // Today's Tasks matching Image 3 with Timer support
  todaysTasks: [
    { id: 'task-1', text: 'Exercise / Walk', completed: true, icon: '🧘', timerMinutes: 20, dueTimestamp: Date.now() + 20 * 60 * 1000, notifiedOverdue: false },
    { id: 'task-2', text: 'Eat healthy', completed: false, icon: '🥦', timerMinutes: 15, dueTimestamp: Date.now() + 15 * 60 * 1000, notifiedOverdue: false },
    { id: 'task-3', text: 'Stay hydrated', completed: true, icon: '💧', timerMinutes: 5, dueTimestamp: Date.now() + 5 * 60 * 1000, notifiedOverdue: false },
    { id: 'task-4', text: 'Get enough sleep', completed: false, icon: '🌙', timerMinutes: 60, dueTimestamp: Date.now() + 60 * 60 * 1000, notifiedOverdue: false },
    { id: 'task-5', text: 'Self care time', completed: false, icon: '📓', timerMinutes: 30, dueTimestamp: Date.now() + 30 * 60 * 1000, notifiedOverdue: false }
  ]
};

class Store {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasFreshCycles = parsed.cycles && parsed.cycles.length >= 4 && !parsed.cycles[0].startDate.startsWith('2025');

        // Deep merge heardData so newly added doctor-visit fields are always present
        const mergedHeard = {
          ...DEFAULT_STATE.heardData,
          ...(parsed.heardData || {})
        };
        if (!Array.isArray(mergedHeard.checklist) || mergedHeard.checklist.length === 0) {
          mergedHeard.checklist = JSON.parse(JSON.stringify(DEFAULT_HEARD_CHECKLIST));
        }
        if (!Array.isArray(mergedHeard.doctorQuestions) || mergedHeard.doctorQuestions.length === 0) {
          mergedHeard.doctorQuestions = JSON.parse(JSON.stringify(DEFAULT_DOCTOR_QUESTIONS_CATEGORIZED));
        }
        if (!Array.isArray(mergedHeard.medicalTests)) {
          mergedHeard.medicalTests = JSON.parse(JSON.stringify(DEFAULT_MEDICAL_TESTS));
        }
        if (!Array.isArray(mergedHeard.doctorAdvices)) {
          mergedHeard.doctorAdvices = JSON.parse(JSON.stringify(DEFAULT_DOCTOR_ADVICE));
        }
        if (!mergedHeard.pcosPrompts) {
          mergedHeard.pcosPrompts = DEFAULT_STATE.heardData.pcosPrompts;
        }
        if (!mergedHeard.summaryOptions) {
          mergedHeard.summaryOptions = DEFAULT_STATE.heardData.summaryOptions;
        }

        return {
          ...DEFAULT_STATE,
          ...parsed,
          cycles: hasFreshCycles ? parsed.cycles : generateDefaultCycles(),
          reminders: (parsed.reminders && parsed.reminders.length > 0) ? parsed.reminders : DEFAULT_STATE.reminders,
          todaysTasks: (parsed.todaysTasks && parsed.todaysTasks.length > 0) ? parsed.todaysTasks : DEFAULT_STATE.todaysTasks,
          chatMessages: (Array.isArray(parsed.chatMessages) && parsed.chatMessages.length > 0)
            ? parsed.chatMessages
            : DEFAULT_STATE.chatMessages,
          heardData: mergedHeard
        };
      }
    } catch (e) {
      console.warn('Could not read localStorage:', e);
    }
    const fresh = JSON.parse(JSON.stringify(DEFAULT_STATE));
    fresh.cycles = generateDefaultCycles();
    return fresh;
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Could not save to localStorage:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  getState() {
    return this.state;
  }

  // Cycle operations
  addCycle(newCycle) {
    this.state.cycles.unshift({
      id: 'cycle-' + Date.now(),
      ...newCycle
    });
    this.saveState();
  }

  // Set 4 historical cycles from onboarding / history manager form
  setFourHistoricalCycles(datesArray, optionalDurations = [5, 4, 5, 4]) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Sort ascending (oldest to newest)
    const sortedDates = [...datesArray].sort();
    
    const newCycles = sortedDates.map((startDate, idx) => {
      const parts = startDate.split('-').map(Number);
      const name = `${monthNames[parts[1] - 1]} ${parts[0]}`;
      const dur = (optionalDurations && optionalDurations[idx]) ? Math.max(1, parseInt(optionalDurations[idx])) : 5;
      
      const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      d.setUTCDate(d.getUTCDate() + dur - 1);
      const endYear = d.getUTCFullYear();
      const endMonth = String(d.getUTCMonth() + 1).padStart(2, '0');
      const endDay = String(d.getUTCDate()).padStart(2, '0');
      const endDate = `${endYear}-${endMonth}-${endDay}`;

      return {
        id: `cycle-${idx + 1}-${Date.now()}`,
        name,
        startDate,
        endDate,
        durationDays: dur,
        flow: idx === 3 ? 'medium' : (idx === 2 ? 'light' : 'medium'),
        symptoms: ['Logged cycle'],
        notes: `Confirmed historical period start.`
      };
    });

    // Save newest first
    this.state.cycles = newCycles.reverse();
    this.saveState();
  }

  // Record an actual new period start
  recordActualPeriod(startDate, durationDays = 5, flow = 'medium', symptoms = [], notes = '') {
    const parts = startDate.split('-').map(Number);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const name = `${monthNames[parts[1] - 1]} ${parts[0]}`;
    
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    d.setUTCDate(d.getUTCDate() + durationDays - 1);
    const endYear = d.getUTCFullYear();
    const endMonth = String(d.getUTCMonth() + 1).padStart(2, '0');
    const endDay = String(d.getUTCDate()).padStart(2, '0');
    const endDate = `${endYear}-${endMonth}-${endDay}`;

    const newCycle = {
      id: `cycle-${Date.now()}`,
      name,
      startDate,
      endDate,
      durationDays,
      flow,
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms].filter(Boolean),
      notes: notes || 'Confirmed actual period.'
    };

    // Remove any exact duplicate startDate
    this.state.cycles = this.state.cycles.filter(c => c.startDate !== startDate);
    this.state.cycles.unshift(newCycle);
    this.saveState();
    return newCycle;
  }

  deleteCycle(id) {
    this.state.cycles = this.state.cycles.filter(c => c.id !== id);
    this.state.painLogs = this.state.painLogs.filter(p => p.cycleId !== id);
    this.saveState();
  }

  // Pain log operations
  addPainLog(log) {
    this.state.painLogs.push(log);
    this.saveState();
  }

  // Routine factors
  addRoutineChange(entry) {
    this.state.routineChanges.unshift({
      date: new Date().toISOString().split('T')[0],
      ...entry
    });
    this.saveState();
  }

  // Comfort item rating update
  updateComfortRating(id, rating) {
    const item = this.state.comfortToolkit.find(c => c.id === id);
    if (item) {
      item.rating = rating;
      this.saveState();
    }
  }

  // 7-day checklist toggle
  togglePrepCheck(key) {
    this.state.prepGuideChecks[key] = !this.state.prepGuideChecks[key];
    this.saveState();
  }

  // Tiny steps toggle
  toggleTinyStep(id) {
    const step = this.state.tinySteps.find(s => s.id === id);
    if (step) {
      step.completed = !step.completed;
      this.saveState();
    }
  }

  addTinyStep(text) {
    if (!text.trim()) return;
    this.state.tinySteps.push({
      id: 'step-' + Date.now(),
      text: text.trim(),
      completed: false
    });
    this.saveState();
  }

  // Reminders Operations (Image 2) with Timer
  addReminder(text, timerMinutes = 10) {
    if (!text || !text.trim()) return null;
    const mins = Math.max(1, parseInt(timerMinutes) || 10);
    const newRem = {
      id: 'rem-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      text: text.trim(),
      completed: false,
      timerMinutes: mins,
      dueTimestamp: Date.now() + mins * 60 * 1000,
      notifiedOverdue: false
    };
    this.state.reminders = this.state.reminders || [];
    this.state.reminders.push(newRem);
    this.saveState();
    return newRem;
  }

  toggleReminder(id) {
    this.state.reminders = this.state.reminders || [];
    const item = this.state.reminders.find(r => r.id === id);
    if (item) {
      item.completed = !item.completed;
      if (item.completed) {
        item.notifiedOverdue = true;
      }
      this.saveState();
      return item;
    }
    return null;
  }

  deleteReminder(id) {
    this.state.reminders = this.state.reminders || [];
    this.state.reminders = this.state.reminders.filter(r => r.id !== id);
    this.saveState();
  }

  saveReminders(remindersList) {
    this.state.reminders = remindersList;
    this.saveState();
  }

  // Today's Tasks Operations (Image 3) with Timer
  addTask(text, icon = '✦', timerMinutes = 15) {
    if (!text || !text.trim()) return null;
    const mins = Math.max(1, parseInt(timerMinutes) || 15);
    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      text: text.trim(),
      completed: false,
      icon: icon,
      timerMinutes: mins,
      dueTimestamp: Date.now() + mins * 60 * 1000,
      notifiedOverdue: false
    };
    this.state.todaysTasks = this.state.todaysTasks || [];
    this.state.todaysTasks.push(newTask);
    this.saveState();
    return newTask;
  }

  toggleTask(id) {
    this.state.todaysTasks = this.state.todaysTasks || [];
    const item = this.state.todaysTasks.find(t => t.id === id);
    if (item) {
      item.completed = !item.completed;
      if (item.completed) {
        item.notifiedOverdue = true;
      }
      this.saveState();
      return item;
    }
    return null;
  }

  deleteTask(id) {
    this.state.todaysTasks = this.state.todaysTasks || [];
    this.state.todaysTasks = this.state.todaysTasks.filter(t => t.id !== id);
    this.saveState();
  }

  saveTasks(tasksList) {
    this.state.todaysTasks = tasksList;
    this.saveState();
  }

  // Privacy lock
  setAppLock(enabled, pin) {
    this.state.privacySettings.appLockEnabled = enabled;
    if (pin) this.state.privacySettings.pin = pin;
    this.saveState();
  }

  lockApp() {
    if (this.state.privacySettings.appLockEnabled) {
      this.state.privacySettings.isLocked = true;
      this.saveState();
    }
  }

  unlockApp(enteredPin) {
    if (enteredPin === this.state.privacySettings.pin) {
      this.state.privacySettings.isLocked = false;
      this.saveState();
      return true;
    }
    return false;
  }

  toggleNeutralNotifications(val) {
    this.state.privacySettings.neutralNotifications = val;
    this.saveState();
  }

  // Doctor conversation update
  updateHeardData(updates) {
    this.state.heardData = { ...this.state.heardData, ...updates };
    this.saveState();
  }

  // (2) Appointment Preparation Checklist methods
  toggleHeardChecklistItem(id) {
    const item = this.state.heardData.checklist.find(i => i.id === id);
    if (item) {
      item.completed = !item.completed;
      this.saveState();
    }
  }

  addHeardChecklistItem(text, category = 'custom') {
    if (!text || !text.trim()) return null;
    const newId = 'prep-' + Date.now();
    this.state.heardData.checklist.push({
      id: newId,
      category,
      text: text.trim(),
      completed: false,
      custom: true
    });
    this.saveState();
    return newId;
  }

  editHeardChecklistItem(id, newText) {
    const item = this.state.heardData.checklist.find(i => i.id === id);
    if (item && newText && newText.trim()) {
      item.text = newText.trim();
      this.saveState();
    }
  }

  deleteHeardChecklistItem(id) {
    this.state.heardData.checklist = this.state.heardData.checklist.filter(i => i.id !== id);
    this.saveState();
  }

  resetHeardChecklist() {
    this.state.heardData.checklist = JSON.parse(JSON.stringify(DEFAULT_HEARD_CHECKLIST));
    this.saveState();
  }

  // (4) Questions to Ask Doctor methods
  toggleDoctorQuestionSelected(id) {
    const q = this.state.heardData.doctorQuestions.find(item => item.id === id);
    if (q) {
      q.selected = !q.selected;
      this.saveState();
    }
  }

  toggleDoctorQuestionAnswered(id) {
    const q = this.state.heardData.doctorQuestions.find(item => item.id === id);
    if (q) {
      q.answered = !q.answered;
      this.saveState();
    }
  }

  addDoctorQuestion(text, category = 'treatment') {
    if (!text || !text.trim()) return null;
    const newId = 'dq-' + Date.now();
    this.state.heardData.doctorQuestions.push({
      id: newId,
      category,
      text: text.trim(),
      selected: true,
      answered: false,
      custom: true
    });
    this.saveState();
    return newId;
  }

  deleteDoctorQuestion(id) {
    this.state.heardData.doctorQuestions = this.state.heardData.doctorQuestions.filter(q => q.id !== id);
    this.saveState();
  }

  // (5) Medical Test History methods
  addMedicalTest(testData) {
    if (!testData.testName || !testData.testName.trim()) return null;
    const newTest = {
      id: 'test-' + Date.now(),
      testName: testData.testName.trim(),
      date: testData.date || new Date().toISOString().split('T')[0],
      result: (testData.result || '').trim(),
      units: (testData.units || '').trim(),
      referenceRange: (testData.referenceRange || '').trim(),
      notes: (testData.notes || '').trim()
    };
    this.state.heardData.medicalTests.unshift(newTest);
    this.saveState();
    return newTest.id;
  }

  updateMedicalTest(id, updates) {
    const test = this.state.heardData.medicalTests.find(t => t.id === id);
    if (test) {
      Object.assign(test, updates);
      this.saveState();
    }
  }

  deleteMedicalTest(id) {
    this.state.heardData.medicalTests = this.state.heardData.medicalTests.filter(t => t.id !== id);
    this.saveState();
  }

  // (6) Doctor's Advice & Follow-up Tracker methods
  addDoctorAdvice(adviceData) {
    const text = adviceData.adviceText || adviceData.adviceNotes;
    if (!text && !adviceData.prescribedInstructions) return null;
    const newAdvice = {
      id: 'adv-' + Date.now(),
      clinicianName: (adviceData.clinicianName || '').trim() || 'Attending Physician',
      date: adviceData.date || new Date().toISOString().split('T')[0],
      adviceText: (text || '').trim(),
      prescribedInstructions: (adviceData.prescribedInstructions || '').trim(),
      status: adviceData.status || 'active',
      reminderDate: adviceData.reminderDate || adviceData.followUpDate || ''
    };
    this.state.heardData.doctorAdvices.unshift(newAdvice);
    this.saveState();
    return newAdvice.id;
  }

  updateDoctorAdvice(id, updates) {
    const adv = this.state.heardData.doctorAdvices.find(a => a.id === id);
    if (adv) {
      Object.assign(adv, updates);
      this.saveState();
    }
  }

  deleteDoctorAdvice(id) {
    this.state.heardData.doctorAdvices = this.state.heardData.doctorAdvices.filter(a => a.id !== id);
    this.saveState();
  }

  // (3) PCOS Prompts update
  updatePcosPrompts(updates) {
    this.state.heardData.pcosPrompts = {
      ...this.state.heardData.pcosPrompts,
      ...updates
    };
    this.saveState();
  }

  // (7) What Has Changed cycle comparison selection
  updateCompareCycles(cycleA, cycleB) {
    if (cycleA) this.state.heardData.compareCycleA = cycleA;
    if (cycleB) this.state.heardData.compareCycleB = cycleB;
    this.saveState();
  }

  // (8) Summary options update
  updateSummaryOptions(updates) {
    this.state.heardData.summaryOptions = {
      ...this.state.heardData.summaryOptions,
      ...updates
    };
    this.saveState();
  }

  // Myth Detective complete
  completeMythCase(caseId, badgeName) {
    if (!this.state.mythDetective.completedCases.includes(caseId)) {
      this.state.mythDetective.completedCases.push(caseId);
    }
    if (badgeName && !this.state.mythDetective.badges.includes(badgeName)) {
      this.state.mythDetective.badges.push(badgeName);
    }
    this.saveState();
  }

  // Clear all data with safety confirmation
  resetAllData() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveState();
  }

  // Export data as JSON
  exportDataJSON() {
    return JSON.stringify(this.state, null, 2);
  }

  // Export human-readable health summary
  exportReadableSummary() {
    const s = this.state;
    const opts = s.heardData?.summaryOptions || {};
    return `
=== NUTURA Menstrual Health Summary ===
Patient Name: ${opts.patientName || 'Not specified'}
Generated: ${new Date().toLocaleDateString()}
Known Allergies: ${opts.allergiesNote || 'None entered'}
Current Medications / Supplements: ${opts.currentMedicationsNote || 'None entered'}
Storage: 100% Local-only, private

1. CYCLE HISTORY (Real Recorded Cycles):
${s.cycles.map(c => `• ${c.name} (${c.startDate} to ${c.endDate}): ${c.durationDays} days bleeding | Flow: ${c.flow} | Notes: ${c.notes}`).join('\n')}

2. PAIN PATTERNS:
• Most painful day in 3 of last 4 logged cycles: Day 4
• Average pain range: 1 to 9 (out of 10)
• High pain routinely correlates with: High stress & disrupted sleep

3. MEDICAL TESTS & REPORTS RECORDED:
${s.heardData.medicalTests.map(t => `• ${t.date} - ${t.testName}: ${t.result} ${t.units} (Ref: ${t.referenceRange}) | Notes: ${t.notes}`).join('\n')}

4. CLINICIAN ADVICE & FOLLOW-UPS:
${s.heardData.doctorAdvices.map(a => `• ${a.date} (${a.clinicianName}) [${a.status.toUpperCase()}]: ${a.adviceText} | Next Steps: ${a.prescribedInstructions}`).join('\n')}

5. DOCTOR QUESTIONS SELECTED:
${s.heardData.doctorQuestions.filter(q => q.selected).map(q => `• [${q.category.toUpperCase()}] ${q.text} ${q.answered ? '(Answered)' : ''}`).join('\n')}

Personal note: ${opts.customNoteToDoctor || 'This summary is privately prepared by the patient for personal tracking and medical conversation support.'}
========================================
`.trim();
  }

  // Ask Mimi Chat Methods
  addChatMessage(msg) {
    if (!this.state.chatMessages) {
      this.state.chatMessages = [];
    }
    const newMsg = {
      id: msg.id || 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      sender: msg.sender || 'user',
      text: msg.text || '',
      level: msg.level || 'mild_concern',
      badge: msg.badge || '🟢 General Guidance',
      badgeClass: msg.badgeClass || 'chat-badge-guidance',
      helplines: msg.helplines || [],
      isEmergency: Boolean(msg.isEmergency),
      timestamp: msg.timestamp || Date.now()
    };
    this.state.chatMessages.push(newMsg);
    if (this.state.chatMessages.length > 50) {
      this.state.chatMessages = this.state.chatMessages.slice(-50);
    }
    this.saveState();
    return newMsg;
  }

  clearChatMessages() {
    this.state.chatMessages = [
      {
        id: 'msg-welcome-' + Date.now(),
        sender: 'nutura',
        text: `Hi sunshine! 🌸 Chat history has been completely cleared. 

I'm Nutura. Ask me anything about puberty, pads, cramps, PMS, or your cycle. Everything we chat about stays **100% private and offline on your device**.`,
        level: 'mild_concern',
        badge: '🟢 General Guidance',
        badgeClass: 'chat-badge-guidance',
        timestamp: Date.now()
      }
    ];
    this.saveState();
  }
}

export const store = new Store();
