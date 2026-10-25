/**
 * MOONLIT Myth Detective — Interactive Health Literacy Game Data
 * Fictional social media claims, clues, branching paths, evidence sorting lab,
 * verdicts, Mimi's reveal, and Knowledge Garden badges.
 */

export const MYTH_CASES = [
  {
    id: 'sugar-scare',
    title: 'The Sugar Scare',
    tag: 'PCOS • Nutrition',
    claim: '“If you have PCOS, you must avoid all sugar, fruits, and carbohydrates.”',
    socialPost: {
      author: '@wellness_guru_guru',
      handle: 'PureHormoneHacks',
      likes: '48.2k',
      caption: 'CUT ALL CARBS AND FRUITS NOW!! Sugar is toxic fuel for PCOS cysts!! If you eat a banana you will ruin your hormones!! Buy my 0-carb detox plan in bio 👇🚫🍎'
    },
    clues: [
      {
        id: 'clue-1',
        title: 'Whole Fruit vs Refined Syrups',
        text: 'Whole fruits contain water, essential vitamins, polyphenols, and dietary fiber. Fiber slows digestion and prevents sharp blood glucose spikes.',
        source: 'Endocrine Society / Harvard Nutrition Source'
      },
      {
        id: 'clue-2',
        title: 'Carbohydrates & Stress Hormones',
        text: 'Severe carbohydrate restriction triggers the release of cortisol (the stress hormone) and can disrupt thyroid conversion, actually worsening fatigue and menstrual regularity.',
        source: 'Journal of Clinical Endocrinology & Metabolism'
      },
      {
        id: 'clue-3',
        title: 'Diet Culture Red Flags',
        text: 'Posts using fear words like "toxic", "ruined", and "never eat" are designed to create panic and sell unregulated meal plans, not provide evidence-based care.',
        source: 'Media Health Literacy & Medical Review'
      }
    ],
    branches: [
      { id: 'b1', label: 'Investigate what medical guidelines say about fruit & fiber' },
      { id: 'b2', label: 'Examine how extreme restriction impacts cortisol and mood' },
      { id: 'b3', label: 'Analyze who profits from extreme restriction advice' }
    ],
    evidenceCards: [
      { id: 'e1', text: 'Whole fruits provide dietary fiber that blunts insulin spikes', category: 'challenges' },
      { id: 'e2', text: 'Severe carb cutting elevates cortisol and worsens fatigue', category: 'challenges' },
      { id: 'e3', text: 'High amounts of concentrated refined syrups can spike glucose', category: 'supports_context' },
      { id: 'e4', text: 'No major clinical body recommends eliminating fruit for PCOS', category: 'challenges' }
    ],
    verdictOptions: [
      { id: 'v1', text: 'True — you must eliminate all carbs and fruit to fix PCOS.', correct: false },
      { id: 'v2', text: 'Misleading & Unsupported — Carbohydrate quality and balance matter; whole fruits and complex carbs are nourishing.', correct: true },
      { id: 'v3', text: 'Only artificial chemical sweeteners are safe for your body.', correct: false }
    ],
    mimiReveal: {
      badge: 'Sugar Sleuth',
      summary: 'You uncovered the truth! Whole fruits and nourishing complex carbohydrates do NOT need to be feared or eliminated in PCOS.',
      details: 'PCOS involves complex metabolic and hormonal factors, often including insulin resistance. However, eliminating entire food groups creates emotional stress, nutritional deficiencies, and can trigger binge-restrict cycles. Pairing carbohydrates with protein, healthy fats, or fiber is far more effective, enjoyable, and sustainable than fear-based elimination diets.',
      sources: 'International Evidence-Based PCOS Guidelines (Monash University / ASRM / ESHRE)'
    }
  },
  {
    id: 'calendar-trap',
    title: 'The Period Calendar Trap',
    tag: 'Menstrual Cycle • Anatomy',
    claim: '“Every period must arrive exactly 28 days after the previous one.”',
    socialPost: {
      author: '@cycle_perfection',
      handle: 'ClockworkBody',
      likes: '34.1k',
      caption: 'If your period arrives on day 26 or day 33, something is deeply wrong with your body. A healthy female body is a 28-day machine! ⏰🚨'
    },
    clues: [
      {
        id: 'clue-1',
        title: 'The 28-Day Myth',
        text: 'Only about 13% of women have an exact 28-day cycle. The 28-day number is merely a textbook mathematical average, not a biological rule.',
        source: 'The Lancet Digital Health (Cycle Tracking Studies)'
      },
      {
        id: 'clue-2',
        title: 'Normal Clinical Ranges',
        text: 'According to ACOG and FIGO, normal cycle lengths for adults range from 24 to 38 days, and for adolescents/young adults can normally range from 21 to 45 days.',
        source: 'American College of Obstetricians and Gynecologists (ACOG)'
      },
      {
        id: 'clue-3',
        title: 'Natural Fluctuations',
        text: 'Illness, stress, travel, sleep changes, and exam weeks can naturally shift ovulation by a few days without signaling disease.',
        source: 'Cleveland Clinic Adolescent Health'
      }
    ],
    branches: [
      { id: 'b1', label: 'Explore biological variation in cycle length across populations' },
      { id: 'b2', label: 'Check adolescent vs adult cycle variability' }
    ],
    evidenceCards: [
      { id: 'e1', text: 'Only ~13% of menstruating people experience exact 28-day cycles', category: 'challenges' },
      { id: 'e2', text: 'Clinical standards define normal cycles as 24 to 38 days (or up to 45 in teens)', category: 'challenges' },
      { id: 'e3', text: 'Cycles consistently outside 21–45 days warrant a doctor checkup', category: 'supports_context' }
    ],
    verdictOptions: [
      { id: 'v1', text: 'True — anything other than 28 days requires urgent hormone pills.', correct: false },
      { id: 'v2', text: 'Misleading — 28 days is an arbitrary average; healthy cycles normally range from 24 to 38+ days.', correct: true }
    ],
    mimiReveal: {
      badge: 'Rhythm Realist',
      summary: 'Your body is not a robotic clock—it is a living, responsive rhythm!',
      details: 'Cycle variations between 24 and 38 days are completely normal for most adults, and even wider for teens. Slight variations month-to-month are healthy responses to your environment.',
      sources: 'ACOG Committee Opinion No. 651 & FIGO Menstrual Disorders Committee'
    }
  },
  {
    id: 'acne-assumption',
    title: 'The Acne Assumption',
    tag: 'Skin • PCOS Diagnosis',
    claim: '“Acne alone proves that you have PCOS.”',
    socialPost: {
      author: '@skin_hormone_hacks',
      handle: 'ClearSkinSecrets',
      likes: '51.9k',
      caption: 'Jawline breakouts = Guaranteed PCOS! Doctors won’t tell you this, but if you have pimples, your ovaries are cyst-covered! 😱'
    },
    clues: [
      {
        id: 'clue-1',
        title: 'Rotterdam Diagnostic Criteria',
        text: 'PCOS requires at least TWO of three specific criteria: irregular/absent ovulation, clinical or biochemical androgen excess, and polycystic ovaries on ultrasound.',
        source: 'International Rotterdam PCOS Consensus'
      },
      {
        id: 'clue-2',
        title: 'Acne Prevalence in Teens & 20s',
        text: 'Acne affects up to 85% of adolescents and young adults due to normal sebum production, genetics, cosmetics, and skin bacteria—most do NOT have PCOS.',
        source: 'American Academy of Dermatology'
      }
    ],
    branches: [
      { id: 'b1', label: 'Inspect the 3 official Rotterdam diagnostic pillars' },
      { id: 'b2', label: 'Check common causes of acne in young adults' }
    ],
    evidenceCards: [
      { id: 'e1', text: 'Acne is extremely common in young adults without any endocrine disorder', category: 'challenges' },
      { id: 'e2', text: 'PCOS diagnosis strictly requires at least 2 out of 3 Rotterdam criteria', category: 'challenges' },
      { id: 'e3', text: 'Hormonal acne can sometimes be one symptom among several in PCOS', category: 'supports_context' }
    ],
    verdictOptions: [
      { id: 'v1', text: 'True — any facial acne guarantees PCOS.', correct: false },
      { id: 'v2', text: 'False — Acne alone cannot diagnose PCOS; thorough medical evaluation is required.', correct: true }
    ],
    mimiReveal: {
      badge: 'Clinical Clarity',
      summary: 'A breakout is not a PCOS diagnosis!',
      details: 'While hormonal changes can influence skin, diagnosing PCOS requires proper clinical evaluation by a medical doctor, including menstrual history and specific hormone panels.',
      sources: 'Rotterdam Consensus Criteria & American Academy of Dermatology'
    }
  },
  {
    id: 'workout-rule',
    title: 'The One-Size-Fits-All Workout Rule',
    tag: 'Movement • Period Pain',
    claim: '“Everyone with period pain must follow the same workout.”',
    socialPost: {
      author: '@hardcore_fit_life',
      handle: 'NoExcusesFitness',
      likes: '29.4k',
      caption: 'No excuses on your period! High intensity sprints and heavy deadlifts are the ONLY way to sweat out cramps! Rest is for the weak! 🏋️‍♀️🔥'
    },
    clues: [
      {
        id: 'clue-1',
        title: 'Cortisol & Inflammation',
        text: 'When your body is experiencing dysmenorrhea (painful cramps), demanding high-intensity exercise can spike systemic cortisol and inflammatory prostaglandins, intensifying discomfort.',
        source: 'Sports Medicine Review / British Journal of Sports Medicine'
      },
      {
        id: 'clue-2',
        title: 'Individualized Movement Benefits',
        text: 'Gentle movement such as walking, cat-cow yoga, or pelvic tilting promotes pelvic blood flow and endorphin release without overwhelming the nervous system.',
        source: 'Cochrane Systematic Review on Exercise for Dysmenorrhea'
      }
    ],
    branches: [
      { id: 'b1', label: 'Review the Cochrane systematic evidence on gentle vs intense exercise' },
      { id: 'b2', label: 'Examine pelvic blood flow and restorative positions' }
    ],
    evidenceCards: [
      { id: 'e1', text: 'Forced intense HIIT during severe cramps can increase pain and nausea', category: 'challenges' },
      { id: 'e2', text: 'Gentle stretching and walking release soothing endorphins', category: 'supports_context' },
      { id: 'e3', text: 'Resting when your body asks for it is a healthy, valid choice', category: 'challenges' }
    ],
    verdictOptions: [
      { id: 'v1', text: 'True — painful periods always require heavy weightlifting.', correct: false },
      { id: 'v2', text: 'False — Movement should be gentle and individualized; listening to your body beats forced routines.', correct: true }
    ],
    mimiReveal: {
      badge: 'Gentle Mover',
      summary: 'Honor what your body needs today!',
      details: 'Movement can be wonderful for easing cramps when you feel up to it, but gentle stretching, light walks, or quiet rest are just as valid and restorative.',
      sources: 'Cochrane Review on Exercise for Primary Dysmenorrhea'
    }
  },
  {
    id: 'miracle-cure',
    title: 'The Miracle Cure Post',
    tag: 'Remedies • Medical Safety',
    claim: '“One homemade remedy can cure PCOS or severe period pain.”',
    socialPost: {
      author: '@miracle_herbal_potions',
      handle: 'NaturalCuresFast',
      likes: '62.7k',
      caption: 'Doctors don’t want you to know!! This secret boiled seed juice CURES PCOS permanently in 7 days! Throw away your prescriptions! 🍵✨'
    },
    clues: [
      {
        id: 'clue-1',
        title: 'PCOS is a Complex Chronic Condition',
        text: 'PCOS involves genetic, metabolic, and neuroendocrine factors. There is no single food, herb, or pill on Earth that "cures" it in 7 days.',
        source: 'World Health Organization (WHO) PCOS Factsheet'
      },
      {
        id: 'clue-2',
        title: 'Comfort vs Cure',
        text: 'Evidence-informed comfort measures like warm compresses and soothing teas can provide comforting relief, but claiming they "cure" disease is false and dangerous.',
        source: 'National Institutes of Health (NIH) Complementary Health'
      }
    ],
    branches: [
      { id: 'b1', label: 'Check the difference between comfort relief and medical cure' },
      { id: 'b2', label: 'Investigate risks of unregulated herbal claims' }
    ],
    evidenceCards: [
      { id: 'e1', text: 'No peer-reviewed study demonstrates a 7-day cure for PCOS', category: 'challenges' },
      { id: 'e2', text: 'Warm tea and heat pads are comforting supportive tools, not cures', category: 'supports_context' },
      { id: 'e3', text: 'Severe, worsening pain deserves qualified medical evaluation', category: 'challenges' }
    ],
    verdictOptions: [
      { id: 'v1', text: 'True — homemade seed juice cures all gynecological conditions.', correct: false },
      { id: 'v2', text: 'Unsupported & Potentially Unsafe — No single food or drink cures PCOS; beware of miracle claims.', correct: true }
    ],
    mimiReveal: {
      badge: 'Truth Seeker',
      summary: 'Beware of miracle cures! Real wellness is rooted in care and evidence.',
      details: 'Comfort toolkits (like warm baths, heating pads, and balanced meals) are wonderful for daily symptom ease, but anyone claiming an overnight cure is misleading you.',
      sources: 'WHO & National Center for Complementary and Integrative Health'
    }
  }
];
