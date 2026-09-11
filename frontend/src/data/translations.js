// Cognitive Care Multilingual Localization System
// Supports English, Bengali (বাংলা), and Hindi (हिन्दी) for patient-facing comfort.

export const SUPPORTED_LANGUAGES = [
  { id: 'en', label: 'English', nativeName: 'English', flag: 'EN' },
  { id: 'bn', label: 'Bengali', nativeName: 'বাংলা', flag: 'BN' },
  { id: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: 'HI' }
];

export const TRANSLATIONS = {
  en: {
    brandName: 'Cognitive Care',
    tagline: 'Memory Support & Cognitive Stimulation',
    welcomePrefix: 'Welcome,',
    welcomeSubtitle: 'Your daily space for calm memory engagement and cognitive wellness.',
    dailySummaryTitle: 'Today’s Engagement',
    exercisesCompleted: 'Exercises Done',
    recentScore: 'Recent Score',
    adaptivePace: 'Comfort Pace',
    chooseActivity: 'Your Cognitive Activities',
    chooseActivityDesc: 'Select any exercise below to begin a calm, comfortable session.',
    viewFingerprint: 'View Cognitive Fingerprint',
    startExercise: 'Start Activity',
    backToDashboard: 'Return to Dashboard',
    replayActivity: 'Practice Again',
    confirmAnswer: 'Confirm Answer',
    howToPlay: 'How to practice:',
    timeRemaining: 'Time Remaining:',
    seconds: 'seconds',
    score: 'Score',
    accuracy: 'Accuracy',
    mistakes: 'Mistakes',
    responseTime: 'Reaction Time',
    adaptiveNotice: 'Adaptive Pacing:',
    languageSelectorTitle: "Choose the language you're most comfortable with",
    languageComfortHint: 'Your preference will be saved for patient activities and instructions.',

    // Activities
    activities: {
      'memory-garden': {
        title: 'Memory Garden',
        category: 'Visual Memory',
        desc: 'Observe blooming flowers, birds, and garden keepsakes before they rest, then recall what you saw.'
      },
      'familiar-face': {
        title: 'Familiar Face',
        category: 'Face Recognition',
        desc: 'Recognize beloved family members, companions, and helpers from cherished photographs.'
      },
      'lifestory': {
        title: 'LifeStory',
        category: 'Reminiscence',
        desc: 'Heartwarming memories of festivals, radio melodies, and traditional courtyard celebrations.'
      },
      'memory-radio': {
        title: 'Memory Radio',
        category: 'Auditory Recall',
        desc: 'Listen to tranquil classical melodies and recall gentle notes, instruments, and moods.'
      },
      'daily-companion': {
        title: 'Daily Companion',
        category: 'Daily Orientation',
        desc: 'A gentle morning check-in on today’s day of the week, weather, and daily hydration.'
      },
      'memory-walk': {
        title: 'Memory Walk',
        category: 'Spatial Sequence',
        desc: 'Take a virtual stroll along a peaceful garden path, remembering the order of visited landmarks.'
      },
      'culture-quest': {
        title: 'Culture Quest',
        category: 'Heritage Knowledge',
        desc: 'Trivia and celebrations from traditional festivals, historic monuments, and shared heritage.'
      },
      'recall-loop': {
        title: 'Recall Loop',
        category: 'Delayed Retention',
        desc: 'Memorize memorable words, relax with a calm breathing pause, then retrieve them from memory.'
      },
      'family-puzzle': {
        title: 'Family Puzzle',
        category: 'Visual Spatial',
        desc: 'Piece together visual patterns and identify which keepsake piece completes the family scene.'
      },
      'cognitive-fingerprint': {
        title: 'Cognitive Fingerprint',
        category: 'Holistic Profile',
        desc: 'Explore your multidimensional cognitive strengths, activity scores, and balance overview.'
      }
    }
  },

  bn: {
    brandName: 'কগনিটিভ কেয়ার',
    tagline: 'স্মৃতি সহায়তা ও জ্ঞানীয় যত্ন',
    welcomePrefix: 'স্বাগতম,',
    welcomeSubtitle: 'আপনার প্রাত্যহিক স্মৃতি চর্চা ও মানসিক প্রশান্তির নিজস্ব পরিমণ্ডল।',
    dailySummaryTitle: 'আজকের সক্রিয়তা',
    exercisesCompleted: 'অনুশীলন সম্পন্ন',
    recentScore: 'সাম্প্রতিক স্কোর',
    adaptivePace: 'সহজ গতি',
    chooseActivity: 'আপনার জ্ঞানীয় ক্রিয়াকলাপ',
    chooseActivityDesc: 'একটি শান্ত ও আরামদায়ক সেশন শুরু করতে নিচের যেকোনো অনুশীলনে স্পর্শ করুন।',
    viewFingerprint: 'জ্ঞানীয় প্রতিচ্ছবি দেখুন',
    startExercise: 'শুরু করুন',
    backToDashboard: 'ড্যাশবোর্ডে ফিরুন',
    replayActivity: 'আবার অনুশীলন করুন',
    confirmAnswer: 'উত্তর নিশ্চিত করুন',
    howToPlay: 'অনুশীলনের নিয়ম:',
    timeRemaining: 'বাকি সময়:',
    seconds: 'সেকেন্ড',
    score: 'স্কোর',
    accuracy: 'সঠিকতা',
    mistakes: 'ভুল',
    responseTime: 'সময়কাল',
    adaptiveNotice: 'অভিযোজিত গতিবিধি:',
    languageSelectorTitle: 'আপনার পছন্দের স্বাচ্ছন্দ্যের ভাষা নির্বাচন করুন',
    languageComfortHint: 'আপনার পছন্দ অনুযায়ী রোগীর কার্যক্রম ও নির্দেশনা প্রদর্শিত হবে।',

    activities: {
      'memory-garden': {
        title: 'স্মৃতি উদ্যান',
        category: 'ভিজ্যুয়াল মেমোরি',
        desc: 'ফোটা ফুল ও বাগানের দৃশ্য মনোযোগ দিয়ে দেখুন, তারপর যা দেখেছেন তা মনে করে উত্তর দিন।'
      },
      'familiar-face': {
        title: 'পরিচিত মুখ',
        category: 'মুখ চেনা',
        desc: 'পারিবারিক ছবি থেকে প্রিয়জন ও শুভাকাঙ্ক্ষীদের সহজে শনাক্ত করুন।'
      },
      'lifestory': {
        title: 'জীবনের গল্প',
        category: 'স্মৃতিচারণ',
        desc: 'উৎসব, পুরোনো রেডিও গান ও সোনালী শৈশবের মধুর স্মৃতিচারণ।'
      },
      'memory-radio': {
        title: 'স্মৃতি রেডিও',
        category: 'শ্রুতি স্মৃতি',
        desc: 'শান্ত শাস্ত্রীয় সুর শুনুন এবং বাদ্যযন্ত্র ও সুরের অনুভূতি স্মরণ করুন।'
      },
      'daily-companion': {
        title: 'দৈনিক সঙ্গী',
        category: 'দৈনন্দিন সচেতনতা',
        desc: 'আজকের বার, মনোরম সকাল ও নিয়মিত জলপানের একটি আন্তরিক খোঁজখবর।'
      },
      'memory-walk': {
        title: 'স্মৃতির পদচারণা',
        category: 'ধারাবাহিক স্মৃতি',
        desc: 'সুন্দর বাগানের পথ ধরে হাঁটার সময় দেখা স্থানগুলো সঠিক ক্রমানুসারে মনে রাখুন।'
      },
      'culture-quest': {
        title: 'ঐতিহ্য অন্বেষণ',
        category: 'সাংস্কৃতিক স্মৃতি',
        desc: 'ঐতিহাসিক উৎসব, বিখ্যাত স্থাপত্য ও ভারতীয় সংস্কৃতির স্মরণীয় প্রশ্নাবলী।'
      },
      'recall-loop': {
        title: 'পুনরাবৃত্তি চক্র',
        category: 'বিলম্বিত স্মৃতি',
        desc: 'কয়েকটি শব্দ মনে রাখুন, শান্ত শ্বাস নিন, তারপর সঠিক শব্দটি স্মরণ করুন।'
      },
      'family-puzzle': {
        title: 'পারিবারিক ধাঁধা',
        category: 'প্যাটার্ন মেলানো',
        desc: 'পারিবারিক ছবির অনুপস্থিত টুকরোটি চিহ্নিত করে দৃশ্যটি সম্পূর্ণ করুন।'
      },
      'cognitive-fingerprint': {
        title: 'জ্ঞানীয় প্রতিচ্ছবি',
        category: 'সামগ্রিক পর্যালোচনা',
        desc: 'আপনার স্মরণশক্তি, সচেতনতা এবং মননশীলতার বহুমাত্রিক চার্ট ও অগ্রগতি দেখুন।'
      }
    }
  },

  hi: {
    brandName: 'कॉग्निटिव केयर',
    tagline: 'स्मृति संबल एवं संज्ञानात्मक देखभाल',
    welcomePrefix: 'स्वागत है,',
    welcomeSubtitle: 'शांत स्मृति अभ्यास और संज्ञानात्मक संतुलन के लिए आपका दैनिक मंच।',
    dailySummaryTitle: 'आज की प्रगति',
    exercisesCompleted: 'अभ्यास पूर्ण',
    recentScore: 'हालिया स्कोर',
    adaptivePace: 'अनुकूलित गति',
    chooseActivity: 'आपकी संज्ञानात्मक गतिविधियाँ',
    chooseActivityDesc: 'शांत और आरामदायक अभ्यास शुरू करने के लिए नीचे दिए गए किसी भी कार्ड को चुनें।',
    viewFingerprint: 'संज्ञानात्मक रूपरेखा देखें',
    startExercise: 'आरंभ करें',
    backToDashboard: 'डैशबोर्ड पर लौटें',
    replayActivity: 'पुनः अभ्यास करें',
    confirmAnswer: 'उत्तर की पुष्टि करें',
    howToPlay: 'अभ्यास की विधि:',
    timeRemaining: 'शेष समय:',
    seconds: 'सेकंड',
    score: 'स्कोर',
    accuracy: 'सटीकता',
    mistakes: 'त्रुटियाँ',
    responseTime: 'प्रतिक्रिया समय',
    adaptiveNotice: 'अनुकूली कठिनाई स्तर:',
    languageSelectorTitle: 'वह भाषा चुनें जिसमें आप सबसे अधिक सहज महसूस करते हैं',
    languageComfortHint: 'आपकी चुनी हुई भाषा में अभ्यास और निर्देश प्रस्तुत किए जाएंगे।',

    activities: {
      'memory-garden': {
        title: 'स्मृति उद्यान',
        category: 'दृश्य स्मृति',
        desc: 'खिले हुए फूलों और बगीचे की वस्तुओं को ध्यान से देखें और फिर याद करके उत्तर दें।'
      },
      'familiar-face': {
        title: 'परिचित चेहरा',
        category: 'चेहरा पहचान',
        desc: 'तस्वीरों से अपने प्रिय परिवारजनों और देखभाल करने वालों को पहचानें।'
      },
      'lifestory': {
        title: 'जीवन गाथा',
        category: 'स्मृति स्मरण',
        desc: 'पारंपरिक त्योहारों, पुराने रेडियो के दिनों और मधुर यादों का आनंद लें।'
      },
      'memory-radio': {
        title: 'स्मृति रेडियो',
        category: 'श्रव्य स्मरण',
        desc: 'मधुर बांसुरी और शास्त्रीय संगीत सुनें और वाद्ययंत्रों को याद करें।'
      },
      'daily-companion': {
        title: 'दैनिक साथी',
        category: 'दैनिक जागरूकता',
        desc: 'आज का दिन, सुहानी सुबह और पर्याप्त जलपान का एक सहज ध्यान।'
      },
      'memory-walk': {
        title: 'स्मृति यात्रा',
        category: 'क्रमिक स्मृति',
        desc: 'बगीचे के मार्ग पर दिखने वाले पड़ावों को सही क्रम में याद रखें।'
      },
      'culture-quest': {
        title: 'संस्कृति अन्वेषण',
        category: 'सांस्कृतिक धरोहर',
        desc: 'होली, दिवाली और ऐतिहासिक धरोहरों से जुड़े ज्ञानवर्धक प्रश्न।'
      },
      'recall-loop': {
        title: 'स्मृति चक्र',
        category: 'विलंबित स्मरण',
        desc: 'दिए गए शब्दों को याद रखें, शांत सांस लें और फिर सही शब्द चुनें।'
      },
      'family-puzzle': {
        title: 'पारिवारिक पहेली',
        category: 'पैटर्न मिलान',
        desc: 'पारिवारिक चाय के दृश्य के छूटे हुए हिस्से को सही टाइल से पूरा करें।'
      },
      'cognitive-fingerprint': {
        title: 'संज्ञानात्मक रूपरेखा',
        category: 'समग्र मूल्यांकन',
        desc: 'अपनी स्मृति, ध्यान और विभिन्न संज्ञानात्मक पक्षों का बहुआयामी चार्ट देखें।'
      }
    }
  }
};

export function getTranslation(lang = 'en') {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
