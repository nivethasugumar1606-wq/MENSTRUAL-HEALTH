/**
 * MOONLIT Body & Food Decoder Educational Content
 * Non-judgmental, evidence-informed, empowering, and medically sound.
 */

export const DECODE_BODY_TOPICS = [
  {
    id: 'irregular-periods',
    title: 'Irregular Periods',
    category: 'Cycle Rhythms',
    summary: 'Why your period might not arrive like clockwork, and what is normal.',
    physiologicalCause: 'Adolescent development, acute emotional stress, illness, rapid travel across time zones, or natural hormonal shifts altering the hypothalamic-pituitary-ovarian (HPO) axis.',
    quickRelief: [
      'Track 3–4 cycles for pattern discovery',
      'Prioritize 8+ hours of restorative sleep',
      'Warm chamomile or spearmint tea',
      'Consult clinician if >90 days absent'
    ],
    content: `
      <p>In school textbooks, cycles are often described as arriving every 28 days. In reality, a healthy cycle can range anywhere from <strong>21 to 38 days</strong> in adults, and up to <strong>45 days</strong> for teens whose hypothalamic-pituitary-ovarian (HPO) axis is still maturing.</p>
      <h4>Common Reasons for Cycle Shifts:</h4>
      <ul>
        <li><strong>Adolescent development:</strong> It can take 2–3 years after your very first period for ovulation to establish a steady rhythm.</li>
        <li><strong>Stress & cortisol:</strong> High stress signals the body that it is not an ideal time for pregnancy, temporarily delaying ovulation.</li>
        <li><strong>Illness or travel:</strong> Time zone changes or common viral bugs can delay your cycle by several days.</li>
        <li><strong>Hormonal conditions:</strong> Such as PCOS or thyroid variations.</li>
      </ul>
      <div class="safety-box">
        <strong>When to speak with a doctor:</strong> If you haven't had a period for more than 90 days (and are not pregnant), or if your periods consistently occur more frequently than every 21 days or less than every 45 days.
      </div>
    `
  },
  {
    id: 'acne-skin',
    title: 'Acne & Skin Changes',
    category: 'Skin & Hormones',
    summary: 'How shifting estrogen, progesterone, and androgens affect your skin.',
    physiologicalCause: 'Peak progesterone in the luteal phase promotes sebum (oil) secretion while pore channels slightly narrow, creating transient chin and jawline breakouts.',
    quickRelief: [
      'Gentle non-stripping cleanser (pH 5.5)',
      'Salicylic acid (BHA) spot treatment',
      'Zinc and omega-3 rich meals',
      'Avoid harsh mechanical scrubbing'
    ],
    content: `
      <p>Skin changes before or during your period are exceptionally common. In the second half of your cycle (the luteal phase), progesterone peaks, which can increase sebum (oil) production and narrow skin pores.</p>
      <h4>What You Should Know:</h4>
      <ul>
        <li><strong>Jawline and chin breakouts:</strong> Oil glands in this area are sensitive to normal androgen fluctuations.</li>
        <li><strong>Gentle care wins:</strong> Avoid aggressive scrubbing, which can damage the skin barrier and cause more inflammation.</li>
        <li><strong>Acne does not equal PCOS:</strong> While hormonal acne can be one symptom of PCOS, millions of teens and young adults have acne purely from normal sebum and skin microbiome factors.</li>
      </ul>
    `
  },
  {
    id: 'hair-changes',
    title: 'Hair Changes (Growth & Thinning)',
    category: 'Hormones & Genetics',
    summary: 'Understanding androgen sensitivity, hirsutism, and hair shedding.',
    physiologicalCause: 'Genetics, androgen receptor sensitivity, or post-stress telogen effluvium that naturally shifts hair follicles between growth and resting phases.',
    quickRelief: [
      'Check serum ferritin (iron stores)',
      'Biotin and balanced dietary protein',
      'Scalp massage with rosemary extract',
      'Gentle loose hairstyles to reduce tension'
    ],
    content: `
      <p>Hair growth is guided by genetics and hormonal sensitivity. Androgens (often nicknamed 'male hormones', though everyone naturally produces them) influence hair follicles.</p>
      <h4>Key Facts:</h4>
      <ul>
        <li><strong>Coarser facial or body hair (hirsutism):</strong> Can occur when follicles are sensitive to androgens or when androgen levels are elevated.</li>
        <li><strong>Diffuse shedding:</strong> Can occur 2–3 months after high stress, rapid weight loss, or low ferritin (iron stores) from heavy bleeding.</li>
        <li><strong>Supportive care:</strong> A doctor can run simple blood panels (such as free testosterone, DHEA-S, thyroid, and ferritin) to explore underlying factors.</li>
      </ul>
    `
  },
  {
    id: 'low-energy',
    title: 'Low Energy & Fatigue',
    category: 'Body Energy',
    summary: 'Why you might feel wiped out before your period, and how to recharge.',
    physiologicalCause: 'Late luteal drop in estrogen and progesterone leads to a temporary dip in brain serotonin and a rise in basal metabolic rate (+150-250 kcal/day).',
    quickRelief: [
      'Add 200 kcal complex carb snacks',
      'Magnesium glycinate (200-300 mg)',
      'Short 20-min afternoon power nap',
      'Gentle yin yoga or strolls'
    ],
    content: `
      <p>Feeling exhausted in the days leading up to your period is biological, not laziness. During the late luteal phase, estrogen and progesterone levels drop sharply, which temporarily reduces brain serotonin.</p>
      <h4>Helpful Ways to Support Energy:</h4>
      <ul>
        <li><strong>Iron & blood loss:</strong> If you have heavy bleeding, ask your doctor to test serum ferritin. Low iron causes deep fatigue.</li>
        <li><strong>Steady nourishment:</strong> Skipping meals can cause blood sugar plunges that magnify exhaustion.</li>
        <li><strong>Permission to rest:</strong> Your body is doing significant cellular work. It is okay to take slower afternoons.</li>
      </ul>
    `
  },
  {
    id: 'period-pain',
    title: 'Period Pain (Dysmenorrhea)',
    category: 'Pain Science',
    summary: 'What causes cramping, and when pain signals something needing medical care.',
    physiologicalCause: 'Endometrial cells synthesize prostaglandins (PGF2a) causing rhythmic uterine muscular contractions to clear lining tissue.',
    quickRelief: [
      'Continuous warm compress / heating pad',
      'Ginger tea or 500mg ginger extract',
      'Pelvic rocking & child pose stretch',
      'NSAIDs taken early with food if needed'
    ],
    content: `
      <p>Menstrual cramps occur because the uterine lining produces chemical messengers called <strong>prostaglandins</strong>. These cause the muscular uterine wall to contract and shed its lining.</p>
      <h4>Understanding Your Pain:</h4>
      <ul>
        <li><strong>Primary Dysmenorrhea:</strong> Common cramping linked to prostaglandins. Usually peaks on Day 1 or Day 2 (or occasionally Day 3–4) and responds well to warmth and anti-inflammatory relief.</li>
        <li><strong>Secondary Dysmenorrhea:</strong> Pain caused by conditions such as endometriosis, adenomyosis, or fibroids.</li>
      </ul>
      <div class="safety-box">
        <strong>Important Rule:</strong> Severe pain that causes you to miss school, faint, vomit, or does not respond to standard pain medication is NOT 'just part of being a woman.' It deserves thorough clinical evaluation.
      </div>
    `
  },
  {
    id: 'pcos-pcod-questions',
    title: 'PCOS & PCOD Decoded',
    category: 'Endocrine Health',
    summary: 'A clear, compassionate explanation of Polycystic Ovary Syndrome.',
    physiologicalCause: 'Insulin resistance and altered LH/FSH signaling ratios leading to delayed or anovulatory follicular maturation.',
    quickRelief: [
      'Pair carbs with protein & fats',
      'Inositol (Myo + D-Chiro 40:1 ratio)',
      'Resistance training & walking',
      'Compassionate self-talk & stress care'
    ],
    content: `
      <p>PCOS is one of the most common endocrine conditions worldwide, affecting roughly 1 in 10 women. Despite its name, the 'cysts' seen on ultrasound are actually tiny, harmless immature egg follicles that paused in development.</p>
      <h4>Three Pillars of Diagnosis (Rotterdam Criteria):</h4>
      <p>A doctor looks for at least <strong>two</strong> of the following three features, after ruling out other conditions:</p>
      <ol>
        <li><strong>Irregular or absent ovulation:</strong> Cycles consistently longer than 35–45 days or missing altogether.</li>
        <li><strong>Signs of higher androgens:</strong> Such as hirsutism, persistent acne, or elevated blood androgens.</li>
        <li><strong>Polycystic appearance on pelvic ultrasound:</strong> Multiple small follicles arranged along the ovary edge.</li>
      </ol>
      <div class="safety-box">
        <strong>PCOS is manageable:</strong> It is not a death sentence, nor does it guarantee infertility. With balanced nourishment, stress care, and appropriate medical support, people with PCOS thrive.
      </div>
    `
  }
];

export const FOOD_FREEDOM_GUIDES = [
  {
    icon: '🥑',
    title: 'Nourish Without Restriction',
    subtitle: 'Why eliminating entire food groups hurts hormones',
    description: 'Your brain and reproductive hormones need sustained energy. Extreme low-carb diets spike cortisol, which can actually worsen menstrual irregularities and insulin resistance.',
    items: ['Healthy Fats (Avocado)', 'Omega-3 (Salmon/Flax)', 'Whole Grains (Oats)', 'Pumpkin & Sunflower Seeds'],
    content: 'Your brain and reproductive hormones need sustained energy. Extreme low-carb diets spike cortisol (stress hormone), which can actually worsen menstrual irregularities and insulin resistance.'
  },
  {
    icon: '🥣',
    title: 'The Balance Plate Blueprint',
    subtitle: 'A flexible, stress-free way to build meals',
    description: 'Rather than focusing on what to remove, focus on what to add! Combine fiber-rich complex carbohydrates with satisfying protein and healthy fats.',
    items: ['1/2 Plate Color & Greens', '1/4 Plate Sustained Protein', '1/4 Plate Slow Complex Carbs', '1-2 Tbsp Mindful Fats'],
    content: 'Rather than focusing on what to remove, focus on what to add! Combine fiber-rich complex carbohydrates (oats, brown rice, sweet potatoes, fruits) with satisfying protein (eggs, tofu, beans, poultry) and healthy fats (nuts, seeds, olive oil, avocado).'
  },
  {
    icon: '⏰',
    title: 'Eating Regularly for Blood Sugar Peace',
    subtitle: 'Smooth energy curves vs sharp spike-crashes',
    description: 'Spacing meals every 3–4 hours keeps glucose and insulin steady. This helps prevent afternoon brain fog, sudden cravings, and stress hormone surges.',
    items: ['Consistent Breakfast', '3-4 Hour Meal Cadence', 'Protein-Anchored Snacks', 'Adequate Hydration'],
    content: 'Spacing meals every 3–4 hours keeps glucose and insulin steady. This helps prevent afternoon brain fog, sudden cravings, and stress hormone surges.'
  },
  {
    icon: '🥛',
    title: 'Busting Common PCOS Food Myths',
    subtitle: 'Separate social media fear from scientific facts',
    description: 'Unless you have celiac disease or a dairy allergy, clinical guidelines do NOT recommend eliminating dairy or gluten. Whole dairy provides calcium and protein.',
    items: ['No Arbitrary Elimination', 'Calcium & Bone Health', 'Mindful Gut Comfort', 'Evidence-Based Nutrition'],
    content: 'Myth: "Dairy and gluten are toxic for everyone with PCOS." Fact: Unless you have celiac disease or a dairy allergy, clinical guidelines do NOT recommend eliminating dairy or gluten. Whole dairy provides calcium and protein.'
  }
];
