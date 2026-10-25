/**
 * 30+ Medically Reviewed Multilingual Offline FAQs (English, Tamil, Hindi)
 * Runs 100% offline without sending any queries across the network.
 */

export const FAQ_DATA = [
  {
    id: 'faq-1',
    category: 'basics',
    keywords: ['what is period', 'menstruation', 'what happens', 'basics'],
    question: {
      en: 'What is a period and why does it happen?',
      ta: 'மாதவிடாய் என்றால் என்ன? அது ஏன் ஏற்படுகிறது?',
      hi: 'माहवारी (पीरियड) क्या है और यह क्यों होती है?',
    },
    answer: {
      en: 'A period is a natural, healthy sign that your reproductive system is maturing. Roughly every month, your uterus builds a soft, cushiony lining to prepare for a possible pregnancy in adulthood. When the egg is not fertilised, your body gently lets that soft lining go as a small amount of blood and tissue through the vagina.',
      ta: 'மாதவிடாய் என்பது உங்கள் உடல் ஆரோக்கியமாக வளர்ந்து பருவமடைவதன் இயற்கையான அறிகுறியாகும். உங்கள் கருப்பை ஒவ்வொரு மாதமும் ஒரு மென்மையான மெத்தையை உருவாக்குகிறது. கருமுட்டை கருத்தரிக்காத போது, அந்த மெத்தை உதிர்ந்து சிறிதளவு ரத்தமாகவும் திரவமாகவும் பிறப்புறுப்பு வழியாக வெளியேறுகிறது.',
      hi: 'माहवारी एक प्राकृतिक और स्वस्थ प्रक्रिया है जो बताती है कि आपका शरीर बड़ा हो रहा है। हर महीने गर्भाशय में एक कोमल परत बनती है। जब उस परत की जरूरत नहीं होती, तो शरीर उसे योनि के जरिए खून और तरल के रूप में बाहर निकाल देता है।',
    },
  },
  {
    id: 'faq-2',
    category: 'cramps',
    keywords: ['cramps', 'cramp', 'period pain', 'tummy ache', 'stomach hurt', 'uterine cramps'],
    question: {
      en: 'Why do I have period cramps and how can I soothe them?',
      ta: 'எனக்கு ஏன் மாதவிடாய் வயிற்று வலி வருகிறது? அதை எப்படி குறைப்பது?',
      hi: 'पीरियड्स में पेट में दर्द या ऐंठन क्यों होती है और इसे कैसे ठीक करें?',
    },
    answer: {
      en: 'Cramps happen because the muscle walls of your uterus gently squeeze to help release the lining. You can soothe them with a warm heating pad or hot water bottle on your tummy, sipping warm water or herbal tea, taking a warm shower, and resting in child’s pose.',
      ta: 'கருப்பையின் தசைகள் உதிர்ந்த மெத்தையை வெளியேற்ற லேசாக சுருங்குவதால் வயிற்று வலி ஏற்படுகிறது. வயிற்றில் வெந்நீர் ஒத்தடம் கொடுப்பது, வெதுவெதுப்பான நீர் அருந்துவது மற்றும் லேசான உடற்பயிற்சி செய்வது வலியைப் பெருமளவு குறைக்கும்.',
      hi: 'गर्भाशय की मांसपेशियां परत को बाहर निकालने के लिए सिकुड़ती हैं, जिससे दर्द होता है। पेट पर गर्म पानी की सिकाई, गुनगुना पानी पीना और आराम करने से काफी राहत मिलती है।',
    },
  },
  {
    id: 'faq-3',
    category: 'hygiene',
    keywords: ['sanitary pad', 'how to use pad', 'wear pad', 'sanitary napkin', 'pad wings'],
    question: {
      en: 'How do I use a sanitary pad and how often should I change it?',
      ta: 'சானிட்டரி நாப்கினை எவ்வாறு பயன்படுத்துவது? எத்தனை மணி நேரத்திற்கு ஒருமுறை மாற்ற வேண்டும்?',
      hi: 'सैनिटरी पैड का उपयोग कैसे करें और इसे कितनी देर में बदलना चाहिए?',
    },
    answer: {
      en: 'Peel off the paper backing, stick the pad to the center of your underwear, and fold the wings underneath. Always change your pad every 4 to 6 hours (even on light days) to stay clean and odor-free. Wrap used pads in paper and discard them in a trash bin—never flush them!',
      ta: 'நாப்கினின் பின்புற ஒட்டுத்தாளை உரித்து, உள்ளாடையில் ஒட்டி பக்க இறக்கைகளை கீழே மடித்து ஒட்டவும். 4 முதல் 6 மணி நேரத்திற்கு ஒருமுறை மாற்றுவது நல்லது. பயன்படுத்திய நாப்கினை காகிதத்தில் சுற்றி குப்பைத்தொட்டியில் போடவும். ஒருபோதும் கழிப்பறையில் போடாதீர்கள்!',
      hi: 'पैड की बैक स्ट्रिप हटाकर पैंटी के बीच में चिपकाएं और पंखों (विंग्स) को नीचे मोड़ें। हर 4 से 6 घंटे में पैड जरूर बदलें। इस्तेमाल किए पैड को कागज में लपेटकर कूड़ेदान में डालें, फ्लश न करें।',
    },
  },
  {
    id: 'faq-4',
    category: 'cycle',
    keywords: ['late period', 'irregular period', 'missed period', 'delayed period', 'skipped period'],
    question: {
      en: 'Why is my period late or irregular?',
      ta: 'எனது மாதவிடாய் ஏன் தாமதமாகிறது அல்லது சீரற்றதாக உள்ளது?',
      hi: 'मेरी माहवारी देर से क्यों आती है या अनियमित क्यों है?',
    },
    answer: {
      en: 'During the first 2 to 3 years after your first period, it is completely normal for cycles to be irregular as your hormone messengers learn to coordinate. Everyday factors like school exams, illness, sleep changes, and travel can also shift dates by several days.',
      ta: 'பருவமடைந்த முதல் 2-3 ஆண்டுகளில் ஹார்மோன்கள் சீராக ஒருங்கிணைக்க நேரம் எடுப்பதால் மாதவிடாய் சீரற்றதாக இருப்பது முற்றிலும் இயல்பானது. மன அழுத்தம், காய்ச்சல் அல்லது பயணங்களும் தேதிகளை மாற்றக்கூடும்.',
      hi: 'शुरुआती 2-3 वर्षों में हार्मोन पूरी तरह व्यवस्थित होने में समय लेते हैं, इसलिए पीरियड्स का अनियमित होना सामान्य है। तनाव, बीमारी या खान-पान में बदलाव से भी तारीखें बदल सकती हैं।',
    },
  },
  {
    id: 'faq-5',
    category: 'pcos',
    keywords: ['pcos', 'pcod', 'ovary', 'cysts', 'hormones'],
    question: {
      en: 'What is PCOS or PCOD?',
      ta: 'PCOS அல்லது PCOD என்றால் என்ன?',
      hi: 'PCOS या PCOD क्या है?',
    },
    answer: {
      en: 'PCOS (Polycystic Ovary Syndrome) is a common hormonal imbalance where the ovaries produce slightly more androgen hormones. For teenagers, irregular periods alone DO NOT mean you have PCOS, because teenage cycles naturally fluctuate. A healthy diet, regular movement, and a doctor’s guidance keep it well managed.',
      ta: 'PCOS என்பது ஹார்மோன் சமநிலையின்மையால் ஏற்படும் ஒரு பொதுவான நிலையாகும். ஆனால் இளம் வயதினருக்கு மாதவிடாய் தாமதமானால் மட்டுமே PCOS என்று அர்த்தமல்ல. சத்தான உணவு மற்றும் உடற்பயிற்சி மூலமாக இதை எளிதாக நிர்வகிக்கலாம்.',
      hi: 'PCOS एक सामान्य हार्मोनल स्थिति है। किशोरियों में केवल अनियमित पीरियड्स होने का मतलब PCOS नहीं होता, क्योंकि शुरुआती वर्षों में यह स्वाभाविक है। अच्छा खानपान और डॉक्टर की सलाह से यह आसानी से ठीक रहता है।',
    },
  },
  {
    id: 'faq-6',
    category: 'blood',
    keywords: ['brown blood', 'color', 'black blood', 'red', 'dark'],
    question: {
      en: 'Why is my period blood brown or dark at the beginning or end?',
      ta: 'மாதவிடாய் தொடக்கத்திலோ இறுதியிலோ ரத்தம் பழுப்பு நிறமாக இருப்பது ஏன்?',
      hi: 'माहवारी की शुरुआत या अंत में खून भूरा या गहरा क्यों होता है?',
    },
    answer: {
      en: 'Brown or dark blood is simply blood that took a little longer to exit the body. When blood reacts with oxygen in the air (a process called oxidation), it turns from bright red to brown. It is completely normal and healthy!',
      ta: 'பழுப்பு அல்லது கருஞ்சிவப்பு ரத்தம் என்பது பழைய ரத்தமாகும். அது மெதுவாக வெளியேறும் போது காற்றில் உள்ள ஆக்ஸிஜனுடன் வினைபுரிந்து பழுப்பு நிறமாக மாறுகிறது. இது முற்றிலும் இயல்பானதே!',
      hi: 'भूरा खून वह खून होता है जो शरीर से थोड़ा देर से निकलता है। हवा के संपर्क में आने से खून का रंग लाल से भूरा हो जाता है। यह पूरी तरह सामान्य है।',
    },
  },
  {
    id: 'faq-7',
    category: 'hygiene',
    keywords: ['bath', 'shower', 'wash', 'hair wash', 'water'],
    question: {
      en: 'Can I take a bath or wash my hair during my period?',
      ta: 'மாதவிடாய் நாட்களில் குளிக்கலாமா அல்லது தலைக்குக் குளிக்கலாமா?',
      hi: 'क्या पीरियड्स के दौरान नहाना या बाल धोना सुरक्षित है?',
    },
    answer: {
      en: 'YES, absolutely! Taking a warm bath or shower is wonderful during your period. Warm water relaxes crampy muscles, cleans your body, and helps you feel refreshed and cozy.',
      ta: 'நிச்சயமாக குளிக்கலாம்! வெதுவெதுப்பான நீரில் குளிப்பது உங்கள் வயிற்றுத் தசைகளைத் தளர்த்தி வலியைப் போக்கும், உங்களை புத்துணர்ச்சியுடன் வைத்திருக்க உதவும்.',
      hi: 'हाँ, बिल्कुल! गर्म पानी से नहाना पीरियड्स के दिनों में बहुत आरामदायक होता है। यह दर्द से राहत देता है और आपको तरोताजा रखता है।',
    },
  },
  {
    id: 'faq-8',
    category: 'sports',
    keywords: ['sports', 'exercise', 'swimming', 'run', 'gym'],
    question: {
      en: 'Can I play sports, run, or exercise during my period?',
      ta: 'மாதவிடாய் காலத்தில் விளையாடலாமா அல்லது உடற்பயிற்சி செய்யலாமா?',
      hi: 'क्या पीरियड्स में खेलकूद या व्यायाम कर सकते हैं?',
    },
    answer: {
      en: 'Yes! Physical exercise actually releases endorphins (your body’s natural feel-good chemicals), which reduce cramps and lift your mood. Listen to your body and take gentle breaks if you feel tired.',
      ta: 'தாராளமாக விளையாடலாம்! உடற்பயிற்சி உடலின் இயற்கையான வலி நிவாரணிகளை (எண்டார்பின்) சுரக்கச் செய்து வயிற்று வலியைக் குறைக்கும். சோர்வாக இருந்தால் சற்று ஓய்வெடுங்கள்.',
      hi: 'हाँ! खेलकूद और हल्की कसरत से शरीर में एंडोर्फिन रिलीज होता है जिससे दर्द कम होता है और मूड अच्छा रहता है। थकान लगे तो थोड़ा आराम करें।',
    },
  },
  {
    id: 'faq-9',
    category: 'discharge',
    keywords: ['discharge', 'white fluid', 'underwear wet', 'mucus'],
    question: {
      en: 'What is white discharge and is it normal?',
      ta: 'வெள்ளைப்படுதல் என்றால் என்ன? அது இயல்பானதா?',
      hi: 'सफेद स्राव (White Discharge) क्या है और क्या यह सामान्य है?',
    },
    answer: {
      en: 'Clear or whitish, odorless discharge is your body’s natural self-cleaning fluid. It keeps your vagina moist and healthy. If discharge ever smells foul, turns green/yellow, or causes intense itching, tell a doctor.',
      ta: 'துர்நாற்றமில்லாத வெள்ளை அல்லது நிறமற்ற திரவம் என்பது பெண்ணுறுப்பின் இயற்கையான சுய-சுத்திகரிப்பு திரவமாகும். இது ஆரோக்கியமானது. ஆனால் அரிப்போ அல்லது துர்நாற்றமோ இருந்தால் மருத்துவரிடம் ஆலோசிக்கவும்.',
      hi: 'बिना गंध वाला सफेद या पारदर्शी स्राव पूरी तरह सामान्य और स्वस्थ है। यह शरीर की सफाई करता है। यदि इसमें बदबू या खुजली हो, तो डॉक्टर को दिखाएं।',
    },
  },
  {
    id: 'faq-10',
    category: 'school',
    keywords: ['school', 'leak', 'accident', 'stain', 'embarrassed'],
    question: {
      en: 'What should I do if my period leaks onto my clothes at school?',
      ta: 'பள்ளியில் இருக்கும் போது ஆடையில் கறை படிந்துவிட்டால் என்ன செய்வது?',
      hi: 'अगर स्कूल में कपड़ों पर दाग लग जाए तो क्या करें?',
    },
    answer: {
      en: 'First, remember: Every woman and girl has had a leak at some point! It happens to everyone. Tie a sweater or jacket around your waist, visit the school nurse or a female teacher for a spare pad or change of clothes, and wash the fabric with cold water.',
      ta: 'பயப்படாதீர்கள்! இது எல்லா பெண்களுக்கும் ஏதோ ஒரு சமயத்தில் நடக்கும் இயல்பான விஷயம். உங்கள் ஸ்வெட்டரை இடுப்பில் கட்டிக்கொள்ளுங்கள், பள்ளி செவிலியர் அல்லது ஆசிரியையிடம் உதவி கேளுங்கள். கறையை குளிர்ந்த நீரால் கழுவவும்.',
      hi: 'घबराएं नहीं, यह हर लड़की के साथ कभी न कभी होता है! अपनी कमर पर स्वेटर या जैकेट बांध लें, स्कूल नर्स या शिक्षिका से मदद लें और कपड़े को ठंडे पानी से धोएं।',
    },
  },
  {
    id: 'faq-11',
    category: 'doctor',
    keywords: ['when to see doctor', 'see a doctor', 'consult doctor', 'visit gynecologist', 'doctor appointment'],
    question: {
      en: 'When should I see a doctor about my period?',
      ta: 'மாதவிடாய் தொடர்பாக எப்போது மருத்துவரை அணுக வேண்டும்?',
      hi: 'पीरियड्स के बारे में डॉक्टर से कब मिलना चाहिए?',
    },
    answer: {
      en: 'Consult a doctor if: you soak through a pad every 1–2 hours, your period lasts more than 7 days, your cramps stop you from attending school, you feel dizzy or faint, or you are 15+ years old and have not started your first period yet.',
      ta: '1-2 மணி நேரத்திற்கு ஒருமுறை நாப்கின் முழுமையாக நனைந்தால், ரத்தப்போக்கு 7 நாட்களுக்கு மேல் நீடித்தால், கடுமையான வலியால் பள்ளிக்குச் செல்ல முடியாவிட்டால் அல்லது 15 வயதாகியும் முதல் மாதவிடாய் தொடங்கவில்லை என்றால் மருத்துவரை அணுகவும்.',
      hi: 'यदि पैड 1-2 घंटे में पूरी तरह भीग जाए, ब्लीडिंग 7 दिन से ज्यादा चले, दर्द बहुत ज्यादा हो, चक्कर आएं या 15 वर्ष की उम्र तक पहला पीरियड न आया हो, तो डॉक्टर को दिखाएं।',
    },
  },
  {
    id: 'faq-12',
    category: 'myths',
    keywords: ['pickle', 'spoil', 'kitchen', 'touch', 'myth'],
    question: {
      en: 'Can touching pickles, plants, or entering kitchens spoil anything?',
      ta: 'ஊறுகாய் தொடுவதாலோ அல்லது சமையலறைக்குச் செல்வதாலோ பொருட்கள் கெட்டுப்போகுமா?',
      hi: 'क्या अचार छूने या रसोई में जाने से चीजें खराब हो जाती हैं?',
    },
    answer: {
      en: 'NO! That is a pure myth with zero scientific basis. Period blood is just a natural body fluid. You do not spoil food, plants, or anything you touch. You can cook, hug loved ones, and live freely!',
      ta: 'முற்றிலும் தவறு! இது ஒரு மூடநம்பிக்கை மட்டுமே. மாதவிடாய் என்பது உடலின் இயற்கை செயல்பாடு. நீங்கள் தொடுவதால் எந்தப் பொருளும் கெட்டுப்போகாது. நீங்கள் தாராளமாக சமைக்கலாம், அனைவருடனும் பழகலாம்!',
      hi: 'बिल्कुल नहीं! यह केवल एक अंधविश्वास है। पीरियड का खून कोई अशुद्ध चीज नहीं है। आपके छूने से कोई चीज खराब नहीं होती। आप सामान्य रूप से सब काम कर सकती हैं।',
    },
  },
  {
    id: 'faq-13',
    category: 'emotions',
    keywords: ['moody', 'crying', 'sad', 'angry', 'pms'],
    question: {
      en: 'Why do I feel so moody, emotional, or tearful before my period?',
      ta: 'மாதவிடாய்க்கு முன் ஏன் அதிக கோபம், அழுகை அல்லது மனமாற்றம் ஏற்படுகிறது?',
      hi: 'पीरियड्स से पहले बहुत ज्यादा रोना, गुस्सा या चिड़चिड़ापन क्यों आता है?',
    },
    answer: {
      en: 'This is called PMS (Premenstrual Syndrome). Just before your period, your body’s levels of estrogen and progesterone drop. This temporary hormonal shift impacts serotonin (the happiness chemical in your brain), making you more sensitive. Be gentle with yourself—it passes once your period begins!',
      ta: 'இது PMS (மாதவிடாய் முன் அறிகுறி) என அழைக்கப்படுகிறது. மாதவிடாய்க்கு முன் ஹார்மோன் அளவுகள் மாறுவதால் மூளையின் மகிழ்ச்சி வேதிப்பொருட்களில் தற்காலிக மாற்றம் ஏற்படுகிறது. இது இயல்பானது, சில நாட்களில் சரியாகிவிடும்.',
      hi: 'इसे PMS कहते हैं। पीरियड्स से ठीक पहले हार्मोन्स में बदलाव आने के कारण दिमाग में सेरोटोनिन का स्तर बदलता है, जिससे भावनाएं संवेदनशील हो जाती हैं। यह पूरी तरह सामान्य है।',
    },
  },
  {
    id: 'faq-14',
    category: 'privacy',
    keywords: ['privacy', 'mimi safe', 'who sees', 'encrypted', 'secure'],
    question: {
      en: 'How does Mimi keep my health diary and questions safe and private?',
      ta: 'மிமி எனது குறிப்புகளையும் கேள்விகளையும் எவ்வாறு ரகசியமாகப் பாதுகாக்கிறது?',
      hi: 'मीमी मेरी डायरी और सवालों को कैसे सुरक्षित और गुप्त रखती है?',
    },
    answer: {
      en: 'Mimi uses a local-first design. All your health records, cycles, and notes are stored inside your browser on this device. We don’t require an account or email, we never sell your data, we have zero third-party trackers, and Enhanced Privacy uses AES-256-GCM encryption!',
      ta: 'மிமி உங்கள் தகவல்களை இந்த சாதனத்திலேயே சேமிக்கிறது. கணக்கு அல்லது மின்னஞ்சல் தேவையில்லை. விளம்பரங்களோ அல்லது கண்காணிப்பாளர்களோ இல்லை. மேம்பட்ட பாதுகாப்பில் AES-256-GCM குறியாக்கம் பயன்படுத்தப்படுகிறது.',
      hi: 'मीमी आपकी सारी जानकारी केवल आपके फोन में सुरक्षित रखती है। कोई लॉगिन या ईमेल जरूरी नहीं है, कोई विज्ञापन नहीं हैं, और उन्नत एन्क्रिप्शन (AES-256-GCM) का उपयोग किया जाता है।',
    },
  },
  {
    id: 'faq-15',
    category: 'diet',
    keywords: ['food', 'what to eat', 'diet', 'cold water', 'fruits'],
    question: {
      en: 'What foods help me feel best during my period?',
      ta: 'மாதவிடாய் காலத்தில் என்ன உணவுகள் சாப்பிடுவது உடலுக்கு நல்லது?',
      hi: 'पीरियड्स के दिनों में क्या खाना सेहत के लिए सबसे अच्छा है?',
    },
    answer: {
      en: 'Eat iron-rich foods (spinach, lentils, dates, jaggery, beetroot) to replenish your blood. Magnesium-rich foods like nuts, bananas, and a piece of dark chocolate ease cramps. Drink plenty of water and avoid excessive salty chips which cause bloating.',
      ta: 'இரும்புச்சத்து நிறைந்த உணவுகள் (கீரை, பருப்பு, பேரீச்சம்பழம், வெல்லம், பீட்ரூட்) ரத்த இழப்பை ஈடுசெய்யும். நட்ஸ் மற்றும் வாழைப்பழம் தசைப்பிடிப்பைக் குறைக்கும். போதுமான தண்ணீர் குடிக்கவும்.',
      hi: 'आयरन से भरपूर चीजें (पालक, दालें, खजूर, गुड़, चुकंदर) खाएं। बादाम, केले और थोड़ा डार्क चॉकलेट दर्द कम करने में मदद करते हैं। खूब पानी पिएं।',
    },
  },
  {
    id: 'faq-16',
    category: 'basics',
    keywords: ['how much blood', 'blood loss', 'tablespoons', 'amount'],
    question: {
      en: 'How much blood do I lose during a normal period?',
      ta: 'ஒரு மாதவிடாய் காலத்தில் எவ்வளவு ரத்தம் வெளியேறுகிறது?',
      hi: 'एक सामान्य पीरियड में कितना खून निकलता है?',
    },
    answer: {
      en: 'Only about 2 to 3 tablespoons (around 30 to 50 milliliters) over the entire 3 to 7 days! It looks like more because it mixes with natural cervical fluids and uterine tissue.',
      ta: 'முழு மாதவிடாய் நாட்களிலும் சுமார் 2 முதல் 3 தேக்கரண்டி (30 முதல் 50 மிலி) ரத்தம் மட்டுமே வெளியேறுகிறது. மற்ற திரவங்களுடன் கலந்து வருவதால் அதிகமாகத் தெரிகிறது.',
      hi: 'पूरे 3 से 7 दिनों में केवल लगभग 2 से 3 बड़े चम्मच (30 से 50 मिली) खून ही निकलता है। यह अन्य शारीरिक द्रवों के साथ मिलकर ज्यादा दिखता है।',
    },
  },
  {
    id: 'faq-17',
    category: 'basics',
    keywords: ['dirty', 'impure', 'is period blood dirty', 'clean'],
    question: {
      en: 'Is period blood dirty, toxic, or impure?',
      ta: 'மாதவிடாய் ரத்தம் அழுக்கானதா அல்லது தீட்டானதுதானா?',
      hi: 'क्या माहवारी का खून गंदा या अशुद्ध होता है?',
    },
    answer: {
      en: 'NO! Period fluid is completely clean and natural. It is the very same blood that flows through your veins, mixed with the healthy nutrient-rich tissue that was prepared to cradle new life. It is not poisonous or dirty.',
      ta: 'இல்லை! மாதவிடாய் ரத்தம் அழுக்கானதோ அல்லது அசுத்தமானதோ அல்ல. இது உடலின் நரம்புகளில் ஓடும் அதே சுத்தமான ரத்தமும் மென்மையான திசுக்களுமே ஆகும்.',
      hi: 'बिल्कुल नहीं! पीरियड का खून गंदा या अशुद्ध नहीं होता। यह वही सामान्य खून और ऊतक हैं जो आपके शरीर के अंदर होते हैं।',
    },
  },
  {
    id: 'faq-18',
    category: 'comfort',
    keywords: ['talk to dad', 'talk to parents', 'how to tell', 'tell mom'],
    question: {
      en: 'How do I tell my mom, dad, or guardian about my first period?',
      ta: 'எனது முதல் மாதவிடாய் பற்றி எனது அம்மா அல்லது அப்பாவிடம் எப்படி கூறுவது?',
      hi: 'अपने पहले पीरियड के बारे में मम्मी या पापा को कैसे बताएं?',
    },
    answer: {
      en: 'You can say: "Mom/Dad, I think I just got my first period. Could you help me with pads?" Parents love you and expect this milestone! They will be supportive, caring, and ready to help you with supplies and warm hugs.',
      ta: '"அம்மா/அப்பா, எனக்கு முதல் மாதவிடாய் தொடங்கியுள்ளது. எனக்கு நாப்கின் தந்து உதவ முடியுமா?" என்று நீங்கள் நேரடியாகக் கேட்கலாம். பெற்றோர் உங்களுக்கு உதவ எப்போதும் தயாராக இருப்பார்கள்.',
      hi: 'आप सीधे कह सकती हैं: "मम्मी/पापा, लगता है मेरा पहला पीरियड शुरू हो गया है, मुझे पैड की जरूरत है।" वे आपसे बहुत प्यार करते हैं और आपकी पूरी मदद करेंगे।',
    },
  },
  {
    id: 'faq-19',
    category: 'kit',
    keywords: ['kit', 'bag', 'school backpack', 'pack'],
    question: {
      en: 'What should I pack in my school bag for period emergencies?',
      ta: 'பள்ளிப் பையில் அவசரத்திற்கு என்னென்ன பொருட்கள் வைத்திருக்க வேண்டும்?',
      hi: 'स्कूल बैग में पीरियड के लिए क्या-क्या सामान रखना चाहिए?',
    },
    answer: {
      en: 'Keep a small cute pouch with: 2–3 sanitary pads, a spare pair of underwear, a few tissues or gentle wipes, and a small plastic bag for sealed disposal. You can also carry a water bottle and a small snack.',
      ta: 'ஒரு சிறிய பையில்: 2-3 நாப்கின்கள், ஒரு கூடுதல் உள்ளாடை, மென்மையான வைப்ஸ் மற்றும் கழிவுப் பை ஆகியவற்றை வைத்துக்கொள்வது எந்த நேரத்திலும் மன அமைதியைத் தரும்.',
      hi: 'एक छोटे पाउच में: 2-3 सैनिटरी पैड, एक अतिरिक्त पैंटी, टिशू या वाइप्स रखें। इससे आप स्कूल में पूरी तरह निश्चिंत रहेंगी।',
    },
  },
  {
    id: 'faq-20',
    category: 'hygiene',
    keywords: ['tampon', 'cup', 'pads vs cups', 'menstrual cup'],
    question: {
      en: 'Can beginners use tampons or menstrual cups?',
      ta: 'புதிதாக பருவமடைந்தவர்கள் டம்பான் அல்லது மாதவிடாய் கோப்பைகளைப் பயன்படுத்தலாமா?',
      hi: 'क्या शुरुआत में टैम्पोन या मेंस्ट्रुअल कप इस्तेमाल कर सकते हैं?',
    },
    answer: {
      en: 'Most beginners start with sanitary pads because they are external, easy to place, and very comfortable. Tampons and menstrual cups are inserted internally; as you get older and more familiar with your anatomy, you can try them if you wish!',
      ta: 'புதிதாகத் தொடங்குபவர்களுக்கு நாப்கின்களே எளிதானதும் பாதுகாப்பானதும் ஆகும். நீங்கள் வளர வளர உங்கள் விருப்பப்படி டம்பான் அல்லது கப்புகளைப் பற்றி அறிந்து பயன்படுத்தலாம்.',
      hi: 'शुरुआत में सैनिटरी पैड सबसे आसान और आरामदायक होते हैं। जब आप थोड़ी बड़ी हो जाएं और सहज महसूस करें, तब आप टैम्पोन या मेंस्ट्रुअल कप भी आजमा सकती हैं।',
    },
  },
  {
    id: 'faq-21',
    category: 'basics',
    keywords: ['age', 'when does it start', 'how old', 'am I late', '14 years old'],
    question: {
      en: 'What if I am 14 and haven’t started my period yet?',
      ta: 'எனக்கு 14 வயதாகியும் இன்னும் மாதவிடாய் தொடங்கவில்லை என்றால் என்ன செய்வது?',
      hi: 'अगर 14 साल की उम्र तक पीरियड शुरू न हुआ हो तो क्या करें?',
    },
    answer: {
      en: 'It is very common! Periods normally begin anywhere between ages 10 and 15. If other puberty signs (like breast development and growth spurts) are happening, your body is right on track. If you reach 15 or 16 without a period, a gentle visit to a doctor is recommended just to check.',
      ta: 'இது மிகவும் பொதுவானது! 10 முதல் 15 வயது வரை எப்போது வேண்டுமானாலும் தொடங்கலாம். மற்ற உடல் மாற்றங்கள் நிகழ்ந்தால் உங்கள் உடல் சரியான பாதையிலேயே உள்ளது. 15 வயதிற்குப் பிறகும் வரவில்லை என்றால் மருத்துவரிடம் ஆலோசனை பெறலாம்.',
      hi: 'यह बिल्कुल सामान्य है! 10 से 15 साल के बीच कभी भी पीरियड्स शुरू हो सकते हैं। अगर स्तन विकास आदि हो रहा है, तो चिंता की कोई बात नहीं है। 15-16 साल तक न आए तो डॉक्टर को दिखाएं।',
    },
  },
  {
    id: 'faq-22',
    category: 'comfort',
    keywords: ['sleep', 'leaks at night', 'bed', 'sheet'],
    question: {
      en: 'How can I avoid leaks while sleeping at night?',
      ta: 'இரவில் தூங்கும் போது படுக்கையில் கறை படுவதை எப்படி தடுப்பது?',
      hi: 'रात को सोते समय दाग लगने से कैसे बचें?',
    },
    answer: {
      en: 'Use an "overnight" or "extra-long" pad with wide wings before going to bed. You can place a soft dark towel over your bedsheet for extra peace of mind. Sleeping on your side in a fetal position also reduces pressure on abdominal muscles.',
      ta: 'இரவில் தூங்கும் முன் நீண்ட "Overnight" நாப்கினைப் பயன்படுத்தவும். கூடுதல் மன அமைதிக்கு படுக்கையின் மீது ஒரு மென்மையான துண்டை விரித்துப் படுக்கலாம்.',
      hi: 'सोने से पहले लंबे "ओवरनाइट" पैड का इस्तेमाल करें। बेडशीट पर एक डार्क तौलिया बिछा सकती हैं ताकि बिस्तर खराब न हो।',
    },
  },
  {
    id: 'faq-23',
    category: 'hygiene',
    keywords: ['smell', 'odor', 'scent', 'perfume'],
    question: {
      en: 'Why is there a scent and should I use perfumed sprays?',
      ta: 'லேசான வாசனை வருவது ஏன்? வாசனை திரவியங்களைப் பயன்படுத்தலாமா?',
      hi: 'क्या पीरियड्स में खुशबूदार स्प्रे या डियोड्रेंट का इस्तेमाल करना चाहिए?',
    },
    answer: {
      en: 'A mild, metallic scent is completely normal because period fluid contains iron and natural fluids. DO NOT use scented sprays, perfumes, or deodorants in your private area—they cause allergic reactions and irritation! Clean warm water and regular pad changes are all you need.',
      ta: 'லேசான வாசனை வருவது இயற்கையானதே. பெண்ணுறுப்பு பகுதியில் வாசனை ஸ்பிரேக்களை ஒருபோதும் பயன்படுத்தாதீர்கள்; அவை எரிச்சலை உண்டாக்கும். வெதுவெதுப்பான நீரும் வழக்கமான நாப்கின் மாற்றமுமே போதுமானது.',
      hi: 'हल्की सी गंध होना सामान्य है। कभी भी प्राइवेट पार्ट पर परफ्यूम या खुशबूदार स्प्रे न लगाएं, इससे एलर्जी हो सकती है। सादा पानी और समय पर पैड बदलना ही सबसे अच्छा है।',
    },
  },
  {
    id: 'faq-24',
    category: 'cycle',
    keywords: ['ovulation', 'egg', 'fertile', 'middle of cycle'],
    question: {
      en: 'What is ovulation?',
      ta: 'கருமுட்டை வெளியேற்றம் (Ovulation) என்றால் என்ன?',
      hi: 'ओव्यूलेशन (Ovulation) क्या है?',
    },
    answer: {
      en: 'Ovulation is when one of your ovaries gently releases a tiny egg into the fallopian tube, usually around the middle of your menstrual cycle (roughly day 14 of a 28-day cycle). If the egg is not fertilised, it dissolves naturally and your period arrives about two weeks later.',
      ta: 'மாதவிடாய் சுழற்சியின் நடுப்பகுதியில் (சுமார் 14-வது நாள்) சினைப்பையிலிருந்து ஒரு சிறிய கருமுட்டை வெளியேறும் நிகழ்வே ஓவுலேஷன் ஆகும்.',
      hi: 'ओव्यूलेशन वह समय है जब अंडाशय से एक नन्हा अंडा निकलता है। यह आमतौर पर चक्र के बीच में (लगभग 14वें दिन) होता है।',
    },
  },
  {
    id: 'faq-25',
    category: 'basics',
    keywords: ['can i swim', 'swimming pool', 'beach'],
    question: {
      en: 'Can I go swimming during my period?',
      ta: 'மாதவிடாய் நாட்களில் நீச்சல் குளத்தில் நீந்தலாமா?',
      hi: 'क्या पीरियड्स के दौरान स्विमिंग कर सकते हैं?',
    },
    answer: {
      en: 'Yes, but sanitary pads absorb pool water and won’t work in water! If you want to swim, older teens use a tampon or a menstrual cup. If you only use pads, it is best to relax by the poolside and enjoy swimming once your period ends.',
      ta: 'நீந்தலாம், ஆனால் நாப்கின்கள் தண்ணீரை உறிஞ்சிவிடும் என்பதால் தண்ணீரில் பயன்படாது. அதற்கு டம்பான் அல்லது கப் தேவைப்படும். நாப்கின் மட்டுமே பயன்படுத்துபவர்கள் நீச்சலை சில நாட்கள் தவிர்க்கலாம்.',
      hi: 'हाँ, लेकिन पैड पानी सोख लेते हैं इसलिए वे स्विमिंग में काम नहीं आते। इसके लिए टैम्पोन या कप की जरूरत होती है।',
    },
  },
  {
    id: 'faq-26',
    category: 'cramps',
    keywords: ['backache and headache', 'why back hurts', 'period symptoms combination'],
    question: {
      en: 'Why do I also get backaches or headaches with my period?',
      ta: 'மாதவிடாய் காலத்தில் முதுகு வலியோ அல்லது தலைவலியோ வருவது ஏன்?',
      hi: 'पीरियड्स में कमर दर्द या सिरदर्द क्यों होता है?',
    },
    answer: {
      en: 'Prostaglandins (the natural chemicals that make the uterus squeeze) can also cause nearby lower-back muscles to ache. Sudden shifts in estrogen can also cause mild tension headaches. Rest, warm baths, and drinking water help soothe them.',
      ta: 'புரோஸ்டாக்ளான்டின் என்ற வேதிப்பொருள் கருப்பையை சுருங்கச் செய்யும் போது முதுகுத் தசைகளிலும் லேசான வலியை உண்டாக்குகிறது. நீர் அருந்துவதும் ஓய்வும் இதற்கு உதவும்.',
      hi: 'प्रोस्टाग्लैंडिंस नामक प्राकृतिक रसायनों के कारण कमर की मांसपेशियों में भी दर्द हो सकता है। पानी पीने और आराम करने से राहत मिलती है।',
    },
  },
  {
    id: 'faq-27',
    category: 'basics',
    keywords: ['safety', 'help', 'emergency', 'talk to someone'],
    question: {
      en: 'Who can I talk to if I am scared, hurt, or in danger?',
      ta: 'நான் பயமாகவோ அல்லது ஆபத்திலோ இருந்தால் யாரிடம் பேச வேண்டும்?',
      hi: 'अगर मुझे डर लग रहा हो या मैं खतरे में हूँ तो किससे बात करूँ?',
    },
    answer: {
      en: 'You are never alone! Reach out immediately to a trusted adult, school nurse, teacher, or counselor. You can also call free confidential 24/7 child support: Childline 1098, Emergency 112, or Women Helpline 1091 (in India). They are always ready to protect you.',
      ta: 'நீங்கள் தனிமையில் இல்லை! உடனடியாக ஒரு ஆசிரியர், பள்ளி செவிலியர் அல்லது நம்பிக்கையான பெரியவரிடம் பேசுங்கள். இலவச குழந்தைகள் உதவி எண் 1098 அல்லது அவசர எண் 112 ஐ அழைக்கலாம்.',
      hi: 'आप अकेली नहीं हैं! तुरंत किसी शिक्षक, स्कूल नर्स या भरोसेमंद बड़े से बात करें। आप मुफ्त हेल्पलाइन चाइल्डलाइन 1098 या 112 पर भी फोन कर सकती हैं।',
    },
  },
  {
    id: 'faq-28',
    category: 'diet',
    keywords: ['ice cream', 'cold water', 'sour food', 'lemon'],
    question: {
      en: 'Can I eat ice cream or cold foods during my period?',
      ta: 'மாதவிடாய் நாட்களில் ஐஸ்கிரீம் அல்லது குளிர்ந்த உணவுகளை சாப்பிடலாமா?',
      hi: 'क्या पीरियड्स में आइसक्रीम या ठंडी चीजें खा सकते हैं?',
    },
    answer: {
      en: 'Yes! Eating ice cream or cold food does not harm your period flow or freeze your blood. While warm drinks can feel cozier on cramps, a scoop of your favorite ice cream is a sweet treat that can lift your spirits.',
      ta: 'தாராளமாக சாப்பிடலாம்! குளிர்ந்த உணவுகள் ரத்தப்போக்கை பாதிக்காது. வெதுவெதுப்பான பானங்கள் வயிற்றுக்கு இதமாக இருக்கும் என்றாலும் ஐஸ்கிரீம் சாப்பிடுவதில் தவறில்லை.',
      hi: 'हाँ! ठंडी चीजें खाने से पीरियड्स पर कोई बुरा असर नहीं पड़ता। गर्म चीजें पेट को आराम देती हैं, लेकिन आइसक्रीम खाना भी पूरी तरह सुरक्षित है।',
    },
  },
  {
    id: 'faq-29',
    category: 'basics',
    keywords: ['stop period', 'how to stop period', 'pause period', 'delay period', 'can i stop my period'],
    question: {
      en: 'Can I stop or pause my period once it starts?',
      ta: 'மாதவிடாய் தொடங்கிய பிறகு அதை தற்காலிகமாக நிறுத்த முடியுமா?',
      hi: 'क्या एक बार शुरू होने के बाद पीरियड को रोका जा सकता है?',
    },
    answer: {
      en: 'No, once the lining begins shedding, your body must naturally complete the process over 3 to 7 days. Trying home remedies to suddenly stop a period is neither safe nor necessary. Let your body flow smoothly!',
      ta: 'இல்லை, ஒருமுறை தொடங்கியவுடன் உடல் இயற்கையாக 3 முதல் 7 நாட்களில் அதை முடிக்கும். அதைத் தடுக்க எந்த வீட்டு மருந்துகளையும் எடுக்கக் கூடாது.',
      hi: 'नहीं, एक बार शुरू होने के बाद यह 3 से 7 दिनों में अपने आप पूरा होता है। इसे रोकने की कोशिश करना सुरक्षित नहीं है।',
    },
  },
  {
    id: 'faq-30',
    category: 'basics',
    keywords: ['friends', 'compare', 'heavy vs light', 'everyone same'],
    question: {
      en: 'Why is my period different from my friend’s period?',
      ta: 'எனது மாதவிடாய் எனது தோழியின் மாதவிடாயிலிருந்து ஏன் வேறுபடுகிறது?',
      hi: 'मेरी माहवारी मेरी सहेली से अलग क्यों है?',
    },
    answer: {
      en: 'Every single person has a unique genetic makeup and body rhythm! Some girls have 3-day periods, others have 6-day periods. Some have light flow, others heavier. As long as your symptoms are manageable, your unique pattern is healthy for you.',
      ta: 'ஒவ்வொருவரின் உடலமைப்பும் தனித்துவமானது! சிலருக்கு 3 நாட்கள், சிலருக்கு 6 நாட்கள் நீடிக்கலாம். உங்கள் தனிப்பட்ட முறை உங்களுக்கு முற்றிலும் ஆரோக்கியமானதே.',
      hi: 'हर किसी का शरीर अलग होता है! किसी को 3 दिन तो किसी को 6 दिन ब्लीडिंग होती है। जब तक आप स्वस्थ महसूस कर रही हैं, आपका चक्र आपके लिए बिल्कुल सही है।',
    },
  },
  {
    id: 'faq-31',
    category: 'symptoms',
    keywords: ['headache', 'head ache', 'how to stop headache', 'migraine', 'head hurts', 'headache relief'],
    question: {
      en: 'How can I relieve or soothe a period headache?',
      ta: 'மாதவிடாய் தலைவலியை எவ்வாறு தணிப்பது?',
      hi: 'पीरियड के दौरान सिरदर्द को कैसे ठीक या कम करें?',
    },
    answer: {
      en: 'Period headaches are often triggered by dropping estrogen levels, stress, or mild dehydration. To soothe them: sip plenty of water or warm peppermint tea, rest in a quiet dim room, apply a cool or warm cloth across your forehead, and gently stretch your neck and shoulders. If a headache is sudden and the worst you have ever felt, or lasts for days, consult a healthcare provider.',
      ta: 'ஹார்மோன் மாற்றங்கள் அல்லது நீர்ச்சத்து குறைவினால் தலைவலி வரலாம். வெதுவெதுப்பான நீர் குடிப்பது, அமைதியான அறையில் ஓய்வெடுப்பது மற்றும் நெற்றியில் ஈரத்துணி வைப்பது நிவாரணம் தரும்.',
      hi: 'हार्मोन्स में बदलाव और पानी की कमी से सिरदर्द हो सकता है। भरपूर पानी पिएं, शांत कमरे में आराम करें और माथे पर ठंडी या गर्म पट्टी रखें।',
    },
  },
  {
    id: 'faq-32',
    category: 'symptoms',
    keywords: ['leg pain', 'legs hurt', 'thigh pain', 'thigh cramps', 'pain down legs', 'legs ache', 'how to stop leg pain'],
    question: {
      en: 'Why do my legs or thighs hurt during my period and how can I soothe them?',
      ta: 'மாதவிடாய் காலத்தில் கால்கள் அல்லது தொடைகள் ஏன் வலிக்கின்றன? அதை எவ்வாறு குறைப்பது?',
      hi: 'पीरियड्स में पैरों या जांघों में दर्द क्यों होता है और इसे कैसे ठीक करें?',
    },
    answer: {
      en: 'Period leg and thigh ache happens because uterine prostaglandins and pelvic congestion radiate into nearby pelvic nerve pathways (femoral and sciatic nerves). You can soothe them by elevating your legs on pillows, placing a warm heating pad on your upper thighs, doing gentle hamstring stretches, and taking a warm bath. If leg pain is accompanied by one-sided swelling, redness, or heat, consult a doctor immediately.',
      ta: 'கருப்பையின் ஹார்மோன் சமிக்ஞைகள் இடுப்பு நரம்புகள் வழியாக கால்களுக்கும் பரவுவதால் கால் வலி ஏற்படுகிறது. கால்களை தலையணையின் மீது உயர்த்தி வைப்பது, தொடைகளில் வெந்நீர் ஒத்தடம் கொடுப்பது மற்றும் லேசான உடற்பயிற்சி வலியைப் போக்கும்.',
      hi: 'गर्भाशय के हार्मोन्स नसों पर दबाव डालते हैं जिससे पैरों और जांघों में दर्द फैलता है। पैरों के नीचे तकिया रखकर लेटने, गर्म पानी की सिकाई और हल्के खिंचाव से काफी आराम मिलता है।',
    },
  },
  {
    id: 'faq-33',
    category: 'symptoms',
    keywords: ['backache', 'lower back pain', 'back hurts', 'lumbar pain', 'how to stop back pain'],
    question: {
      en: 'Why does my lower back hurt during my period and how do I soothe it?',
      ta: 'மாதவிடாய் காலத்தில் கீழ் முதுகு ஏன் வலிக்கிறது? அதை எவ்வாறு சரி செய்வது?',
      hi: 'पीरियड्स में कमर के निचले हिस्से में दर्द क्यों होता है और इससे राहत कैसे पाएं?',
    },
    answer: {
      en: 'Lower back ache is caused by prostaglandin contractions in your uterus spreading tension to pelvic ligaments and lumbar spinal muscles. Applying continuous mild warmth to your lower back, sleeping on your side with a pillow tucked between your knees, and gentle cat-cow stretches provide great relief.',
      ta: 'கருப்பை சுருங்குவதால் ஏற்படும் அழுத்தம் கீழ் முதுகெலும்பு தசைகளிலும் பரவுகிறது. முதுகில் வெந்நீர் ஒத்தடம் கொடுப்பது மற்றும் பக்கவாட்டில் ஒரு தலையணையை முழங்கால்களுக்கு இடையில் வைத்து தூங்குவது நிவாரணம் தரும்.',
      hi: 'गर्भाशय के सिकुड़ने से कमर की निचली मांसपेशियों में खिंचाव आ जाता है। कमर पर गर्म पट्टी रखने और घुटनों के बीच तकिया लगाकर सोने से दर्द कम होता है।',
    },
  },
];

