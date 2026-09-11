// SMRITI Default Seed Data
// Includes demo users, 10 activities, question bank, media assets, and historical clinical metrics.

export const INITIAL_USERS = {
  patients: [
    {
      id: 'patient-1',
      name: 'Ramesh Patel',
      age: 72,
      gender: 'Male',
      stage: 'Early-stage MCI',
      difficulty: 'Medium',
      primaryCaregiver: 'Aarav Patel (Son)',
      phone: '+91 98765 43210',
      registeredDate: '2026-01-15',
      riskStatus: 'Stable',
      doctorAssigned: 'Dr. Ananya Sharma',
      notes: 'Loves classical music and gardening. Responds exceptionally well to auditory cues and visual flowers.'
    },
    {
      id: 'patient-2',
      name: 'Kalyani Sen',
      age: 68,
      gender: 'Female',
      stage: 'Mild Cognitive Impairment',
      difficulty: 'Easy',
      primaryCaregiver: 'Sunita Sen (Daughter)',
      phone: '+91 98234 56789',
      registeredDate: '2026-02-01',
      riskStatus: 'Review Needed',
      doctorAssigned: 'Dr. Ananya Sharma',
      notes: 'Prefers larger fonts and high contrast. Enjoys cultural folklore and family photo activities.'
    },
    {
      id: 'patient-3',
      name: 'Mohan Lal Sharma',
      age: 76,
      gender: 'Male',
      stage: 'Moderate Memory Loss',
      difficulty: 'Easy',
      primaryCaregiver: 'Dr. Vikram Sharma (Son)',
      phone: '+91 99112 23344',
      registeredDate: '2025-11-20',
      riskStatus: 'High Attention',
      doctorAssigned: 'Sister Priya Mathew',
      notes: 'Benefits from repetitive recall loops and daily orientation companion.'
    },
    {
      id: 'patient-4',
      name: 'Fatima Begum',
      age: 70,
      gender: 'Female',
      stage: 'Early Memory Maintenance',
      difficulty: 'Hard',
      primaryCaregiver: 'Zaid Ahmed (Nephew)',
      phone: '+91 97654 32198',
      registeredDate: '2026-02-18',
      riskStatus: 'Improving',
      doctorAssigned: 'Dr. Ananya Sharma',
      notes: 'High performer in visual sequence walks and cultural questions.'
    }
  ],
  doctors: [
    {
      id: 'doc-1',
      name: 'Dr. Ananya Sharma',
      title: 'MD (Neurology), Geriatric Specialist',
      role: 'Doctor',
      email: 'dr.ananya@smriti.care',
      department: 'Neurogeriatric Cognitive Health',
      patientsCount: 18,
      hospital: 'Apollo Geriatric Memory Clinic'
    },
    {
      id: 'nurse-1',
      name: 'Sister Priya Mathew',
      title: 'Head Nurse & Cognitive Therapist',
      role: 'Nurse',
      email: 'priya.mathew@smriti.care',
      department: 'Elder Rehabilitation Care',
      patientsCount: 24,
      hospital: 'City Geriatric Wellness Centre'
    }
  ],
  admin: {
    id: 'admin-1',
    name: 'SMRITI System Administrator',
    role: 'Admin',
    email: 'admin@smriti.care'
  }
};

export const INITIAL_ACTIVITIES = [
  {
    id: 'memory-garden',
    title: 'Memory Garden',
    category: 'Visual Working Memory',
    badge: 'Visual Memory',
    icon: '🌸',
    color: '#2d6a4f',
    bgLight: '#e8f5e9',
    description: 'Observe blooming flowers, colorful birds, and garden items before they rest, then recall what you saw.',
    instructions: 'Take a calm look at the garden items shown on screen. Observe their colors, shapes, and locations. After a few moments they will hide, and you will be asked a gentle question.',
    baseDifficulty: 'Medium',
    status: 'Active',
    estimatedTime: '3 mins'
  },
  {
    id: 'familiar-face',
    title: 'Familiar Face',
    category: 'Face Recognition & Relationships',
    badge: 'Social Memory',
    icon: '👥',
    color: '#1d3557',
    bgLight: '#e0f2fe',
    description: 'Recognize beloved family members, caregivers, and familiar companions from photographs.',
    instructions: 'Look closely at the photo displayed. Read the choices and select who this lovely person is or how you know them.',
    baseDifficulty: 'Easy',
    status: 'Active',
    estimatedTime: '2 mins'
  },
  {
    id: 'lifestory',
    title: 'LifeStory',
    category: 'Autobiographical Memory',
    badge: 'Reminiscence',
    icon: '📖',
    color: '#6b2d5c',
    bgLight: '#f3e8ff',
    description: 'Walk down memory lane with heartwarming questions about old traditions, school days, and family celebrations.',
    instructions: 'Read each reminiscing prompt about cherished eras, favorite celebrations, and memorable times, and choose the answer that speaks to you.',
    baseDifficulty: 'Easy',
    status: 'Active',
    estimatedTime: '4 mins'
  },
  {
    id: 'memory-radio',
    title: 'Memory Radio',
    category: 'Auditory Recall & Music',
    badge: 'Auditory Memory',
    icon: '📻',
    color: '#b07d1a',
    bgLight: '#fef3c7',
    description: 'Listen to soothing nostalgic melodies and answer friendly questions about tunes, instruments, and moods.',
    instructions: 'Press the Play button to listen to a soothing melody on your vintage radio. When the song pauses, answer a question about what you heard.',
    baseDifficulty: 'Medium',
    status: 'Active',
    estimatedTime: '3 mins'
  },
  {
    id: 'daily-companion',
    title: 'Daily Companion',
    category: 'Temporal & Environmental Orientation',
    badge: 'Daily Orientation',
    icon: '☀️',
    color: '#d97706',
    bgLight: '#fffbeb',
    description: 'A gentle morning check-in to confirm today’s day of the week, the current season, and your daily wellness.',
    instructions: 'Let us orient ourselves together today! Answer questions about what day it is, the time of day, and how you are feeling this fine day.',
    baseDifficulty: 'Easy',
    status: 'Active',
    estimatedTime: '2 mins'
  },
  {
    id: 'memory-walk',
    title: 'Memory Walk',
    category: 'Sequential & Spatial Navigation',
    badge: 'Spatial Sequence',
    icon: '🌿',
    color: '#047857',
    bgLight: '#ecfdf5',
    description: 'Take a virtual stroll along a peaceful garden path, remembering the order of landmarks you pass.',
    instructions: 'Watch the path carefully as landmarks appear one by one. Remember the exact sequence in which you visited each landmark.',
    baseDifficulty: 'Medium',
    status: 'Active',
    estimatedTime: '4 mins'
  },
  {
    id: 'culture-quest',
    title: 'Culture Quest',
    category: 'Semantic & Heritage Knowledge',
    badge: 'Cultural Heritage',
    icon: '🪔',
    color: '#991b1b',
    bgLight: '#fee2e2',
    description: 'Celebrate Indian heritage, beloved festivals like Diwali and Holi, historic places, and traditional culinary arts.',
    instructions: 'Enjoy questions celebrating our shared culture, traditions, famous historic monuments, and seasonal sweets.',
    baseDifficulty: 'Medium',
    status: 'Active',
    estimatedTime: '3 mins'
  },
  {
    id: 'recall-loop',
    title: 'Recall Loop',
    category: 'Delayed Retention & Focus',
    badge: 'Delayed Recall',
    icon: '⏳',
    color: '#4338ca',
    bgLight: '#e0e7ff',
    description: 'Memorize a short set of everyday words, relax with a calm breathing pause, then recall the items.',
    instructions: 'Read and remember the 3 highlighted words shown on screen. Then take a calming 5-second breath. Once the pause is done, identify the words you saw.',
    baseDifficulty: 'Hard',
    status: 'Active',
    estimatedTime: '3 mins'
  },
  {
    id: 'family-puzzle',
    title: 'Family Puzzle',
    category: 'Visual-Spatial Pattern Matching',
    badge: 'Visual Spatial',
    icon: '🧩',
    color: '#0f766e',
    bgLight: '#ccfbf1',
    description: 'Piece together visual patterns and identify which part completes the cherished scene.',
    instructions: 'Inspect the memory picture with a piece missing. Select the matching tile from the options below to complete the keepsake.',
    baseDifficulty: 'Medium',
    status: 'Active',
    estimatedTime: '3 mins'
  },
  {
    id: 'cognitive-fingerprint',
    title: 'Cognitive Fingerprint',
    category: 'Overall Cognitive Performance Profile',
    badge: 'Cognitive Profile',
    icon: '🌟',
    color: '#2563eb',
    bgLight: '#eff6ff',
    description: 'View your holistic cognitive fingerprint, activity scores, accuracy, reaction time, and difficulty growth.',
    instructions: 'Review your personalized cognitive performance radar. See your strengths in memory, attention, orientation, and language.',
    baseDifficulty: 'All Levels',
    status: 'Active',
    estimatedTime: '2 mins'
  }
];

export const INITIAL_QUESTIONS = [
  // Memory Garden questions
  {
    id: 'q-mg-1',
    activityId: 'memory-garden',
    difficulty: 'Easy',
    prompt: 'Which flower was blooming prominently in the center of the garden?',
    options: ['Bright Red Rose', 'Golden Sunflower', 'White Jasmine', 'Purple Orchid'],
    correctAnswer: 'Bright Red Rose',
    explanation: 'The Red Rose was in the central garden bed.'
  },
  {
    id: 'q-mg-2',
    activityId: 'memory-garden',
    difficulty: 'Medium',
    prompt: 'How many singing sparrows were sitting near the wooden bird feeder?',
    options: ['1 Sparrow', '2 Sparrows', '3 Sparrows', '4 Sparrows'],
    correctAnswer: '2 Sparrows',
    explanation: 'There were two little sparrows perched near the feeder.'
  },
  {
    id: 'q-mg-3',
    activityId: 'memory-garden',
    difficulty: 'Hard',
    prompt: 'What color was the watering can placed beside the clay pots?',
    options: ['Emerald Green', 'Deep Blue', 'Sun Yellow', 'Terracotta Red'],
    correctAnswer: 'Emerald Green',
    explanation: 'The watering can was emerald green.'
  },

  // Familiar Face questions
  {
    id: 'q-ff-1',
    activityId: 'familiar-face',
    difficulty: 'Easy',
    photoKey: 'granddaughter',
    prompt: 'Who is this smiling girl holding a graduation diploma?',
    options: ['Granddaughter Priya', 'Neighbor Meera', 'Nurse Kavita', 'School Teacher Sunita'],
    correctAnswer: 'Granddaughter Priya',
    explanation: 'That is your granddaughter Priya on her engineering graduation day.'
  },
  {
    id: 'q-ff-2',
    activityId: 'familiar-face',
    difficulty: 'Medium',
    photoKey: 'son',
    prompt: 'Who is this gentleman standing with his arms folded proudly?',
    options: ['Your son Aarav', 'Your brother Ramesh', 'Dr. Verma', 'Uncle Suresh'],
    correctAnswer: 'Your son Aarav',
    explanation: 'This is your eldest son Aarav, who calls you every evening.'
  },
  {
    id: 'q-ff-3',
    activityId: 'familiar-face',
    difficulty: 'Hard',
    photoKey: 'caregiver',
    prompt: 'Who is this kind healthcare nurse who visits each Tuesday morning?',
    options: ['Sister Priya Mathew', 'Aunt Nirmala', 'Teacher Lata', 'Cousin Divya'],
    correctAnswer: 'Sister Priya Mathew',
    explanation: 'Sister Priya Mathew assists with your wellness checkups.'
  },

  // LifeStory questions
  {
    id: 'q-ls-1',
    activityId: 'lifestory',
    difficulty: 'Easy',
    prompt: 'During Diwali celebrations, what do families light outside doorways to welcome warmth and joy?',
    options: ['Earthen Diyas (oil lamps)', 'Electric torchlights', 'Candles only', 'Paper lanterns only'],
    correctAnswer: 'Earthen Diyas (oil lamps)',
    explanation: 'Diyas made of clay with mustard or sesame oil are traditionally lit on Diwali.'
  },
  {
    id: 'q-ls-2',
    activityId: 'lifestory',
    difficulty: 'Medium',
    prompt: 'Which beloved radio service broadcasted news bulletins, farm advisories, and classical music in the 1960s–80s?',
    options: ['All India Radio (Akashvani)', 'Radio Ceylon', 'BBC World Service', 'Vividh Bharati'],
    correctAnswer: 'All India Radio (Akashvani)',
    explanation: 'Akashvani was the national broadcaster connecting every household.'
  },
  {
    id: 'q-ls-3',
    activityId: 'lifestory',
    difficulty: 'Hard',
    prompt: 'What traditional game played with five small pebbles was popular in childhood courtyards?',
    options: ['Gitte (Panch Kauwa)', 'Ludo', 'Carrom', 'Kabaddi'],
    correctAnswer: 'Gitte (Panch Kauwa)',
    explanation: 'Gitte was a classic game of agility played with round stones.'
  },

  // Memory Radio questions
  {
    id: 'q-mr-1',
    activityId: 'memory-radio',
    difficulty: 'Easy',
    prompt: 'What predominant classical instrument did you hear carrying the peaceful melodic line?',
    options: ['Acoustic Bamboo Flute (Bansuri)', 'Electric Synthesizer', 'Heavy Drum Set', 'Trumpet'],
    correctAnswer: 'Acoustic Bamboo Flute (Bansuri)',
    explanation: 'The serene melody was performed on a traditional bamboo flute.'
  },
  {
    id: 'q-mr-2',
    activityId: 'memory-radio',
    difficulty: 'Medium',
    prompt: 'What was the tempo and emotional feel of this musical piece?',
    options: ['Calm, meditative, and peaceful', 'Loud, fast, and frantic', 'Rock and roll rhythm', 'Marching band tempo'],
    correctAnswer: 'Calm, meditative, and peaceful',
    explanation: 'The music had a tranquil, soothing tempo designed for relaxing the mind.'
  },
  {
    id: 'q-mr-3',
    activityId: 'memory-radio',
    difficulty: 'Hard',
    prompt: 'In classical Indian tradition, which morning Raga is renowned for bringing peace and sunrise light?',
    options: ['Raga Bhairav', 'Raga Darbari', 'Raga Malkauns', 'Raga Megh'],
    correctAnswer: 'Raga Bhairav',
    explanation: 'Raga Bhairav is the premier morning raga invoking calm reverence.'
  },

  // Daily Companion questions
  {
    id: 'q-dc-1',
    activityId: 'daily-companion',
    difficulty: 'Easy',
    prompt: 'Today is a wonderful day. What is the current time of day you are playing this session?',
    options: ['Morning / Daytime', 'Deep Midnight', 'Late Night', 'Dawn Twilight'],
    correctAnswer: 'Morning / Daytime',
    explanation: 'It is daylight hours, a splendid time for gentle mental exercise.'
  },
  {
    id: 'q-dc-2',
    activityId: 'daily-companion',
    difficulty: 'Medium',
    prompt: 'Taking good care of your health today: Have you had a glass of clean fresh water in the last hour?',
    options: ['Yes, I am hydrated!', 'Not yet, I will drink one now', 'I had warm herbal tea', 'I am about to take a sip'],
    correctAnswer: 'Yes, I am hydrated!',
    explanation: 'Hydration supports mental sharpness and brain circulation.'
  },
  {
    id: 'q-dc-3',
    activityId: 'daily-companion',
    difficulty: 'Hard',
    prompt: 'Which season is typically known for gentle breezes and blossoming flowers?',
    options: ['Spring (Vasant Ritu)', 'Mid-Monsoon Heavy Rains', 'Peak Winter Frost', 'Scorching Summer'],
    correctAnswer: 'Spring (Vasant Ritu)',
    explanation: 'Vasant Ritu is celebrated across the land as the season of blossoms and renewal.'
  },

  // Memory Walk questions
  {
    id: 'q-mw-1',
    activityId: 'memory-walk',
    difficulty: 'Easy',
    prompt: 'You walked past: 1) Garden Gate, 2) Lotus Pond, 3) Banyan Tree. What was the 2nd landmark?',
    options: ['Lotus Pond', 'Garden Gate', 'Banyan Tree', 'Rose Bed'],
    correctAnswer: 'Lotus Pond',
    explanation: 'The second stop along the path was the serene Lotus Pond.'
  },
  {
    id: 'q-mw-2',
    activityId: 'memory-walk',
    difficulty: 'Medium',
    prompt: 'In what order did you visit the 3 stops on your walk?',
    options: [
      'Garden Gate → Lotus Pond → Banyan Tree',
      'Lotus Pond → Banyan Tree → Garden Gate',
      'Banyan Tree → Garden Gate → Lotus Pond',
      'Garden Gate → Banyan Tree → Lotus Pond'
    ],
    correctAnswer: 'Garden Gate → Lotus Pond → Banyan Tree',
    explanation: 'You started at the Garden Gate, passed the Lotus Pond, and ended at the Banyan Tree.'
  },

  // Culture Quest questions
  {
    id: 'q-cq-1',
    activityId: 'culture-quest',
    difficulty: 'Easy',
    prompt: 'Which festival is celebrated with vivid colors, sweets like Gujiya, and playful water?',
    options: ['Holi', 'Diwali', 'Eid-ul-Fitr', 'Onam'],
    correctAnswer: 'Holi',
    explanation: 'Holi is the joyous festival of colors and friendship.'
  },
  {
    id: 'q-cq-2',
    activityId: 'culture-quest',
    difficulty: 'Medium',
    prompt: 'The majestic marble monument in Agra built on the banks of the Yamuna River is called:',
    options: ['Taj Mahal', 'Red Fort', 'Qutub Minar', 'Hawa Mahal'],
    correctAnswer: 'Taj Mahal',
    explanation: 'The Taj Mahal is world renowned for its white marble architecture.'
  },
  {
    id: 'q-cq-3',
    activityId: 'culture-quest',
    difficulty: 'Hard',
    prompt: 'The festival celebrated in Kerala featuring a grand vegetarian feast called Sadhya and snake boat races is:',
    options: ['Onam', 'Pongal', 'Baisakhi', 'Navratri'],
    correctAnswer: 'Onam',
    explanation: 'Onam commemorates the homecoming of legendary King Mahabali.'
  },

  // Recall Loop questions
  {
    id: 'q-rl-1',
    activityId: 'recall-loop',
    difficulty: 'Hard',
    prompt: 'Earlier you memorized three items: "River", "Temple Bell", "Saffron". Which word was in that group?',
    options: ['Temple Bell', 'Ocean Wave', 'Silver Coin', 'Green Leaf'],
    correctAnswer: 'Temple Bell',
    explanation: 'The three items were River, Temple Bell, and Saffron.'
  },
  {
    id: 'q-rl-2',
    activityId: 'recall-loop',
    difficulty: 'Hard',
    prompt: 'Which of the following items was NOT in the initial memorization list?',
    options: ['Diamond Ring', 'River', 'Temple Bell', 'Saffron'],
    correctAnswer: 'Diamond Ring',
    explanation: 'Diamond Ring was never presented in your list.'
  },

  // Family Puzzle questions
  {
    id: 'q-fp-1',
    activityId: 'family-puzzle',
    difficulty: 'Medium',
    prompt: 'Look at the family picnic picture with the missing quadrant. Which piece completes the blue picnic mat and teacup?',
    options: ['Tile A (Blue Mat Corner with Porcelain Teacup)', 'Tile B (Grass patch only)', 'Tile C (Empty tree branch)', 'Tile D (Blank sky)'],
    correctAnswer: 'Tile A (Blue Mat Corner with Porcelain Teacup)',
    explanation: 'Tile A aligns with the checkered blue picnic cloth.'
  }
];

export const INITIAL_MEDIA = {
  photos: [
    {
      id: 'photo-1',
      title: 'Granddaughter Priya - Graduation Day',
      category: 'Family',
      caption: 'Priya smiling in her convocation robe and cap.',
      key: 'granddaughter',
      dateAdded: '2026-01-20',
      url: '/photos/priya.svg'
    },
    {
      id: 'photo-2',
      title: 'Son Aarav at Family Garden',
      category: 'Family',
      caption: 'Aarav watering the jasmine plants in the backyard.',
      key: 'son',
      dateAdded: '2026-01-25',
      url: '/photos/aarav.svg'
    },
    {
      id: 'photo-3',
      title: 'Sister Priya Mathew (Caregiver)',
      category: 'Caregiver',
      caption: 'Head nurse with a stethoscope and welcoming smile.',
      key: 'caregiver',
      dateAdded: '2026-02-02',
      url: '/photos/nurse.svg'
    },
    {
      id: 'photo-4',
      title: 'Varanasi Ghats at Sunrise',
      category: 'Heritage',
      caption: 'Peaceful boat on the holy Ganges River at dawn.',
      key: 'varanasi',
      dateAdded: '2026-02-10',
      url: '/photos/ghats.svg'
    }
  ],
  audio: [
    {
      id: 'audio-1',
      title: 'Morning Awakening - Bansuri (Bamboo Flute) & Tanpura',
      artist: 'SMRITI Classical Soundscapes',
      duration: '0:45',
      mood: 'Calming & Meditative',
      category: 'Classical',
      isSynth: true
    },
    {
      id: 'audio-2',
      title: 'Vintage Gramophone Waltz',
      artist: 'Classic Memories Ensemble',
      duration: '0:35',
      mood: 'Nostalgic & Warm',
      category: 'Vintage',
      isSynth: true
    },
    {
      id: 'audio-3',
      title: 'River Bells & Evening Aarti Harmony',
      artist: 'Heritage Acoustic Chimes',
      duration: '0:40',
      mood: 'Spiritual & Reassuring',
      category: 'Spiritual',
      isSynth: true
    }
  ]
};

// Historical Session Results for Patient 1 (Ramesh Patel)
export const INITIAL_PATIENT_SESSIONS = [
  {
    sessionId: 'sess-101',
    patientId: 'patient-1',
    activityId: 'memory-garden',
    activityName: 'Memory Garden',
    date: '2026-03-01',
    score: 85,
    accuracy: 90,
    mistakes: 1,
    correctAnswers: 3,
    responseTimeSec: 4.2,
    difficulty: 'Medium',
    newDifficulty: 'Hard',
    status: 'Completed'
  },
  {
    sessionId: 'sess-102',
    patientId: 'patient-1',
    activityId: 'familiar-face',
    activityName: 'Familiar Face',
    date: '2026-03-03',
    score: 100,
    accuracy: 100,
    mistakes: 0,
    correctAnswers: 3,
    responseTimeSec: 3.1,
    difficulty: 'Easy',
    newDifficulty: 'Medium',
    status: 'Completed'
  },
  {
    sessionId: 'sess-103',
    patientId: 'patient-1',
    activityId: 'memory-radio',
    activityName: 'Memory Radio',
    date: '2026-03-05',
    score: 75,
    accuracy: 75,
    mistakes: 1,
    correctAnswers: 2,
    responseTimeSec: 6.5,
    difficulty: 'Medium',
    newDifficulty: 'Medium',
    status: 'Completed'
  },
  {
    sessionId: 'sess-104',
    patientId: 'patient-1',
    activityId: 'lifestory',
    activityName: 'LifeStory',
    date: '2026-03-07',
    score: 90,
    accuracy: 92,
    mistakes: 0,
    correctAnswers: 3,
    responseTimeSec: 5.0,
    difficulty: 'Medium',
    newDifficulty: 'Hard',
    status: 'Completed'
  },
  {
    sessionId: 'sess-105',
    patientId: 'patient-1',
    activityId: 'memory-walk',
    activityName: 'Memory Walk',
    date: '2026-03-09',
    score: 70,
    accuracy: 70,
    mistakes: 1,
    correctAnswers: 2,
    responseTimeSec: 7.2,
    difficulty: 'Medium',
    newDifficulty: 'Medium',
    status: 'Completed'
  },
  {
    sessionId: 'sess-106',
    patientId: 'patient-1',
    activityId: 'culture-quest',
    activityName: 'Culture Quest',
    date: '2026-03-10',
    score: 95,
    accuracy: 95,
    mistakes: 0,
    correctAnswers: 3,
    responseTimeSec: 3.8,
    difficulty: 'Medium',
    newDifficulty: 'Hard',
    status: 'Completed'
  }
];

// Cognitive domain baseline metrics for patients (used in Fingerprint Radar)
export const INITIAL_COGNITIVE_DOMAINS = {
  'patient-1': {
    visualMemory: 82,
    auditoryMemory: 78,
    faceRecognition: 94,
    temporalOrientation: 88,
    sequentialMemory: 72,
    semanticKnowledge: 90,
    delayedRecall: 68,
    patternMatching: 80
  },
  'patient-2': {
    visualMemory: 65,
    auditoryMemory: 70,
    faceRecognition: 85,
    temporalOrientation: 60,
    sequentialMemory: 55,
    semanticKnowledge: 82,
    delayedRecall: 50,
    patternMatching: 64
  },
  'patient-3': {
    visualMemory: 52,
    auditoryMemory: 58,
    faceRecognition: 62,
    temporalOrientation: 48,
    sequentialMemory: 45,
    semanticKnowledge: 65,
    delayedRecall: 40,
    patternMatching: 55
  },
  'patient-4': {
    visualMemory: 92,
    auditoryMemory: 88,
    faceRecognition: 96,
    temporalOrientation: 95,
    sequentialMemory: 86,
    semanticKnowledge: 94,
    delayedRecall: 85,
    patternMatching: 90
  }
};
