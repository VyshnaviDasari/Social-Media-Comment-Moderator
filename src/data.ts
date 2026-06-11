import { Post, Comment } from "./types";

export const INITIAL_POSTS: Post[] = [
  {
    id: "post-1",
    author: {
      name: "Devon Carter",
      handle: "@devonc_tech",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    timestamp: "2 hours ago",
    content: "🚀 After 6 months of intense refinement, I've finally open-sourced compiler-core v2! It's a lightweight, blazing-fast ESM type stripper for Node. Let me know your feedback on imports execution speeds!",
    likes: 342,
    shares: 89,
    commentsCount: 5,
    tags: ["typescript", "opensource", "webdev"]
  },
  {
    id: "post-2",
    author: {
      name: "Aarav Sharma",
      handle: "@aarav_travels",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    timestamp: "5 hours ago",
    content: "Visited the beautiful Araku Valley and Vizag beaches over the weekend! 🌊 Filter coffee watching the sunrise over the Eastern Ghats is pure bliss. What is your absolute favorite weekend escape? ☕🌲",
    likes: 412,
    shares: 64,
    commentsCount: 2,
    tags: ["travel", "araku", "coffee"]
  },
  {
    id: "post-3",
    author: {
      name: "కార్తీక్ వర్మ",
      handle: "@karthik_cinema",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    timestamp: "1 day ago",
    content: "ఈ మధ్య కాలంలో వచ్చిన తెలుగు సినిమాలలో మీకు బాగా నచ్చిన సినిమా ఏది? కథలో కొత్తదనం ఉంటేనే ప్రేక్షకులు ఆదరిస్తున్నారు అని మీరనుకుంటున్నారా? మీ అభిప్రాయాన్ని పంచుకోండి! 🎬🍿",
    likes: 512,
    shares: 88,
    commentsCount: 2,
    tags: ["తెలుగు_సినిమా", "చర్చ", "టాపిక్"]
  },
  {
    id: "post-4",
    author: {
      name: "శ్రావ్య రెడ్డి",
      handle: "@shravya_culture",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    },
    timestamp: "12 hours ago",
    content: "ఇంట్లో వండిన కమ్మని వేడి వేడి అన్నం, ఆవకాయ పచ్చడి ముద్ద నోట్లో వేసుకుంటే వచ్చే ఆ తృప్తి వేరే ఏ వంటకాల్లో కూడా దొరకదు! మన సాంప్రదాయ వంటకాల్లో మీ ఆల్-టైమ్ ఫేవరెట్ వంటకం ఏంటో చెప్పండి! 🌶️🍚",
    likes: 673,
    shares: 112,
    commentsCount: 2,
    tags: ["తెలుగు_వంటకాలు", "ఆవకాయ", "సంస్కృతి"]
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  // Comments for Post 1
  {
    id: "cmt-1",
    postId: "post-1",
    author: {
      name: "Sarah Lin",
      handle: "@sarah_l",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    },
    timestamp: "1 hour ago",
    text: "This is exactly what I was searching for! Running imports directly on TypeScript can be so slow, this ESM resolver stripped my bundles by 40%. Fantastic work Dev!",
    isNegative: false,
    severity: 2,
    sentiment: "positive",
    category: "positive_feedback",
    explanation: "Explicitly expresses high utility, bundle size improvement, and appreciation.",
    moderator: "Gemini LLM Shield",
    executionTimeMs: 145
  },
  {
    id: "cmt-2",
    postId: "post-1",
    author: {
      name: "Alex Dev99",
      handle: "@alex99",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    timestamp: "45 mins ago",
    text: "The bundle resolution works fine for ESNext targets, but it breaks completely with older commonJS files. Please write support for CJS requires or update the README to note it fails with older builds.",
    isNegative: false,
    severity: 18,
    sentiment: "neutral",
    category: "constructive_critique",
    explanation: "Though pointing out a major system failure (breaks with CJS), the tone is polite, precise, and constructively suggests updating instructions.",
    moderator: "Gemini LLM Shield",
    executionTimeMs: 172
  },
  {
    id: "cmt-3",
    postId: "post-1",
    author: {
      name: "TrollMaster",
      handle: "@troll_master",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    },
    timestamp: "30 mins ago",
    text: "Who even uses this garbage? It sucks so much. Complete trash work, you look like a total idiot making this.",
    isNegative: true,
    severity: 96,
    sentiment: "negative",
    category: "harassment",
    explanation: "Violent personal attacks, calling the creator an idiot, and repeating dismissive trash words.",
    suggestion: "Reframe as objective inquiry: 'How does v2 benchmark against native swc resolver speeds? I faced setup bugs.'",
    moderator: "Keyword Filter",
    executionTimeMs: 1
  },
  {
    id: "cmt-4",
    postId: "post-1",
    author: {
      name: "PassiveAggressiveCoder",
      handle: "@code_passive",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    },
    timestamp: "15 mins ago",
    text: "Don't install this, it's a complete scam! The developer probably wrote code to steal your local SSH keys. This project is a absolute piece of shit.",
    isNegative: true,
    severity: 92,
    sentiment: "negative",
    category: "profanity",
    explanation: "Uses extreme profanity ('shit') and makes unverified malicious claims alleging the author created a security scam.",
    suggestion: "Rephrase concerns carefully: 'Could you clarify the security audits or permissions policies for local execution?'",
    moderator: "Gemini LLM Shield",
    executionTimeMs: 215
  },
  {
    id: "cmt-5",
    postId: "post-1",
    author: {
      name: "CryptoBot999",
      handle: "@earn_fast_99",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80"
    },
    timestamp: "5 mins ago",
    text: "💸 GET CASH FAST! Earn up to $500/day sitting in your room! No programming needed! Contact WhatsApp link in profile and follow instructions right away! 🤑💵",
    isNegative: true,
    severity: 85,
    sentiment: "negative",
    category: "spam",
    explanation: "Pure advertising spam offering fast high-value cash loops designed to target technical developers.",
    moderator: "Local Sentiment Heuristics",
    executionTimeMs: 2
  },

  // Comments for Post 2 (Aarav Travels)
  {
    id: "cmt-6",
    postId: "post-2",
    author: {
      name: "Helen Travels",
      handle: "@helen_t",
      avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&auto=format&fit=crop&q=80"
    },
    timestamp: "4 hours ago",
    text: "Araku is magical, absolutely gorgeous! You must try the bamboo chicken there too. What a lovely sunrise picture!",
    isNegative: false,
    severity: 4,
    sentiment: "positive",
    category: "positive_feedback",
    explanation: "Polite personal experience share, praising the travel picture and recommending food.",
    moderator: "Gemini LLM Shield",
    executionTimeMs: 140
  },
  {
    id: "cmt-7",
    postId: "post-2",
    author: {
      name: "FrustratedWanderer",
      handle: "@frust_wanderer",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80"
    },
    timestamp: "2 hours ago",
    text: "This post is so boring. Nobody cares about your stupid travels, go away and stop polluting my feed with your garbage picture.",
    isNegative: true,
    severity: 78,
    sentiment: "negative",
    category: "harassment",
    explanation: "Exhibits hostility, calls travel photos boring/stupid, and aggressively tells the user to go away.",
    suggestion: "Refuse nicely: 'I prefer seeing more local cultural stories rather than standard sunrise photos.'",
    moderator: "Gemini LLM Shield",
    executionTimeMs: 185
  },

  // Comments for Post 3 (Karthik Movies Telugu)
  {
    id: "cmt-8",
    postId: "post-3",
    author: {
      name: "మోహన్ కుమార్",
      handle: "@mohan_k",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    timestamp: "3 hours ago",
    text: "నిజమే కార్తీక్ గారు, కథలో కొత్తదనం ఉంటేనే ప్రేక్షకులు థియేటర్లకి వస్తున్నారు. ఇటీవల కాలంలో వచ్చిన చిన్న బడ్జెట్ సినిమాలు దీనికి చక్కని నిదర్శనం!",
    isNegative: false,
    severity: 3,
    sentiment: "positive",
    category: "positive_feedback",
    explanation: "Polite Telugu compliment, agrees with the post's core movie debate constructively.",
    moderator: "Gemini LLM Shield",
    executionTimeMs: 125
  },
  {
    id: "cmt-9",
    postId: "post-3",
    author: {
      name: "సంతోష్ నాయుడు",
      handle: "@santosh_n",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    },
    timestamp: "2 hours ago",
    text: "సినిమా గురించిన ఈ చెత్త పోస్ట్ లు వేయడం ఆపు. నీకు అస్సలు సినిమా సెన్స్ లేదు, మూసుకో!",
    isNegative: true,
    severity: 98,
    sentiment: "negative",
    category: "harassment",
    explanation: "Extremely hostile in Telugu. Insults the poster saying they lack movie sense (chetta) and tells them to shut up (moosuko).",
    suggestion: "గౌరవంగా అడగండి: 'వ్యక్తిగతంగా నాకు కొన్ని కథలు మాత్రమే నచ్చాయి, సాధారణ చర్చల్లో మీలాంటి అభిప్రాయమే ఉండాలని లేదు.'",
    moderator: "Gemini LLM Shield",
    executionTimeMs: 220
  },

  // Comments for Post 4 (Shravya Food Telugu)
  {
    id: "cmt-10",
    postId: "post-4",
    author: {
      name: "లక్ష్మి ప్రసన్న",
      handle: "@laxmi_p",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    },
    timestamp: "5 hours ago",
    text: "ఆహా! ఆవకాయ పచ్చడి పేరు చెప్తేనే నోరు ఊరుతోంది. నా ఫేవరెట్ ఎప్పటికీ ముద్దపప్పు మరియు ఆవకాయే! శ్రావ్య గారు చాలా మంచి పోస్ట్ షేర్ చేశారు.",
    isNegative: false,
    severity: 2,
    sentiment: "positive",
    category: "positive_feedback",
    explanation: "Lovely Telugu post appreciation celebrating local traditional dishes politely.",
    moderator: "Gemini LLM Shield",
    executionTimeMs: 115
  },
  {
    id: "cmt-11",
    postId: "post-4",
    author: {
      name: "స్పామ్_రాజు",
      handle: "@spam_raju",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80"
    },
    timestamp: "1 hour ago",
    text: "💸 ఫోన్లలో సులభంగా 10,000 సంపాదించడానికి ఈ రోజే ఇక్కడ క్లిక్ చేయండి! నా ప్రొఫైల్ లింక్ చూడండి! రూపాయి ఖర్చు లేకుండా ఫ్రీగా పాల్గొనండి! 💸",
    isNegative: true,
    severity: 89,
    sentiment: "negative",
    category: "spam",
    explanation: "Clear monetary promotional scam text in Telugu targeting readers with bogus profiles link.",
    moderator: "Local Sentiment Heuristics",
    executionTimeMs: 3
  }
];
