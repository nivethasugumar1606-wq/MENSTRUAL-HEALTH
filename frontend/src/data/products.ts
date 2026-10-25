export interface ProductItem {
  id: string;
  name: string;
  type: 'disposable' | 'reusable';
  category: 'external' | 'internal';
  shortIntro: string;
  imageUrl: string;
  fallbackSvgType: string;
  imageAlt: string;
  whatItIs: string;
  whatItIsUsedFor: string;
  stepByStepUse: string[];
  changeFrequency: string;
  cleaningCare?: string;
  safeDisposal: string;
  hygieneSafety: string;
  pros: string[];
  limitations: string[];
  trustedAdultAdvice?: string;
}

export const PRODUCTS_GUIDE_DATA: ProductItem[] = [
  {
    id: 'disposable-pads',
    name: 'Disposable Sanitary Pads',
    type: 'disposable',
    category: 'external',
    shortIntro: 'The most popular, beginner-friendly absorbent pad that sticks securely inside your underwear.',
    imageUrl: '/products/disposable-pads.jpg',
    fallbackSvgType: 'pad',
    imageAlt: 'Cotton disposable sanitary pads with wings folded neatly',
    whatItIs: 'A soft, rectangular cushioned pad made of absorbent cellulose layers with adhesive backing that sticks to your underwear.',
    whatItIsUsedFor: 'To catch and absorb menstrual fluid on the outside of your body during period days.',
    stepByStepUse: [
      'Unwrap the pad from its outer protective sleeve (save the sleeve for later disposal).',
      'Peel off the paper strip on the back to expose the adhesive glue.',
      'Place the sticky side down onto the center of your underwear.',
      'If your pad has wings, peel their tabs and fold them firmly underneath the sides of your underwear for extra leak protection.',
      'Pull up your underwear and ensure the pad feels centered and comfortable.'
    ],
    changeFrequency: 'Every 4 to 6 hours, or sooner if it feels damp or heavy.',
    safeDisposal: 'Roll the used pad tightly. Wrap it in toilet paper or the wrapper from your new pad. Throw it in a bathroom waste bin. NEVER flush down the toilet.',
    hygieneSafety: 'Always wash your hands before and after changing. Choose unscented pads to avoid delicate skin irritation.',
    pros: [
      'Extremely easy to use and widely available in shops and schools',
      'No internal insertion required',
      'Comes in multiple lengths (Regular, Long, Overnight)'
    ],
    limitations: [
      'Generates single-use waste',
      'Cannot be worn while swimming'
    ]
  },
  {
    id: 'reusable-cloth-pads',
    name: 'Reusable Cloth Pads',
    type: 'reusable',
    category: 'external',
    shortIntro: 'Soft, eco-friendly fabric pads that you wash and reuse for years.',
    imageUrl: '/products/reusable-cloth-pads.jpg',
    fallbackSvgType: 'cloth-pad',
    imageAlt: 'Handmade organic cotton reusable cloth menstrual pad with snap buttons',
    whatItIs: 'Pads crafted from absorbent layers of natural bamboo, fleece, or organic cotton, featuring fabric wings with snap buttons that fasten under your underwear.',
    whatItIsUsedFor: 'External period absorption for people who want an eco-friendly, ultra-gentle alternative to plastic disposables.',
    stepByStepUse: [
      'Place the patterned or soft flannel side facing up toward your body.',
      'Wrap the fabric wings around the gusset (bottom) of your underwear.',
      'Snap the plastic button securely underneath your underwear.',
      'When changed, fold the pad inward into a small square and snap closed until wash time.'
    ],
    changeFrequency: 'Every 4 to 6 hours depending on your flow.',
    cleaningCare: 'Rinse in cold water until water runs clear. Soak with a little laundry soap if needed. Wash in your washing machine on regular cycle, then air dry completely in sunlight or gentle dryer.',
    safeDisposal: 'Cloth pads last 3 to 5 years! When worn out, cotton portions can often be composted or repurposed.',
    hygieneSafety: 'Ensure pads are thoroughly dry before storing to prevent mildew. Never bleach or use heavy fabric softeners which reduce absorbency.',
    pros: [
      'Zero plastic waste and saves money over time',
      'Incredibly soft and breathable on sensitive skin',
      'Cute patterns and long-lasting'
    ],
    limitations: [
      'Requires regular washing and air-drying',
      'Need a wet-bag pouch to carry used ones when away from home'
    ]
  },
  {
    id: 'pantyliners',
    name: 'Pantyliners',
    type: 'disposable',
    category: 'external',
    shortIntro: 'Ultra-thin, light everyday pads designed for daily discharge or the very end of your period.',
    imageUrl: '/products/pantyliners.jpg',
    fallbackSvgType: 'liner',
    imageAlt: 'Ultra thin breathable pantyliners for daily discharge protection',
    whatItIs: 'A very thin, lightweight version of a sanitary pad designed for very light spotting rather than full menstrual flow.',
    whatItIsUsedFor: 'Catching normal vaginal discharge, light spotting on the last day of your period, or as backup with a tampon or menstrual cup.',
    stepByStepUse: [
      'Peel off the paper backing strip.',
      'Press firmly into the center of your underwear.',
      'Smooth down the edges.'
    ],
    changeFrequency: 'Every 4 to 6 hours to maintain freshness.',
    safeDisposal: 'Wrap in toilet paper and dispose in the waste bin. Do not flush.',
    hygieneSafety: 'Choose breathable, unperfumed cotton liners. It is also completely healthy to skip liners at night to let your skin breathe.',
    pros: [
      'Barely noticeable and super discreet',
      'Keeps underwear clean from daily discharge',
      'Great for unpredictable spotting'
    ],
    limitations: [
      'Too thin for medium or heavy period days'
    ]
  },
  {
    id: 'period-underwear',
    name: 'Period Underwear',
    type: 'reusable',
    category: 'external',
    shortIntro: 'Underwear with built-in multi-layer leakproof technology that looks and feels like regular underwear.',
    imageUrl: '/products/period-underwear.jpg',
    fallbackSvgType: 'underwear',
    imageAlt: 'Comfortable ribbed pastel lavender period underwear with organic cotton care pouch on cozy knit blanket',
    whatItIs: 'Special undergarments sewn with built-in moisture-wicking, absorbent, and waterproof barrier fabrics.',
    whatItIsUsedFor: 'Worn just like regular underwear during your period without needing a separate pad.',
    stepByStepUse: [
      'Put on the period underwear just like any regular comfy briefs.',
      'Wear throughout the school day or overnight for gentle leak-free sleep.',
      'When ready to change, switch to a fresh pair.'
    ],
    changeFrequency: 'Can be worn for 8 to 12 hours depending on the absorbency level (Light, Medium, or Heavy/Overnight).',
    cleaningCare: 'Rinse with cold water in the sink until clear. Machine wash on delicate cycle without fabric softener. Hang up to air dry.',
    safeDisposal: 'Designed to be washed and worn for several years.',
    hygieneSafety: 'Made with antimicrobial, breathable fibers that stop odors naturally.',
    pros: [
      'Zero pad shifting or rustling noise',
      'Looks and feels exactly like regular stylish underwear',
      'Fantastic for sports, dance, and sleeping'
    ],
    limitations: [
      'Higher initial purchase cost per pair',
      'Changing during school requires taking off trousers or leggings'
    ]
  },
  {
    id: 'tampons',
    name: 'Tampons',
    type: 'disposable',
    category: 'internal',
    shortIntro: 'Small cotton cylinders inserted into the vagina that absorb period fluid internally.',
    imageUrl: '/products/tampons.jpg',
    fallbackSvgType: 'tampon',
    imageAlt: 'Organic cotton tampons with smooth applicator and cord',
    whatItIs: 'A soft, compressed cylinder of pure cotton or rayon with a sturdy removal string, inserted gently into the vaginal canal.',
    whatItIsUsedFor: 'Internal absorption that allows total freedom for swimming, athletics, and active sports.',
    stepByStepUse: [
      'Wash your hands with soap and water.',
      'Sit comfortably on the toilet or stand with one foot on the edge of the toilet/bathtub.',
      'If using an applicator: hold the grip with your thumb and middle finger. Gently guide the rounded tip into your vaginal opening angled toward your lower back.',
      'Push the inner tube all the way into the outer tube until the cotton enters comfortably.',
      'Remove the plastic applicator tubes and check that the string hangs outside your body.',
      'To remove: relax your muscles and pull the string gently and steadily downward.'
    ],
    changeFrequency: 'Every 4 to 8 hours. NEVER leave a tampon in for longer than 8 hours.',
    safeDisposal: 'Wrap in toilet paper and dispose in the waste bin. NEVER flush tampons down the toilet.',
    hygieneSafety: 'IMPORTANT: To prevent Toxic Shock Syndrome (TSS), use the lowest absorbency (start with "Junior" or "Regular"), wash hands, and change regularly. Never use a tampon when you do not have your period.',
    pros: [
      'Allows swimming and high-movement sports',
      'Invisible under gym clothes or swimsuits',
      'Small and discreet to carry'
    ],
    limitations: [
      'Requires gentle practice to insert comfortably',
      'Must monitor time carefully (max 8 hours)'
    ],
    trustedAdultAdvice: 'Internal products are completely optional! If you are interested in trying tampons for swimming or sports, ask a parent, school nurse, or doctor to guide you comfortably through the steps.'
  },
  {
    id: 'menstrual-cups',
    name: 'Menstrual Cups',
    type: 'reusable',
    category: 'internal',
    shortIntro: 'A flexible, reusable medical-grade silicone bell that collects menstrual fluid.',
    imageUrl: '/products/menstrual-cups.jpg',
    fallbackSvgType: 'cup',
    imageAlt: 'Medical grade silicone menstrual cup in soft pastel purple',
    whatItIs: 'A small, flexible bell-shaped cup made from 100% hypoallergenic medical-grade silicone.',
    whatItIsUsedFor: 'Collecting (rather than absorbing) menstrual fluid internally. Can be washed and reused for up to 10 years.',
    stepByStepUse: [
      'Wash your hands thoroughly.',
      'Fold the flexible cup (e.g., C-fold or punch-down fold) into a narrow shape.',
      'Gently insert into the vaginal opening while breathing out and relaxing your muscles.',
      'Once inside, it gently opens to create a light seal against the vaginal walls.',
      'To remove: gently squeeze the base of the cup to release the seal, then slide it out, empty the fluid into the toilet, rinse with clean water, and re-insert.'
    ],
    changeFrequency: 'Can stay in for up to 10 to 12 hours before emptying.',
    cleaningCare: 'Rinse with clean water during your period. At the end of each cycle, boil the cup in water on the stove for 5 minutes to sterilize, then store in its breathable cotton pouch.',
    safeDisposal: 'Reusable for 5 to 10 years, drastically reducing waste.',
    hygieneSafety: 'Always wash hands before touching. Choose smaller "Teen" or "Size Small" models designed for young bodies.',
    pros: [
      'Holds more fluid than pads or tampons',
      'Safe for swimming and overnight sleep',
      'One cup lasts up to 10 years, saving money and the planet'
    ],
    limitations: [
      'Has a learning curve to insert and remove comfortably',
      'Requires access to clean water when emptying'
    ],
    trustedAdultAdvice: 'Menstrual cups require comfort with your anatomy. Many girls wait until older teen years or practice first with pads and tampons before trying a cup with advice from a doctor or trusted adult.'
  }
];
