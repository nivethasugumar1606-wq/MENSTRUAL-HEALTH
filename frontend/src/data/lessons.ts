export interface Lesson {
  id: string;
  category: 'basics' | 'body' | 'guide';
  title: string;
  subtitle: string;
  readTime: string;
  points: number;
  iconName: string;
  summary: string;
  sections: {
    heading: string;
    body: string;
    tip?: string;
    medicalTerms?: string[];
  }[];
}

export const LESSONS_DATA: Lesson[] = [
  {
    id: 'period-basics-what-is-it',
    category: 'basics',
    title: 'What is Menstruation?',
    subtitle: 'Understanding the miraculous monthly reset of your body',
    readTime: '3 min read',
    points: 15,
    iconName: 'Droplet',
    summary: 'A friendly guide to what a period really is, why it happens, and why it is a healthy sign of growing up.',
    sections: [
      {
        heading: 'A Normal, Healthy Step in Growing Up',
        body: 'Having your period (also called Menstruation) is a completely natural and healthy part of growing into young womanhood. Every month, your body prepares a cozy, soft lining rich in blood vessels inside your Uterus.',
        medicalTerms: ['Menstruation', 'Uterus']
      },
      {
        heading: 'Why Does Period Blood Leave Your Body?',
        body: 'About once a month, an ovary releases a tiny egg cell in a process called Ovulation. When that egg is not fertilized, your body gently sheds that soft cushion lining. The lining flows through the Cervix and exits through the Vagina.',
        tip: 'Did you know? An entire period usually amounts to only 2 to 4 tablespoons of fluid in total! It often looks like more than it actually is.',
        medicalTerms: ['Ovulation', 'Cervix', 'Vagina']
      },
      {
        heading: 'How Long Does It Last?',
        body: 'For most people, bleeding lasts between 3 to 7 days. Day 1 and Day 2 are often the heaviest, while the last few days are lighter with brownish spotting. Both bright red and dark brown blood are completely normal!'
      }
    ]
  },
  {
    id: 'period-basics-cycle-lengths',
    category: 'basics',
    title: 'Why Cycle Lengths Vary',
    subtitle: 'Every girl’s cycle has its own unique rhythm',
    readTime: '4 min read',
    points: 15,
    iconName: 'Clock',
    summary: 'Learn why teenage cycles are rarely exactly 28 days and why variation is healthy and normal.',
    sections: [
      {
        heading: 'Forget the 28-Day Myth!',
        body: 'You might hear people talk about a "standard 28-day cycle." But in reality, especially during your teenage years, a healthy Menstrual cycle can be anywhere between 21 to 45 days long!',
        medicalTerms: ['Menstrual cycle']
      },
      {
        heading: 'Hormones Are Still Learning the Dance',
        body: 'During puberty, your brain and ovaries are constantly communicating through chemical messengers called Hormones. It takes about 2 to 3 years after your very first period for your cycle to settle into a predictable routine.',
        tip: 'If your period arrives a week early or a week late, don’t panic! Mild stress, exams, traveling, or catching a cold can easily shift your timing.',
        medicalTerms: ['Hormones', 'Puberty']
      },
      {
        heading: 'When to Speak with a Doctor or Trusted Adult',
        body: 'It is a good idea to talk with a doctor, nurse, or parent if your period lasts longer than 8 consecutive days, if you soak through two pads every hour, or if you ever go more than 90 days without a cycle after they had started.'
      }
    ]
  },
  {
    id: 'period-basics-first-period-kit',
    category: 'basics',
    title: 'Your First Period Survival Kit',
    subtitle: 'What to pack and what to do if your period starts at school',
    readTime: '3 min read',
    points: 15,
    iconName: 'Package',
    summary: 'Practical, confidence-boosting advice on staying prepared anywhere, anytime.',
    sections: [
      {
        heading: 'What to Keep in Your School Bag',
        body: 'Having a small, discrete zippered pouch in your backpack gives you peaceful confidence. You can pack 2 or 3 sanitary pads, a spare pair of comfy underwear, a tiny pack of wet wipes, and a small zip-lock bag.'
      },
      {
        heading: 'If It Starts When You Are in Class',
        body: 'Take a deep breath! Millions of girls have experienced their first period at school. Quietly ask your teacher to visit the restroom. If you don’t have a pad on you, school nurses, friends, and female teachers are always glad to give you one.',
        tip: 'If you accidentally spot your underwear or trousers, tie a hoodie or cardigan around your waist. It looks stylish and gives you complete privacy!'
      },
      {
        heading: 'Tell a Trusted Adult',
        body: 'When you get home, tell your mom, dad, guardian, or older sister. They will celebrate this milestone with you, help you choose your favorite pads, and answer any questions you have.'
      }
    ]
  },
  {
    id: 'period-basics-hygiene',
    category: 'basics',
    title: 'Daily Menstrual Hygiene',
    subtitle: 'Staying fresh, clean, and confident during your period',
    readTime: '3 min read',
    points: 15,
    iconName: 'Sparkles',
    summary: 'Simple steps to keep your body clean, prevent odors, and care for your delicate skin.',
    sections: [
      {
        heading: 'Changing Products Regularly',
        body: 'Change your disposable pad or cloth pad every 4 to 6 hours, even on lighter days. This keeps bacteria from multiplying and protects you against irritation and chafing.'
      },
      {
        heading: 'How to Wash Your Intimate Area',
        body: 'Wash the external area (the vulva) with plain warm water. Never use scented soaps, shower gels, or internal douching inside the vagina. Your Vagina is a self-cleaning marvel!',
        tip: 'Always wipe from front to back after using the toilet to avoid bringing bacteria from the bowel toward the vaginal opening.',
        medicalTerms: ['Vagina']
      },
      {
        heading: 'Disposing of Used Products Safely',
        body: 'Never flush menstrual pads or tampons down the toilet — they can clog home and city plumbing! Wrap the used product in toilet paper or its wrapper and toss it in the waste bin.'
      }
    ]
  },
  {
    id: 'body-changes-puberty',
    category: 'body',
    title: 'Body Changes & Puberty',
    subtitle: 'What is happening to my shape, height, and skin?',
    readTime: '4 min read',
    points: 15,
    iconName: 'Smile',
    summary: 'A comforting explanation of growth spurts, skin changes, body hair, and emotions.',
    sections: [
      {
        heading: 'The Natural Puberty Journey',
        body: 'Puberty is the amazing bridge between being a child and an adult. It usually begins between ages 9 and 14. Your body will grow taller, your hips and chest will gently round out, and soft hair will start growing under your arms and around your pubic area.',
        medicalTerms: ['Puberty']
      },
      {
        heading: 'Skin and Sweat Changes',
        body: 'Your oil and sweat glands become more active during puberty. You may notice tiny breakouts or a different personal scent. Daily showers with mild soap and gentle face cleanser will keep your skin glowing.'
      },
      {
        heading: 'Emotional Ups and Downs',
        body: 'Have you felt super energetic one day and tearful or irritable the next? Changing Hormones act like little waves in your emotions. Be gentle with yourself — taking deep breaths, sleeping well, and talking with friends helps wonderfully.',
        medicalTerms: ['Hormones']
      }
    ]
  },
  {
    id: 'body-changes-discharge',
    category: 'body',
    title: 'All About Vaginal Discharge',
    subtitle: 'Why white or clear spots in your underwear are healthy',
    readTime: '3 min read',
    points: 15,
    iconName: 'Shield',
    summary: 'Learn why discharge is your body’s natural cleaning system and how to read its signs.',
    sections: [
      {
        heading: 'Your Body’s Built-in Cleaning System',
        body: 'Vaginal discharge is a completely normal, healthy fluid produced by glands inside the cervix and vagina. It carries away old cells and maintains a healthy acidic environment.',
        medicalTerms: ['Vaginal discharge', 'Cervix', 'Vagina']
      },
      {
        heading: 'What Normal Discharge Looks Like',
        body: 'Normal discharge can be clear, milky white, or pale cream. It may be watery, sticky, or stretchy like egg whites around ovulation. It usually has very little smell.',
        tip: 'Many girls start noticing vaginal discharge 6 to 18 months before their first period begins. It’s a sure sign your reproductive system is developing nicely!'
      },
      {
        heading: 'When to Check with a Doctor',
        body: 'If your discharge looks greenish, clumpy like cottage cheese, has a strong fishy odor, or causes itching and burning, check with a doctor or nurse for a quick, simple remedy.'
      }
    ]
  },
  {
    id: 'body-changes-cramps',
    category: 'body',
    title: 'Soothing Menstrual Cramps',
    subtitle: 'Why cramps happen and natural ways to feel cozy and comfortable',
    readTime: '3 min read',
    points: 15,
    iconName: 'Heart',
    summary: 'Gentle, comforting remedies to ease period aches and lower belly tightening.',
    sections: [
      {
        heading: 'Why Do Cramps Happen?',
        body: 'Menstrual cramps happen when your uterus muscles gently squeeze to help shed its lining. Natural body chemicals called prostaglandins trigger these gentle squeezes.',
        medicalTerms: ['Menstrual cramps', 'Uterus']
      },
      {
        heading: 'Natural At-Home Comfort Tips',
        body: '• Warmth: Place a warm water bottle or heating pad on your lower tummy.\n• Warm drinks: Sip chamomile, ginger, or peppermint herbal tea.\n• Gentle movement: Light walking or gentle yoga cat-cow stretches relieve muscle tension.\n• Hydration: Drink plenty of water to ease bloating.',
        tip: 'A warm bath or shower before bedtime relaxes both body and mind, helping you sleep soundly.'
      },
      {
        heading: 'When You Might Need Pain Relief',
        body: 'If cramps interfere with going to school or playing sports, ask a parent or doctor if an age-appropriate over-the-counter pain reliever like ibuprofen is right for you.'
      }
    ]
  },
  {
    id: 'tracker-guide-fields',
    category: 'guide',
    title: 'How Your Period Tracker Works',
    subtitle: 'Plain English definitions of every tracker field',
    readTime: '3 min read',
    points: 15,
    iconName: 'Compass',
    summary: 'Clear explanations of period start dates, cycle lengths, flow levels, and estimates.',
    sections: [
      {
        heading: 'Period Start Date vs End Date',
        body: '• Start Date: The first day you notice actual red bleeding (not just tiny faint spotting).\n• End Date: The final day of your bleeding. You can log your start date right away and update your end date when your bleeding finishes.'
      },
      {
        heading: 'Cycle Length vs Period Duration',
        body: '• Period Duration: The number of days you bleed (usually 3 to 7 days).\n• Cycle Length: The total days from the start of ONE period to the start of the NEXT period (e.g., 28 to 35 days).'
      },
      {
        heading: 'Flow Levels: Light, Medium, Heavy',
        body: '• Light: A few drops to light marks on your pad.\n• Medium: Steady flow requiring pad changes every 4 to 6 hours.\n• Heavy: Richer flow requiring more frequent changes on days 1 and 2.'
      },
      {
        heading: 'Estimated Next Period Window',
        body: 'Nurtura calculates the average gap between your recorded start dates once you log two or more cycles. It highlights an estimated window on your calendar so you can pack your supplies and feel prepared!',
        tip: 'Remember: predictions are supportive estimates, not medical promises. Irregularity is normal!'
      }
    ]
  }
];
