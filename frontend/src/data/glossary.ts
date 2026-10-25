import { MedicalTerm } from '../../../shared/types/index.js';

export const MEDICAL_GLOSSARY: MedicalTerm[] = [
  {
    term: 'Menstruation',
    pronunciation: 'men-stroo-AY-shun',
    simpleDefinition: 'When blood and natural tissue leave the uterus through the vagina as part of the monthly cycle.',
    detailedExplanation: 'Menstruation (commonly called having your period) happens when your body sheds the soft lining of the uterus that was prepared during the cycle. It usually lasts between 3 to 7 days.',
    category: 'cycle'
  },
  {
    term: 'Menstrual cycle',
    pronunciation: 'MEN-stroo-ul SY-kul',
    simpleDefinition: 'The repeating process of natural changes in your body that prepares it for possible future reproduction.',
    detailedExplanation: 'The menstrual cycle is counted from the very first day of one period until the first day of the next period. For teenagers, cycles typically range anywhere from 21 to 45 days.',
    category: 'cycle'
  },
  {
    term: 'Ovulation',
    pronunciation: 'ov-yoo-LAY-shun',
    simpleDefinition: 'When one of your ovaries releases a tiny egg cell about midway through your cycle.',
    detailedExplanation: 'Ovulation is an important step in the cycle. If the egg is not fertilized, the hormone levels drop and your body begins preparing to shed the uterine lining (your next period).',
    category: 'cycle'
  },
  {
    term: 'Uterus',
    pronunciation: 'YOO-ter-us',
    simpleDefinition: 'The warm, pear-shaped muscular organ inside your lower abdomen where a baby can grow.',
    detailedExplanation: 'Also known as the womb. Every month during your reproductive years, the inner lining (endometrium) thickens with blood vessels and nutrients.',
    category: 'anatomy'
  },
  {
    term: 'Cervix',
    pronunciation: 'SER-viks',
    simpleDefinition: 'The lower, donut-shaped opening of the uterus that connects it to the vagina.',
    detailedExplanation: 'The cervix has a tiny opening that allows menstrual fluid to flow out safely. It naturally widens slightly during menstruation.',
    category: 'anatomy'
  },
  {
    term: 'Vagina',
    pronunciation: 'vuh-JY-nuh',
    simpleDefinition: 'The flexible muscular canal leading from the outside of the body to the cervix.',
    detailedExplanation: 'Period blood exits through the vaginal opening. It is distinct from the urethra, which is a separate tiny opening where urine (pee) leaves your body.',
    category: 'anatomy'
  },
  {
    term: 'Hormones',
    pronunciation: 'HOR-mohns',
    simpleDefinition: 'Chemical messengers made by your body that travel through the blood to guide growth and bodily changes.',
    detailedExplanation: 'During puberty and every menstrual cycle, hormones like estrogen and progesterone help guide how you grow, how your cycle functions, and even how you feel emotionally.',
    category: 'puberty'
  },
  {
    term: 'Menstrual cramps',
    pronunciation: 'men-stroo-ul KRAMPS',
    simpleDefinition: 'Mild to moderate aching or tightening felt in the lower belly or back around period days.',
    detailedExplanation: 'Cramps are caused by gentle contractions of the uterine muscle as it helps shed its lining. Warm heat pads, gentle stretching, and rest can bring soothing relief.',
    category: 'health'
  },
  {
    term: 'Vaginal discharge',
    pronunciation: 'VA-jin-ul DIS-charj',
    simpleDefinition: 'A normal, healthy clear or whitish fluid that keeps the vagina clean, moist, and protected.',
    detailedExplanation: 'Normal discharge is your body\'s natural self-cleaning mechanism! It is completely normal to notice it on your underwear months or years before your very first period starts.',
    category: 'hygiene'
  },
  {
    term: 'Puberty',
    pronunciation: 'PYOO-ber-tee',
    simpleDefinition: 'The natural stage of life when your body transitions from childhood into young adulthood.',
    detailedExplanation: 'During puberty you will grow taller, develop body curves, grow body hair, notice skin changes, experience deeper emotions, and begin your menstrual periods.',
    category: 'puberty'
  },
  {
    term: 'Toxic Shock Syndrome (TSS)',
    pronunciation: 'TOK-sik SHOK SIN-drohm',
    simpleDefinition: 'A very rare but serious bacterial condition linked to leaving internal products like tampons in for too long.',
    detailedExplanation: 'TSS is easily prevented by practicing good hygiene: always washing hands, changing tampons every 4 to 8 hours, and using the lowest absorbency suitable for your flow.',
    category: 'health'
  }
];

export function findGlossaryTerm(termName: string): MedicalTerm | undefined {
  const clean = termName.toLowerCase().trim();
  return MEDICAL_GLOSSARY.find(item => item.term.toLowerCase() === clean);
}
