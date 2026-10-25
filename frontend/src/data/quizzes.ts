export interface MythFactQuestion {
  id: string;
  statement: string;
  isFact: boolean;
  correctAnswerText: string;
  explanation: string;
  whyMisconceptionExists: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizTopic {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate';
  questions: QuizQuestion[];
}

export const MYTH_OR_FACT_QUESTIONS: MythFactQuestion[] = [
  {
    id: 'mf-1',
    statement: 'You should never wash your hair or take a warm bath while you have your period.',
    isFact: false,
    correctAnswerText: 'MYTH!',
    explanation: 'Taking a warm bath or shower is actually one of the most soothing, hygienic things you can do during your period! Warm water relaxes cramped tummy muscles and keeps your skin clean and fresh.',
    whyMisconceptionExists: 'In older times before modern indoor heating and plumbing, people worried that cold drafts after a wet wash might cause chills.'
  },
  {
    id: 'mf-2',
    statement: 'Every girl has a period cycle that lasts exactly 28 days.',
    isFact: false,
    correctAnswerText: 'MYTH!',
    explanation: 'Teenage menstrual cycles naturally vary between 21 and 45 days. Everyone’s body has its own unique timetable, and cycles often fluctuate from month to month.',
    whyMisconceptionExists: '28 days is a medical textbook average for adult women, but it was never meant to be a strict rule for everyone.'
  },
  {
    id: 'mf-3',
    statement: 'You lose several cups of blood during a typical period.',
    isFact: false,
    correctAnswerText: 'MYTH!',
    explanation: 'The average total amount of menstrual fluid lost over an entire period is only about 2 to 4 tablespoons (30 to 60 ml). It looks like more because it mixes with natural cervical fluids.',
    whyMisconceptionExists: 'Because fluid spreads across the surface of a pad or in toilet water, our eyes naturally overestimate how much is there.'
  },
  {
    id: 'mf-4',
    statement: 'Exercise and light physical activity can help relieve period cramps.',
    isFact: true,
    correctAnswerText: 'FACT!',
    explanation: 'Gentle exercise like walking, swimming, dancing, or stretching releases endorphins — your body’s natural feel-good painkillers that help ease muscle tension.',
    whyMisconceptionExists: 'Some traditional myths suggested resting completely in bed, but light movement is scientifically proven to help.'
  },
  {
    id: 'mf-5',
    statement: 'Normal vaginal discharge is your body’s natural way of cleaning itself.',
    isFact: true,
    correctAnswerText: 'FACT!',
    explanation: 'Discharge is produced by glands in the cervix and vagina to wash away dead cells and maintain healthy bacteria. It is a sign of a healthy, thriving body.',
    whyMisconceptionExists: 'Because it shows up in underwear, some girls mistakenly worry it is an infection or dirtiness, when it is actually pure protection.'
  },
  {
    id: 'mf-6',
    statement: 'Menstrual pads must never be flushed down the toilet.',
    isFact: true,
    correctAnswerText: 'FACT!',
    explanation: 'Pads and pantyliners are designed to absorb water and expand. Flushing them causes serious blockages in household and city plumbing. Always wrap them and dispose of them in a trash bin.',
    whyMisconceptionExists: 'Some people assume anything paper-like dissolves like toilet paper, but pads contain absorbent polymer fibers that do not dissolve.'
  }
];

export const QUICK_QUIZZES: QuizTopic[] = [
  {
    id: 'quiz-basics',
    title: 'Period Basics 101',
    description: 'Test your understanding of what periods are and how our bodies grow.',
    difficulty: 'Beginner',
    questions: [
      {
        id: 'qb-1',
        question: 'What is the organ where a menstrual period originates?',
        options: ['The Stomach', 'The Uterus', 'The Kidneys', 'The Bladder'],
        correctIndex: 1,
        explanation: 'The uterus (womb) is the muscular organ that prepares a soft lining each month and gently sheds it during menstruation.'
      },
      {
        id: 'qb-2',
        question: 'How long does a typical period usually last?',
        options: ['1 day only', '3 to 7 days', '20 to 25 days', 'A whole month'],
        correctIndex: 1,
        explanation: 'For most people, period bleeding lasts between 3 to 7 days, with the first couple of days usually being the heaviest.'
      },
      {
        id: 'qb-3',
        question: 'How often should you generally change a sanitary pad during the day?',
        options: ['Once every 24 hours', 'Every 4 to 6 hours', 'Only when completely soaked', 'Once a week'],
        correctIndex: 1,
        explanation: 'Changing your pad every 4 to 6 hours prevents bacterial growth, keeps your skin dry, and prevents odors and irritation.'
      },
      {
        id: 'qb-4',
        question: 'What is ovulation?',
        options: [
          'When blood leaves your body',
          'When an ovary releases a tiny egg cell',
          'When your stomach feels full',
          'When your hair grows faster'
        ],
        correctIndex: 1,
        explanation: 'Ovulation is the moment in your cycle when an ovary releases a mature egg cell.'
      }
    ]
  },
  {
    id: 'quiz-cycle-health',
    title: 'Cycle Health & Care',
    description: 'Learn how to read cycle signs, care for cramps, and stay prepared.',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'qc-1',
        question: 'Which of these is a great natural at-home way to ease menstrual cramps?',
        options: [
          'Drinking ice-cold soda',
          'Putting a warm heating pad on your lower belly',
          'Running a 10-mile sprint',
          'Skipping meals all day'
        ],
        correctIndex: 1,
        explanation: 'Warmth relaxes tightened uterine muscles and increases blood flow to soothe aching cramps.'
      },
      {
        id: 'qc-2',
        question: 'Why are teenage menstrual cycles often irregular at first?',
        options: [
          'Because hormones are still developing and balancing',
          'Because something is wrong',
          'Because cycles are always random for life',
          'Because of eating vegetables'
        ],
        correctIndex: 0,
        explanation: 'It takes 2 to 3 years for puberty hormones to mature and stabilize into a more regular pattern. Irregularity is completely normal in teens!'
      },
      {
        id: 'qc-3',
        question: 'How do you properly dispose of a used sanitary pad?',
        options: [
          'Flush it down the toilet',
          'Leave it on the bathroom floor',
          'Wrap it in toilet paper or its wrapper and put it in the waste bin',
          'Wash it in the sink'
        ],
        correctIndex: 2,
        explanation: 'Disposables must always be wrapped and placed in the garbage bin to keep bathrooms clean and protect plumbing.'
      },
      {
        id: 'qc-4',
        question: 'What is Toxic Shock Syndrome (TSS)?',
        options: [
          'A common skin rash from laundry soap',
          'A rare bacterial condition prevented by changing internal products regularly',
          'A type of stomach bug from bad food',
          'A mood change during tests'
        ],
        correctIndex: 1,
        explanation: 'TSS is rare and prevented by washing hands and changing tampons every 4 to 8 hours.'
      }
    ]
  }
];
