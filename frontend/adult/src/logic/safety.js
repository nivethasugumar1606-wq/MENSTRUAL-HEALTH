/**
 * NUTURA Clinical Safety & Medical Triage Engine
 * NON-NEGOTIABLE: HUMAN SAFETY FIRST
 * 
 * Implements clinically reviewed 3-tier safety assessment:
 * Level 1: Mild / Common concerns (concise self-care, cautious wording, warning signs, no Rx/Dx)
 * Level 2: Persistent, worsening, unusual, or concerning symptoms (professional medical assessment recommended, no guessing/false reassurance)
 * Level 3: Potential emergencies (immediate emergency services / urgent care advice without requiring questionnaires)
 * 
 * Strict Guardrails:
 * - Never diagnose PCOS/PCOD or other conditions
 * - Never promise cures or endorse dangerous remedies
 * - Never prescribe medication or personalized dosages
 * - Never advise changing/stopping prescriptions
 * - Never assume symptoms are caused by periods or PCOS
 * - Offline-first: zero external AI APIs, zero network calls, zero tracking
 * - Resistant to prompt injection, misspellings, indirect descriptions, symptom combinations
 * - Conservative safe fallback on engine failure
 */

import { FAQ_DATA } from '../data/faqData.js';

export const SAFETY_LEVELS = {
  EMERGENCY: 'emergency',                       // Level 3: Immediate emergency attention required
  MEDICAL_ASSESSMENT: 'medical_assessment',     // Level 2: Professional doctor evaluation recommended
  MILD_CONCERN: 'mild_concern',                 // Level 1: General evidence-informed self-care guidance
  BOUNDARY_NOTICE: 'boundary_notice',           // Safety boundary (anti-override, no Rx, no Dx, no cure)
  UNCERTAINTY: 'uncertainty'                    // Transparent unverified scope fallback
};

export const EMERGENCY_RESOURCES = [
  {
    name: 'National Emergency Response (Police / Medical / Ambulance)',
    number: '112 / 108',
    description: 'Unified 24/7 toll-free emergency response for immediate medical or physical safety crises across India.',
    link: 'tel:112',
    region: 'India'
  },
  {
    name: 'Tele-MANAS (National Mental Health & Distress Helpline)',
    number: '14416 / 1800-891-4416',
    description: 'Free 24/7 confidential psychological counseling and emotional crisis support by the Ministry of Health, India.',
    link: 'tel:14416',
    region: 'India'
  },
  {
    name: 'Childline India (Children & Teens Support)',
    number: '1098',
    description: '24/7 toll-free confidential helpline for adolescents and children needing protection, care, or support.',
    link: 'tel:1098',
    region: 'India'
  },
  {
    name: 'Global Emergency (US / Europe / International)',
    number: '911 (US) / 999 (UK) / 112 (EU)',
    description: 'International emergency medical services.',
    link: 'tel:911',
    region: 'Global'
  }
];

/**
 * Dictionary of common symptom typos & variants
 */
const COMMON_TYPO_MAP = {
  'headpai': 'head pain',
  'headpain': 'head pain',
  'headach': 'headache',
  'hedache': 'headache',
  'headake': 'headache',
  'hedake': 'headache',
  'migrain': 'migraine',
  'legpai': 'leg pain',
  'legpain': 'leg pain',
  'thighpai': 'thigh pain',
  'thighpain': 'thigh pain',
  'backpai': 'back pain',
  'backpain': 'back pain',
  'bakache': 'backache',
  'stomachpai': 'stomach pain',
  'stomachpain': 'stomach pain',
  'stomack': 'stomach',
  'stomak': 'stomach',
  'bloting': 'bloating',
  'bloatd': 'bloating',
  'crampz': 'cramps',
  'crmps': 'cramps',
  'kramps': 'cramps',
  'peroid': 'period',
  'peirod': 'period',
  'priod': 'period',
  'tierd': 'tired',
  'tiredd': 'tired',
  'brest': 'breast',
  'brests': 'breasts',
  'headp': 'head pain',
  'headpa': 'head pain',
  'nauzea': 'nausea',
  'nausious': 'nausea'
};

/**
 * Normalizes input text for resilient pattern recognition:
 * - strips noise punctuation
 * - collapses whitespace
 * - corrects common medical typos and splits compound words (e.g. headpai -> head pain)
 */
function normalizeText(text = '') {
  if (typeof text !== 'string') return '';
  const cleaned = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Token-level typo correction & compound word splitting
  const words = cleaned.split(' ').map(w => {
    if (COMMON_TYPO_MAP[w]) return COMMON_TYPO_MAP[w];
    // Split compound symptom words ending in 'pai' or 'pain' (e.g. headpai -> head pain)
    if (/^(head|leg|back|stomach|thigh|period|belly|pelvic)pai(n)?$/.test(w)) {
      return w.replace(/pai(n)?$/, ' pain');
    }
    // Split compound symptom words ending in 'ache' or 'ach' (e.g. headach -> head ache)
    if (/^(head|back|stomach|tummy|belly|ear|tooth)ach(e)?$/.test(w)) {
      return w.replace(/ach(e)?$/, ' ache');
    }
    return w;
  });

  return words.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Clinical Red-Flag Patterns (Level 3 - Potential Emergencies)
 * Non-exhaustive, covering critical acute symptoms, typos, indirect phrasing, and combinations
 */
const EMERGENCY_PATTERNS = [
  // 1. Sudden Severe Headache / Thunderclap / Neurological
  {
    id: 'sudden_severe_headache',
    label: 'Sudden Worst-Ever Headache',
    regex: /(worst(\s+ever)?\s+(headache|head\s*ache|pain\s+in\s+my\s+head|headach|hedache)|thunderclap(\s+headache)?|head\s*(feels\s*like\s*it\s*)?exploded|sudden(ly)?\s+(extremely|very|unbearable|excruciating)\s+(severe\s+)?(headache|head\s*ache|headach))/i,
    urgentMessage: 'A sudden, extremely severe headache ("worst headache of your life" or thunderclap headache) can indicate a neurological emergency (such as vascular bleeding or intracranial pressure). Do not wait to see if it passes.'
  },
  // 2. Stroke / Acute Neurological Signs (FAST)
  {
    id: 'stroke_signs',
    label: 'Potential Stroke / Neurological Warning Signs',
    regex: /(face\s+(droop|drooping|numb)|cannot\s+(lift|raise|move)\s+(my\s+)?(arm|leg)|(arm|leg)\s+(weakness|paralyzed|numbness)|slurr(ed|ing)\s+speech|cannot\s+speak|sudden(ly)?\s+(cannot|can\s*not|lost)\s+(see|vision)|stroke|seizure|convulsion)/i,
    urgentMessage: 'Sudden facial drooping, weakness or numbness in an arm or leg, slurred speech, or sudden vision loss are emergency signs requiring immediate hospital evaluation.'
  },
  // 3. Chest Pain & Severe Respiratory Distress
  {
    id: 'chest_pain_breathing',
    label: 'Chest Pain or Severe Breathing Distress',
    regex: /(ch(e|es)?st\s*(p(a|ai|i)n|tight(ness)?|pressure)|elephant\s+on\s+(my\s+)?chest|cannot\s+(breathe|catch\s+my\s+breath)|severe\s+short(ness)?\s+of\s+breath|gasping\s+for\s+(air|breath)|struggling\s+to\s+breathe|breathing\s+dificulty|chset\s+p(a|ai)n|hart\s+p(a|ai)n|heart\s+attack)/i,
    urgentMessage: 'Chest pain, chest pressure, or severe difficulty breathing are potential medical emergencies. Do not delay seeking emergency evaluation.'
  },
  // 4. Heavy Bleeding Red Flags (Soaking pads/tampons, massive clots, bleeding with dizziness)
  {
    id: 'heavy_bleeding_emergency',
    label: 'Extreme Bleeding with Signs of Hemodynamic Instability',
    regex: /(soak(ing|ed|in)?\s*(\d+|one|two|2|3|\+)?\s*(pad|tampon|pds|pd)s?\s*(every|each|an|per|\/|\s*a\s*)\s*(hour|hr)|blood\s*clot(s)?\s*(larger|bigger)\s*than\s*(a\s*)?(quarter|coin|lemon|golf|fist|palm|huge|giant)|bleeding\s+(through|soaking)\s+(clothes|bed|sheets|pants)\s+in\s+(minutes|an\s+hour)|bleed(ing)?\s+heav(il)?y\s+and\s+(faint|dizz|collaps|shak)|hemorrhag)/i,
    urgentMessage: 'Soaking through pads or tampons every hour for two or more hours, passing blood clots larger than a quarter (or coin), or heavy bleeding accompanied by dizziness indicates severe blood loss requiring prompt emergency medical evaluation.'
  },
  // 5. Suspected Ectopic Pregnancy / Acute Reproductive Emergency
  {
    id: 'ectopic_pregnancy_warning',
    label: 'Possible Pregnancy with Pain or Bleeding',
    regex: /(pregnant|pregnancy|positive\s+(pregnancy\s+)?test)\s+(and|with|having)\s+(severe\s+)?(pain|bleed(ing)?|cramp(s)?|one\s*sided\s+pain)|one\s*sided\s+pelvic\s+pain\s+and\s+bleed/i,
    urgentMessage: 'Any pelvic or lower abdominal pain, particularly one-sided, or bleeding during a confirmed or suspected pregnancy requires immediate emergency evaluation to rule out ectopic pregnancy.'
  },
  // 6. Crisis, Self-Harm, or Physical Danger
  {
    id: 'crisis_danger',
    label: 'Crisis, Self-Harm, or Immediate Safety Concern',
    regex: /(kill\s+(my\s*self|myself)|suicid(e|al)|want\s+to\s+die|hurt\s+(my\s*self|myself)|self\s*harm|cutting\s+myself|overdose|physical(ly)?\s+abuse(d)?|beaten|hitting\s+me|threaten(ed|ing)\s+me|forced\s+me\s+sexually|sexual\s+assault)/i,
    urgentMessage: 'Your safety, life, and emotional well-being are paramount. You do not have to carry distress alone. Please contact emergency services or a dedicated 24/7 crisis counselor immediately.'
  },
  // 7. Severe Anaphylaxis / Acute Airway Swelling
  {
    id: 'anaphylaxis_allergy',
    label: 'Severe Allergic Reaction / Airway Compromise',
    regex: /(swelling|swollen)\s+(in\s+)?(my\s+)?(tongue|throat|lips)\s+(and|cant|cannot|trouble)\s+(breath|swallow)|throat\s+closing\s+up|anaphyla(xis|ctic)/i,
    urgentMessage: 'Swelling of the tongue, throat, or lips with difficulty swallowing or breathing is an acute medical emergency (anaphylaxis) requiring immediate emergency medical assistance.'
  },
  // 8. Acute Unilateral Leg Swelling / Redness (Suspected DVT)
  {
    id: 'dvt_emergency',
    label: 'Sudden Unilateral Leg Swelling and Redness',
    regex: /(one\s+leg|single\s+leg|left\s+leg|right\s+leg|one\s+calf|calf)\s+(is\s+)?(swollen|swelling|red|hot\s+to\s+touch|warm\s+to\s+touch)/i,
    urgentMessage: 'Sudden swelling, redness, or heat localized to one leg or calf can be a sign of a deep vein thrombosis (blood clot). This requires prompt emergency clinical evaluation.'
  }
];

/**
 * Combination Emergency Rules (evaluating dual/multi-symptom red flags)
 */
function checkCombinationEmergencies(norm) {
  const hasCollapseFaintShock = /(faint(ed|ing|t)?|feelin\s+faint|pass(ed)?\s*out|collaps(ed|ing)?|black(ed)?\s*out|loss\s+of\s+consciousness|unconscious|pale\s+lips|clammy\s+skin|severe\s+dizz(y|iness)|dizy|faintt)/i.test(norm);

  // Severe Abdominal/Pelvic Pain + Fainting / Dizziness / Collapse / Shock
  const hasSevereAbdominal = /(severe|sharp|extreme|unbearable|excruciating|terrible|agonizing)\s+(abdominal|stomach|belly|pelvic|tummy|period|cramp)\s*pain|appendix\s*(burst|bursting|rupture)|worst\s+(stomach|abdominal|pelvic)\s+pain/i.test(norm)
    || (/(severe|extreme|sharp|excruciating)\s+cramp/i.test(norm) && /(stomach|abdomen|pelvis|belly)/i.test(norm));

  if (hasSevereAbdominal && hasCollapseFaintShock) {
    return {
      id: 'severe_abdominal_with_fainting',
      label: 'Severe Abdominal Pain with Fainting or Collapse',
      urgentMessage: 'Severe abdominal or pelvic pain combined with fainting, lightheadedness, or collapse can indicate internal bleeding, ruptured cyst, appendicitis, or pelvic emergency. This requires immediate emergency medical attention.'
    };
  }

  // Heavy Bleeding / Soaking Pads + Fainting / Dizziness (even with typos)
  const hasHeavyBleed = /(soak(ing|ed|in)?\s*(\d+|one|two|2|3|\+)?\s*(pad|tampon|pds|pd)|bleed(ing|in)?\s*(heav(il)?y|a\s+lot)|lots\s+of\s+blood)/i.test(norm);
  if (hasHeavyBleed && hasCollapseFaintShock) {
    return {
      id: 'heavy_bleeding_with_fainting',
      label: 'Heavy Bleeding with Fainting or Dizziness',
      urgentMessage: 'Heavy bleeding accompanied by dizziness, faintness, or collapse indicates significant blood loss and hemodynamic instability. Please seek immediate emergency medical evaluation.'
    };
  }

  // Severe Pelvic Pain + High Fever + Chills / Vomiting
  const hasPelvicPain = /(pelvic|ovary|lower\s+belly|cramp(s)?)\s+pain/i.test(norm);
  const hasFeverVomit = /(high\s+fever|fever\s+(of\s+)?(102|103|104)|chills|vomit(ing)?)/i.test(norm);
  if (hasPelvicPain && hasFeverVomit && /(severe|intense|sharp|acute)/i.test(norm)) {
    return {
      id: 'pelvic_pain_fever_infection',
      label: 'Severe Pelvic Pain with Fever and Vomiting',
      urgentMessage: 'Severe pelvic pain accompanied by high fever or repeated vomiting may indicate acute pelvic inflammatory disease, ovarian torsion, or appendicitis. Seek emergency evaluation promptly.'
    };
  }

  return null;
}

/**
 * Safety Boundary Overrides & Dangerous Requests
 */
const BOUNDARY_PATTERNS = [
  // 1. Prompt Injection / Rule Bypass Attempts
  {
    id: 'anti_bypass',
    type: 'bypass',
    regex: /(ignore\s+(all\s+)?(previous|safety|prior|system)?\s*(instructions|rules|guidelines)|system\s+prompt|bypass\s+(safety|rules|guardrails)|pretend\s+(you\s+are|to\s+be)\s+(an?\s+)?(unrestricted|jailbroken|real)\s+doctor|unrestricted\s+doctor|disregard\s+(the\s+)?(safety\s+)?guidelines|act\s+as\s+a\s+doctor\s+who\s+diagnoses|roleplay\s+as\s+an?\s+unfiltered)/i,
    response: 'Nutura operates under non-negotiable medical safety standards designed to protect human health. I cannot bypass safety guidelines, pretend to be a licensed clinician, or provide unrestricted diagnostic evaluations.'
  },
  // 2. Direct Demands for Medical Diagnosis
  {
    id: 'demand_diagnosis',
    type: 'diagnosis_refusal',
    regex: /(do\s+i\s+have\s+(pcos|pcod|endometriosis|cancer|fibroids|adenomyosis)|diagnose\s+(me|my\s+condition|what\s+i\s+have)|tell\s+me\s+my\s+diagnosis|can\s+you\s+diagnose)/i,
    response: 'Nutura is an educational and tracking companion, not a medical doctor. I cannot diagnose PCOS, PCOD, endometriosis, or any medical condition. An accurate diagnosis requires clinical evaluation by a physician, including physical examination, personal medical history, and recommended tests (such as hormone panels or pelvic ultrasound).'
  },
  // 3. Demands for Prescription Drugs / Specific Dosages
  {
    id: 'demand_prescription',
    type: 'prescription_refusal',
    regex: /(prescribe\s+(me|some|a|medication|pills|drugs)|what\s+(dosage|dose|mg)\s+(of\s+[\w\s]+)?should\s+i\s+take|how\s+many\s+mg\s+of|give\s+me\s+a\s+prescription|should\s+i\s+take\s+(metformin|spironolactone|birth\s*control|contraceptive|antibiotic|mefenamic|tranexamic)\s+without)/i,
    response: 'Nutura cannot prescribe medications or recommend personalized drug dosages. Prescription therapies require clinical oversight to evaluate contraindications, correct dosing, and medical history. Please consult a licensed doctor or qualified pharmacist.'
  },
  // 4. Instructions to Stop or Alter Prescriptions
  {
    id: 'stop_prescription',
    type: 'prescription_refusal',
    regex: /(should\s+i\s+(stop|quit|discontinue)\s+(taking\s+)?my\s+(pills|medication|prescription|birth\s*control)|can\s+i\s+stop\s+taking\s+my\s+medicine)/i,
    response: 'Never stop or alter a prescribed medication without first discussing it with the clinician who prescribed it. Sudden changes in medication can cause rebound symptoms or adverse effects.'
  },
  // 5. Cures for PCOS or Incurable Chronic Conditions
  {
    id: 'cure_promise',
    type: 'cure_refusal',
    regex: /(how\s+to\s+cure\s+(pcos|pcod|endometriosis)|cure\s+for\s+(pcos|pcod)|permanent\s+cure\s+for\s+pcos|home\s+remedy\s+(cure|to\s+get\s+rid\s+of)\s+pcos)/i,
    response: 'There is no scientifically proven overnight "cure" for PCOS or PCOD. PCOS is a complex endocrine condition that can be managed effectively through evidence-based medical care, nutrition, physical activity, and stress support. Be extremely cautious of unverified home remedies or products promising guaranteed cures.'
  },
  // 6. Dangerous Ingestion / Harmful Home Remedies
  {
    id: 'dangerous_remedy',
    type: 'harmful_remedy',
    regex: /(drink(ing)?\s+(bleach|hydrogen\s+peroxide|vinegar\s+pure|kerosene|detergent)|insert(ing)?\s+(garlic|herbs|foreign\s+objects)\s+into\s+(vagina|uterus))/i,
    response: 'Warning: That suggested practice is medically hazardous and can cause severe chemical burns, toxicity, or permanent reproductive harm. Do not attempt unverified or dangerous home remedies.'
  }
];

/**
 * Concerning / Persistent Symptoms (Level 2 - Medical Assessment Recommended)
 */
const CONCERNING_PATTERNS = [
  // Headache lasting several days / constant
  {
    id: 'persistent_headache',
    regex: /(headache|head\s*ache|migraine)\s+(lasting\s+)?(for\s+)?(\d+|several|few|many|two|three|3|4|5|weeks?|days?)|headache\s+(lasting|for|going\s+on\s+for|every\s+day|persistent|constant)/i,
    concern: 'A headache lasting several consecutive days or occurring daily warrants evaluation by a doctor to examine contributing factors, blood pressure, or underlying causes.'
  },
  // Worsening abdominal or pelvic pain
  {
    id: 'worsening_pain',
    regex: /(worsening|getting\s+worse|increasing\s+in\s+intensity|pain\s+is\s+getting\s+worse|pain\s+spread(ing)?)\s+(pain|cramp|stomach|abdom|pelvi)/i,
    concern: 'Pain that progressively worsens over hours or days should be evaluated by a healthcare professional rather than assumed to be routine period cramps.'
  },
  // Period lasting longer than 7 days
  {
    id: 'prolonged_bleeding',
    regex: /(period|bleeding)\s+(lasting|has\s+lasted|for)\s+(longer\s+than|more\s+than|over)\s+(7|seven|8|9|10|12|14|weeks?)\s+days?/i,
    concern: 'Menstrual bleeding continuing for more than 7 consecutive days can increase the risk of fatigue or iron deficiency and deserves a physician evaluation.'
  },
  // Absent period > 90 days (amenorrhea)
  {
    id: 'absent_period',
    regex: /(missed|no|haven\s*t\s+had\s+a?)\s+(my\s+)?period\s+(for\s+)?(90\s+days|3\s+months|three\s+months|months\s+without|over\s+90\s+days)/i,
    concern: 'A gap of 90 days or longer between periods (amenorrhea) without pregnancy can be influenced by hormone balance, stress, or thyroid function, and merits clinical investigation.'
  },
  // Severe pain interfering with normal life
  {
    id: 'severe_functional_pain',
    regex: /(cramps|pain)\s+(prevent|stop|cannot|unable\s+to)\s+(me\s+from\s+)?(go(ing)?\s+to\s+school|work(ing)?|get\s+out\s+of\s+bed|sleep(ing)?)|miss(ed|ing)\s+school\s+every\s+period/i,
    concern: 'Menstrual pain that regularly prevents school attendance, work, or daily functioning is known as severe dysmenorrhea and is a medical symptom that a doctor can treat.'
  },
  // Inability to walk or stand due to severe pain
  {
    id: 'cannot_walk_pain',
    regex: /(cannot|can\s*not|unable\s+to|too\s+painful\s+to)\s+(walk|stand|bear\s+weight|get\s+up|get\s+out\s+of\s+bed)/i,
    concern: 'Pain severe enough to prevent walking or bearing weight requires clinical evaluation by a physician.'
  },
  // Persistent leg pain lasting days
  {
    id: 'persistent_leg_pain',
    regex: /(leg|legs|thigh|calves)\s+(pain|hurts?|aches?)\s+(lasting\s+)?(for\s+)?(\d+|several|few|many|two|three|3|4|5|weeks?|days?)/i,
    concern: 'Leg or thigh pain that persists for several consecutive days deserves an in-person medical evaluation by a doctor.'
  },
  // Suspicious PCOS symptom clusters
  {
    id: 'pcos_clinical_signs',
    regex: /(irregular\s+periods?\s+and\s+(acne|excess\s+hair|facial\s+hair|hair\s+loss)|facial\s+hair\s+on\s+chin\s+and\s+irregular|dark\s+hair\s+growth\s+on\s+(chin|chest|stomach))/i,
    concern: 'Irregular cycles combined with persistent cystic acne or noticeable dark hair growth on the chin or abdomen are clinical signs consistent with hyperandrogenism, which an endocrinologist or gynecologist can evaluate.'
  }
];

/**
 * Mild Common Concerns (Level 1)
 */
const MILD_PATTERNS = [
  // 1. Leg and Thigh Pain / Aches
  {
    id: 'mild_legs',
    regex: /(leg\s*(ach[es]*|pai[ns]*|hurts?|sor[es]*|cramp[s]*)|legs?\s+(hurt|ache|pain|sore|cramp|swollen)|legpai|legpain|thigh\s*(pai[ns]*|ach[es]*|hurts?|cramp[s]*)|thighs?\s+(hurt|ache|pain|sore|cramp)|thighpain|thighpai|calves?\s+(hurt|ache)|radiat(ing|es)?\s+(to|down)\s+(my\s+)?legs?|lower\s+body\s+(ache|pain))/i,
    topic: 'legs'
  },
  // 2. Backache / Lower Back Pain
  {
    id: 'mild_backache',
    regex: /(back\s*ach[es]*|backpai|backpain|bakache|lower\s+back\s*(pai[ns]*|ach[es]*|hurts?|sor[es]*)|back\s+(pain|hurts|aches|is\s+killing\s+me)|lumbar\s+pain)/i,
    topic: 'backache'
  },
  // 3. Headache & Head Pain (resilient to typos like headpai, headpain, hedache)
  {
    id: 'mild_headache',
    regex: /(head\s*(ach[es]*|pai[ns]*|hurts?|throbb?ing)|hedach[es]*|headpai|headpain|headache|migrain[es]*|pain\s+in\s+(my\s+)?head)/i,
    topic: 'headache'
  },
  // 4. Stomach / Digestion / Nausea / Bloating
  {
    id: 'mild_stomach',
    regex: /(stomach\s*(ach[es]*|pai[ns]*|upset|discomfort)|stomachpai|stomachpain|stomack|stomak|tumm?y\s*(ach[es]*|pai[ns]*|upset|discomfort)|bloat(ing|ed)?|bloting|naus(ea|eous|ious)?|feel\s+sick\s+to\s+my\s+stomach)/i,
    topic: 'stomach'
  },
  // 5. Cramps / Pelvic Pain
  {
    id: 'mild_cramps',
    regex: /(cramp[sz]*|crmp[s]*|period\s*pai[ns]*|periodpai|periodpain|menstrual\s*pai[ns]*|uterus\s*hurts?)/i,
    topic: 'cramps'
  },
  // 6. Breast Soreness / Tenderness
  {
    id: 'mild_breasts',
    regex: /(breast[s]?|brest[s]?|boob[s]?)\s*(tender|sore|hurt[s]*|pai[ns]*|swoll?en)?|sore\s*(breast[s]?|brest[s]?|boob[s]?)|tender\s*breast[s]?|breastpai|breastpain|chest\s*tender(ness)?/i,
    topic: 'breasts'
  },
  // 7. Fatigue / Tiredness
  {
    id: 'mild_fatigue',
    regex: /(fatig(ue)?|exhaust(ed|ion)?|no\s*energy|tired|tierd|sleepy|weakness\s*(during|on)?\s*period)/i,
    topic: 'fatigue'
  }
];

/**
 * PRIMARY SAFETY ASSESSMENT FUNCTION
 * Runs BEFORE every message response generation
 * Handles typos, indirect phrasing, symptom combinations, and anti-bypass
 */
export function assessSafety(rawText = '', conversationHistory = []) {
  try {
    const text = String(rawText || '');
    const norm = normalizeText(text);

    if (!norm) {
      return {
        level: SAFETY_LEVELS.MILD_CONCERN,
        triggerType: 'empty_input',
        matchedPatterns: [],
        immediateActionRequired: false,
        resources: []
      };
    }

    // 1. Check for Anti-Bypass / Prompt Injection / Medical Boundary Violations FIRST
    for (const b of BOUNDARY_PATTERNS) {
      if (b.regex.test(norm) || b.regex.test(text)) {
        return {
          level: SAFETY_LEVELS.BOUNDARY_NOTICE,
          triggerType: b.type,
          boundaryId: b.id,
          matchedPatterns: [b.id],
          immediateActionRequired: false,
          boundaryResponse: b.response,
          resources: []
        };
      }
    }

    // 2. Check for Combination Emergencies (Level 3)
    const comboEmergency = checkCombinationEmergencies(norm);
    if (comboEmergency) {
      return {
        level: SAFETY_LEVELS.EMERGENCY,
        triggerType: 'combination_emergency',
        emergencyId: comboEmergency.id,
        matchedPatterns: [comboEmergency.label],
        immediateActionRequired: true,
        urgentMessage: comboEmergency.urgentMessage,
        resources: EMERGENCY_RESOURCES
      };
    }

    // 3. Check for Individual Red-Flag Emergencies (Level 3)
    for (const ep of EMERGENCY_PATTERNS) {
      if (ep.regex.test(norm) || ep.regex.test(text)) {
        return {
          level: SAFETY_LEVELS.EMERGENCY,
          triggerType: 'red_flag_emergency',
          emergencyId: ep.id,
          matchedPatterns: [ep.label],
          immediateActionRequired: true,
          urgentMessage: ep.urgentMessage,
          resources: EMERGENCY_RESOURCES
        };
      }
    }

    // 4. Check for Concerning / Persistent Symptoms (Level 2)
    for (const cp of CONCERNING_PATTERNS) {
      if (cp.regex.test(norm) || cp.regex.test(text)) {
        return {
          level: SAFETY_LEVELS.MEDICAL_ASSESSMENT,
          triggerType: 'concerning_symptom',
          concernId: cp.id,
          matchedPatterns: [cp.id],
          immediateActionRequired: false,
          concernExplanation: cp.concern,
          resources: []
        };
      }
    }

    // 5. Check for Mild Common Concerns (Level 1)
    for (const mp of MILD_PATTERNS) {
      if (mp.regex.test(norm) || mp.regex.test(text)) {
        return {
          level: SAFETY_LEVELS.MILD_CONCERN,
          triggerType: 'mild_concern',
          mildTopic: mp.topic,
          matchedPatterns: [mp.id],
          immediateActionRequired: false,
          resources: []
        };
      }
    }

    // 6. Check Medically Reviewed Offline FAQ Knowledge Base
    const faqMatch = findLocalFaq(norm);
    if (faqMatch) {
      return {
        level: SAFETY_LEVELS.MILD_CONCERN,
        triggerType: 'reviewed_faq',
        matchedFaq: faqMatch,
        matchedPatterns: [faqMatch.id],
        immediateActionRequired: false,
        resources: []
      };
    }

    // 7. General / Unsupported Medical Question -> Transparent Uncertainty
    return {
      level: SAFETY_LEVELS.UNCERTAINTY,
      triggerType: 'unsupported_scope',
      matchedPatterns: [],
      immediateActionRequired: false,
      resources: []
    };

  } catch (err) {
    // Fail-safe conservative fallback on safety evaluator error
    console.error('Safety evaluation exception encountered:', err);
    return {
      level: SAFETY_LEVELS.MEDICAL_ASSESSMENT,
      triggerType: 'evaluator_fallback_error',
      matchedPatterns: ['evaluator_error_safe_fallback'],
      immediateActionRequired: false,
      concernExplanation: 'Nutura offline safety engine encountered an unexpected evaluation issue. To keep you safe, please consult a healthcare professional for clinical advice or call 112/108 if experiencing severe symptoms.',
      resources: EMERGENCY_RESOURCES
    };
  }
}

/**
 * Helper to escape regex special characters
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const FAQ_STOP_WORDS = new Set([
  'what', 'how', 'why', 'when', 'where', 'which', 'who', 'whom',
  'can', 'the', 'and', 'for', 'with', 'does', 'did', 'stop', 'help',
  'have', 'has', 'had', 'are', 'you', 'your', 'about', 'some', 'that',
  'this', 'from', 'also', 'into', 'just', 'more', 'much', 'should',
  'could', 'would', 'tell', 'want', 'know', 'feel', 'like'
]);

/**
 * Searches the approved offline FAQ dataset with keyword and question scoring
 */
function findLocalFaq(normQuery) {
  if (!normQuery) return null;
  const qWords = normQuery.split(' ').filter(w => w.length > 2);
  const meaningfulWords = qWords.filter(w => !FAQ_STOP_WORDS.has(w));

  let bestMatch = null;
  let highestScore = 0;

  // Detect query body part focus to prevent cross-topic hijacking
  const queryBodyParts = ['leg', 'legs', 'thigh', 'thighs', 'calf', 'calves', 'breast', 'breasts', 'head', 'headache', 'back', 'backache'].filter(bp => {
    return new RegExp(`\\b${bp}\\b`, 'i').test(normQuery);
  });

  for (const faq of FAQ_DATA) {
    let score = 0;
    const qLower = (faq.question.en || '').toLowerCase();
    const qTa = (faq.question.ta || '').toLowerCase();
    const qHi = (faq.question.hi || '').toLowerCase();
    const allFaqText = `${qLower} ${(faq.keywords || []).join(' ').toLowerCase()}`;

    // If query is specifically about a body part, candidate FAQ must have relevant terminology
    if (queryBodyParts.length > 0) {
      const faqHasBodyPart = queryBodyParts.some(bp => allFaqText.includes(bp));
      if (!faqHasBodyPart) {
        continue; // Skip this FAQ to prevent cross-symptom mismatch
      }
    }

    // Direct question substring match
    if (qLower.includes(normQuery) || normQuery.includes(qLower) ||
        (qTa && normQuery.includes(qTa)) || (qHi && normQuery.includes(qHi))) {
      score += 10;
    }

    // Keyword match with word boundaries (prevents 'ache' matching 'headache')
    if (faq.keywords && Array.isArray(faq.keywords)) {
      for (const kw of faq.keywords) {
        const kwLower = kw.toLowerCase().trim();
        if (!kwLower) continue;
        const kwPattern = new RegExp(`\\b${escapeRegExp(kwLower)}\\b`, 'i');
        if (kwPattern.test(normQuery)) {
          score += 5;
        }
      }
    }

    // Word token overlap with whole word matching (excluding stop words)
    for (const w of meaningfulWords) {
      const wPattern = new RegExp(`\\b${escapeRegExp(w)}\\b`, 'i');
      if (wPattern.test(qLower)) {
        score += 2;
      }
    }

    if (score > highestScore && score >= 4) {
      highestScore = score;
      bestMatch = faq;
    }
  }

  return bestMatch;
}

/**
 * RESPONSE GENERATOR
 * Formulates transparent, structured medical guidance based on Safety Level
 */
export function generateSafeResponse(rawText = '', safetyAssessment = null, lang = 'en') {
  const assessment = safetyAssessment || assessSafety(rawText);

  // LEVEL 3: POTENTIAL EMERGENCY
  if (assessment.level === SAFETY_LEVELS.EMERGENCY) {
    return {
      level: SAFETY_LEVELS.EMERGENCY,
      badge: '🔴 Emergency Medical Guidance',
      badgeClass: 'chat-badge-emergency',
      isEmergency: true,
      requiresAction: true,
      text: `🚨 **IMMEDIATE EMERGENCY MEDICAL GUIDANCE**

**Do not wait for an upcoming appointment or wait to see if this symptom passes.**

${assessment.urgentMessage || 'The symptoms described require prompt emergency clinical assessment.'}

---

### Immediate Action Recommended:
1. **Call Local Emergency Services Immediately:** Dial **112** or **108** (India) or **911** (US) right now.
2. **If you are alone:** Alert a family member, parent, teacher, or trusted neighbor immediately so they can assist you.
3. **Position Safely:** If feeling faint, sit or lie down with your legs elevated slightly to support blood flow.
4. **Emotional & Distress Helpline:** If feeling overwhelmed or frightened, call **Tele-MANAS** at **14416** (24/7 Free).

*Nutura is an educational tool and cannot provide emergency medical care. Please contact emergency professionals immediately.*`,
      helplines: assessment.resources || EMERGENCY_RESOURCES,
      suggestedQuestions: [
        'How do I prepare for my doctor visit once I am safe?',
        'What emergency numbers should I keep saved?'
      ]
    };
  }

  // SAFETY BOUNDARY NOTICE (No Rx, No Dx, No Cure, Anti-Bypass)
  if (assessment.level === SAFETY_LEVELS.BOUNDARY_NOTICE) {
    return {
      level: SAFETY_LEVELS.BOUNDARY_NOTICE,
      badge: '🛡️ Safety & Clinical Boundary Notice',
      badgeClass: 'chat-badge-boundary',
      isEmergency: false,
      requiresAction: false,
      text: `${assessment.boundaryResponse}

---

### What Nutura Can Help You With:
• **Cycle & Symptom Tracking:** Keep factual dates and pain scores to discuss with your doctor.
• **Evidence-Based Education:** Learn about menstrual biology, the Rotterdam PCOS criteria, and cycle variability.
• **Doctor Visit Preparation:** Prepare categorized questions and a printable symptom summary for your appointment.`,
      helplines: [],
      suggestedQuestions: [
        'What questions should I ask my doctor about PCOS?',
        'How can I prepare a symptom summary for my visit?',
        'Why does cycle length naturally vary?'
      ]
    };
  }

  // LEVEL 2: MEDICAL ASSESSMENT RECOMMENDED (Persistent / Worsening Symptoms)
  if (assessment.level === SAFETY_LEVELS.MEDICAL_ASSESSMENT) {
    return {
      level: SAFETY_LEVELS.MEDICAL_ASSESSMENT,
      badge: '🟡 Medical Assessment Recommended',
      badgeClass: 'chat-badge-assessment',
      isEmergency: false,
      requiresAction: true,
      text: `📋 **Medical Assessment Recommended**

${assessment.concernExplanation || 'Persistent or worsening symptoms require evaluation by a qualified medical professional.'}

Nutura cannot diagnose conditions or determine whether symptoms are related to periods, hormones, or other causes. Because symptoms that persist or worsen over time need proper clinical context, a healthcare provider (such as an adolescent medicine doctor or gynecologist) is the safest person to guide you.

---

### Recommended Next Steps:
1. **Schedule a Medical Consultation:** Make an appointment with a doctor or school clinic.
2. **Bring Your Nutura Timeline:** Open the **Doctor Visit Hub** (#/heard) to export your recorded cycle dates, pain history, and questions.
3. **Emergency Warning Signs:** If pain becomes severe and sudden, or is accompanied by fainting, fever, or heavy bleeding (soaking 1+ pad per hour), seek emergency care right away.`,
      helplines: [],
      suggestedQuestions: [
        'What questions should I prepare for my doctor?',
        'How do I track my pain patterns in Nutura?',
        'When should I schedule a doctor visit?'
      ]
    };
  }

  // LEVEL 1: MILD CONCERN / REVIEWED FAQ GUIDANCE
  if (assessment.level === SAFETY_LEVELS.MILD_CONCERN) {
    // 1. Handled by reviewed FAQ entry
    if (assessment.matchedFaq) {
      const ans = assessment.matchedFaq.answer[lang] || assessment.matchedFaq.answer.en;
      return {
        level: SAFETY_LEVELS.MILD_CONCERN,
        badge: '🟢 General Guidance (Reviewed Education)',
        badgeClass: 'chat-badge-guidance',
        isEmergency: false,
        requiresAction: false,
        text: `${ans}

---

*⚠️ **Medical Warning Signs:** General self-care is appropriate only for mild, manageable symptoms. If pain becomes severe, interferes with school/work, lasts for days, or does not improve with rest, please consult a healthcare professional.*`,
        helplines: [],
        suggestedQuestions: [
          'Why do I have period cramps?',
          'What is a normal cycle length variation?',
          'When should I see a doctor for cramps?'
        ]
      };
    }

    // 2. Handled by mild topic guidance
    if (assessment.mildTopic === 'headache') {
      return {
        level: SAFETY_LEVELS.MILD_CONCERN,
        badge: '🟢 General Self-Care Guidance',
        badgeClass: 'chat-badge-guidance',
        isEmergency: false,
        requiresAction: false,
        text: `### Mild Headache Comfort Guidance

Mild headaches around your period can occur due to shifts in hormones, slight dehydration, or lack of sleep.

**Gentle Self-Care Steps:**
• **Hydration:** Sip room-temperature water or warm herbal tea (like peppermint or chamomile).
• **Quiet Rest:** Rest in a dim, quiet room with a cool or warm cloth across your forehead.
• **Gentle Neck Release:** Roll your shoulders and gently stretch your neck to relieve tension.
• **Nourishment:** Have a light, balanced meal to stabilize blood sugar.

---

*⚠️ **When to Seek Care:** If the headache is sudden and the "worst ever felt", or lasts several days without relief, or is accompanied by vision loss, stiff neck, or fever, seek emergency medical care immediately.*`,
        helplines: [],
        suggestedQuestions: [
          'Why do headaches happen before periods?',
          'How does hydration affect period cramps?'
        ]
      };
    }

    if (assessment.mildTopic === 'stomach') {
      return {
        level: SAFETY_LEVELS.MILD_CONCERN,
        badge: '🟢 General Self-Care Guidance',
        badgeClass: 'chat-badge-guidance',
        isEmergency: false,
        requiresAction: false,
        text: `### Mild Stomach Discomfort Guidance

Mild digestive discomfort or bloating can happen before or during menstruation due to natural hormone shifts (prostaglandins and progesterone).

**Gentle Self-Care Steps:**
• **Warmth:** Place a warm water bag or heating pad on your abdomen for 15–20 minutes.
• **Warm Sips:** Sip warm ginger or fennel water to ease digestion.
• **Light Meals:** Choose warm, easily digestible foods like khichdi, soup, or steamed vegetables.
• **Avoid Triggers:** Limit carbonated drinks, excess caffeine, and very salty snacks.

---

*⚠️ **When to Seek Care:** If stomach pain becomes severe, sharp, one-sided, or is accompanied by vomiting, fever, or fainting, do not wait — seek immediate medical attention.*`,
        helplines: [],
        suggestedQuestions: [
          'What foods help soothe period bloating?',
          'How does warmth help relax uterine muscles?'
        ]
      };
    }

    if (assessment.mildTopic === 'cramps') {
      return {
        level: SAFETY_LEVELS.MILD_CONCERN,
        badge: '🟢 General Self-Care Guidance',
        badgeClass: 'chat-badge-guidance',
        isEmergency: false,
        requiresAction: false,
        text: `### Mild Cramps Self-Care Guidance

Mild cramping is caused by prostaglandins, natural chemicals that help your uterus shed its lining.

**Evidence-Informed Comfort Measures:**
• **Heat Therapy:** Applying continuous mild warmth (heating pad at ~40°C) is clinically proven to relax uterine muscles as effectively as mild pain relievers.
• **Restful Posture:** Lie on your side with your knees bent and a pillow tucked between your knees to reduce pelvic pressure.
• **Gentle Movement:** Gentle yoga stretches (such as child's pose or cat-cow) improve pelvic blood flow.
• **Hydration:** Drink plenty of warm water throughout the day.

---

*⚠️ **When to Seek Care:** If cramps prevent you from going to school, wake you up from sleep, or do not respond to rest, discuss them with a doctor. You have the right to have menstrual pain acknowledged and investigated.*`,
        helplines: [],
        suggestedQuestions: [
          'What is the peak pain day in my cycle?',
          'How do I track my pain patterns in Nutura?',
          'What questions should I ask my doctor about cramps?'
        ]
      };
    }

    if (assessment.mildTopic === 'legs') {
      return {
        level: SAFETY_LEVELS.MILD_CONCERN,
        badge: '🟢 General Self-Care Guidance',
        badgeClass: 'chat-badge-guidance',
        isEmergency: false,
        requiresAction: false,
        text: `### Period Leg & Thigh Pain Self-Care Guidance

During your period, uterine prostaglandins (the natural hormone messengers that cause uterine muscles to shed the lining) can radiate into nearby pelvic nerve pathways (the femoral and sciatic nerves), causing dull aches in your thighs, hips, and calves.

**Evidence-Informed Comfort Steps:**
• **Leg Elevation:** Lie down comfortably and prop your legs up on 2–3 pillows (or gently against a wall for 10–15 minutes) to reduce pelvic congestion and support blood flow.
• **Targeted Warmth:** Place a warm heating pad or hot water bottle across your upper thighs or lower back for 15–20 minutes.
• **Gentle Stretching:** Try gentle hamstring and calf stretches or child's pose to release tension radiating from the pelvic floor.
• **Warm Bath:** A warm shower or bath helps relax tight leg and thigh muscles.
• **Hydration & Potassium:** Sip warm water and eat potassium- and magnesium-rich foods (such as a banana or roasted seeds) to soothe muscle twitches.

---

*⚠️ **Medical Warning Signs (When to See a Doctor):** If leg pain is severe, one-sided, accompanied by visible redness, swelling, or heat in your calf (which can indicate a vascular issue), or if pain is so intense that you cannot stand or walk, please seek immediate medical evaluation.*`,
        helplines: [],
        suggestedQuestions: [
          'Why do cramps radiate into the legs or back?',
          'What exercises help relieve period leg aches?',
          'When should I see a doctor for leg pain?'
        ]
      };
    }

    if (assessment.mildTopic === 'backache') {
      return {
        level: SAFETY_LEVELS.MILD_CONCERN,
        badge: '🟢 General Self-Care Guidance',
        badgeClass: 'chat-badge-guidance',
        isEmergency: false,
        requiresAction: false,
        text: `### Period Backache Self-Care Guidance

Lower back ache during menstruation is very common. Prostaglandin contractions in the uterus can trigger muscle tension that radiates into the lower spine.

**Gentle Self-Care Steps:**
• **Heat Therapy:** Apply a warm heating pad or warm water bag to your lower back for 15–20 minutes.
• **Side Sleep with Pillow:** Sleep on your side with a firm pillow between your knees to align your hips and take pressure off your lower back.
• **Spine Stretches:** Gentle cat-cow poses, pelvic tilts, and resting in child's pose relieve spinal compression.
• **Warm Sips:** Stay hydrated with warm water or chamomile tea to prevent muscle cramping.

---

*⚠️ **Medical Warning Signs:** If back pain is accompanied by fever, pain during urination, or is so sharp that you cannot move, consult a healthcare provider promptly.*`,
        helplines: [],
        suggestedQuestions: [
          'Why does my back hurt during my period?',
          'What stretches help soothe lower back pain?'
        ]
      };
    }

    if (assessment.mildTopic === 'breasts') {
      return {
        level: SAFETY_LEVELS.MILD_CONCERN,
        badge: '🟢 General Self-Care Guidance',
        badgeClass: 'chat-badge-guidance',
        isEmergency: false,
        requiresAction: false,
        text: `### Breast Tenderness Self-Care Guidance

Breast soreness or swelling before and during periods (cyclical mastalgia) is caused by natural shifts in estrogen and progesterone, which can cause breast tissue to temporarily retain fluid.

**Gentle Self-Care Steps:**
• **Supportive Bra:** Wear a soft, supportive, non-wired cotton bra or sports bra (even while sleeping if tender).
• **Cool or Warm Compress:** Apply a cool cloth or gentle warm pack to relieve tightness.
• **Reduce Salt & Caffeine:** Cutting down on salty snacks and caffeine in the days before your period can reduce fluid retention.
• **Gentle Care:** Avoid strenuous chest workouts until sensitivity settles.

---

*⚠️ **When to Seek Care:** If you notice a localized hard lump, skin dimpling, redness, or discharge from the nipple, have it evaluated by a doctor.*`,
        helplines: [],
        suggestedQuestions: [
          'Why do breasts get tender before periods?',
          'How does salt intake affect breast swelling?'
        ]
      };
    }

    if (assessment.mildTopic === 'fatigue') {
      return {
        level: SAFETY_LEVELS.MILD_CONCERN,
        badge: '🟢 General Self-Care Guidance',
        badgeClass: 'chat-badge-guidance',
        isEmergency: false,
        requiresAction: false,
        text: `### Period Fatigue & Energy Guidance

Feeling exhausted or low on energy around your period is very common. It happens due to drops in progesterone, mild blood and iron loss, and disrupted sleep from cramps.

**Gentle Energy-Restoring Steps:**
• **Rest & Pacing:** Honor your body’s need for rest. Schedule a 20-minute power nap or an earlier bedtime.
• **Iron-Rich Snacks:** Snack on raisins, dates, roasted chana, spinach, or lentils to help replenish iron levels.
• **Hydration:** Dehydration is a major hidden cause of tiredness; drink water regularly throughout the day.
• **Light Walking:** A gentle 10-minute stroll in fresh air boosts oxygen and endorphins without exhausting you.

---

*⚠️ **When to Seek Care:** If fatigue is so overwhelming that you feel constantly faint, dizzy, pale, or short of breath, ask a doctor to check your hemoglobin and iron levels.*`,
        helplines: [],
        suggestedQuestions: [
          'What foods help boost iron during periods?',
          'Why does low hemoglobin make you feel tired?'
        ]
      };
    }
  }

  // UNCERTAINTY FALLBACK (Query outside verified knowledge base)
  return {
    level: SAFETY_LEVELS.UNCERTAINTY,
    badge: 'ℹ️ Outside Approved Medical Scope',
    badgeClass: 'chat-badge-uncertainty',
    isEmergency: false,
    requiresAction: false,
    text: `### Information Notice

I do not have verified, peer-reviewed medical guidance for that specific question in my approved offline knowledge base.

Because individual health symptoms, medication interactions, and specialized therapies require personalized clinical assessment, an accurate answer must come from a licensed healthcare provider.

---

### What You Can Do:
• Speak with a doctor, school nurse, or licensed pharmacist who can review your specific question safely.
• Prepare your questions using the **Questions to Ask the Doctor** tool in Nutura (#/heard-questions).
• If you are experiencing sudden, severe, or worsening physical symptoms, please seek prompt medical care.`,
    helplines: [],
    suggestedQuestions: [
      'What questions should I ask my doctor?',
      'How does Nutura protect my private health data?',
      'What are normal cycle length ranges?'
    ]
  };
}
