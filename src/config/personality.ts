export const PERSONALITY_COPY_VERSION = 1;

export type PersonalityMode = 'fcuk_academia' | 'girlie_pop' | 'sigma' | 'delulu' | 'academic_victim' | 'corporate_hustler' | 'brain_rot';

export interface PersonalityCopy {
  home: {
    greetings: string[];
  };
  footer: {
    messages: string[];
    submessages: string[];
  };
  marks: {
    bannerTitle: string[];
    bannerSubtitle: string[];
  };
  attendance: {
    bannerTitleGood: string[];
    bannerTitleBad: string[];
  };
  notifications: {
    upcomingClass: { title: string; message: string };
    attendanceWarning: { title: string; message: string };
    marksGood: { title: string; message: string };
    marksBad: { title: string; message: string };
  };
}

export const personalityContent: Record<PersonalityMode, PersonalityCopy> = {
  fcuk_academia: {
    home: {
      greetings: [
        'you made it, {name}',
        'ready to suffer, {name}?',
        'lock in, {name}',
        'still alive, {name}',
        'cooked yet, {name}?',
        'FcuKed yet, {name}?',
        "don't fail today, {name}",
      ],
    },
    footer: {
      messages: [
        'Study. Survive. Repeat.',
        'Still Passing?',
        'Stay Cooked!',
        "Don’t Fail.",
        'Barely Surviving.',
        'Academically Alive.',
        'Built to Survive.',
      ],
      submessages: [
        "crafted to make the SRM grind feel a little less brutal",
        "your daily academic survival toolkit",
        "because SRM wasn't hard enough already",
        "helping students survive one semester at a time"
      ]
    },
    marks: {
      bannerTitle: ["you're FcuKed"],
      bannerSubtitle: ['subjects requiring immediate trauma recovery'],
    },
    attendance: {
      bannerTitleGood: ['you survived (for now)'],
      bannerTitleBad: ["you're cooked"],
    },
    notifications: {
      upcomingClass: { title: 'class radar', message: '📚 Bhai uth ja… 30 min mein {subject} hai 💀' },
      attendanceWarning: { title: 'attendance cooked alert', message: '⚠️ Pushpa jhukega nahi… par tera attendance jhuk gaya hai 💀' },
      marksGood: { title: 'marks just dropped', message: '🔥 Aaj khush toh bahut hoge tum 😏' },
      marksBad: { title: 'marks just dropped', message: '💀 This too shall pass...' },
    },
  },
  girlie_pop: {
    home: {
      greetings: [
        'you’ve got this, bestie',
        'attendance glow-up pending',
        'slay the semester',
        'hey bestie, you\'re doing amazing',
      ],
    },
    footer: {
      messages: [
        'making college chaos a little more iconic',
        'romanticizing the academic struggle',
        'serving straight A energy',
      ],
      submessages: [
        'romanticizing the grind one day at a time',
        'doing it for the aesthetic',
      ]
    },
    marks: {
      bannerTitle: ['time for a little academic glow-up'],
      bannerSubtitle: ['subjects that need a little more love'],
    },
    attendance: {
      bannerTitleGood: ['attendance check passed bestie'],
      bannerTitleBad: ['attendance needs some love'],
    },
    notifications: {
      upcomingClass: { title: 'class time bestie ✨', message: '💅 time to romanticize {subject} in 30 mins' },
      attendanceWarning: { title: 'attendance emergency 🚨', message: '✨ bestie your attendance is giving drop-out energy, please fix it' },
      marksGood: { title: 'academic weapon 💅', message: '✨ slaying those marks bestie, we love to see it' },
      marksBad: { title: 'minor setback 💖', message: '💅 it\'s okay bestie, we\'re doing it for the plot anyway' },
    },
  },
  sigma: {
    home: {
      greetings: [
        'stay locked in',
        'progress detected',
        'optimize your performance',
        'stay focused, {name}',
      ],
    },
    footer: {
      messages: [
        'built for academic efficiency.',
        'pure discipline. zero distractions.',
        'optimization mode active.',
      ],
      submessages: [
        'eliminate distractions. maximize output.',
        'systematic academic performance.',
      ]
    },
    marks: {
      bannerTitle: ['subjects requiring optimization'],
      bannerSubtitle: ['metrics below acceptable threshold'],
    },
    attendance: {
      bannerTitleGood: ['attendance metrics optimal'],
      bannerTitleBad: ['attendance below target threshold'],
    },
    notifications: {
      upcomingClass: { title: 'schedule alert', message: '🗿 {subject} commences in 30 minutes. stay locked in.' },
      attendanceWarning: { title: 'metrics warning', message: '⚠️ attendance below optimal threshold. immediate action required.' },
      marksGood: { title: 'performance optimal', message: '📈 marks updated. acceptable optimization level achieved.' },
      marksBad: { title: 'performance deficit', message: '📉 unacceptable metrics. optimize your study routine immediately.' },
    },
  },
  delulu: {
    home: {
      greetings: [
        'A+ energy only',
        'manifesting academic success',
        'you’re definitely passing',
        'the universe is giving you a 10.0',
      ],
    },
    footer: {
      messages: [
        'delulu is the solulu',
        'manifesting distinction for everyone.',
        'what are exams if not a construct?',
      ],
      submessages: [
        'believing in the curve',
        'living in our own academic reality.',
      ]
    },
    marks: {
      bannerTitle: ['comeback season starts now'],
      bannerSubtitle: ['minor setbacks for a major comeback'],
    },
    attendance: {
      bannerTitleGood: ['perfect attendance energy'],
      bannerTitleBad: ['there\'s still time to recover'],
    },
    notifications: {
      upcomingClass: { title: 'manifesting a class ✨', message: '🔮 {subject} in 30 mins (if it even exists)' },
      attendanceWarning: { title: 'energy check ✨', message: '⚠️ the universe is telling you to attend class (or not, trust the curve)' },
      marksGood: { title: 'manifestation successful', message: '✨ I literally manifested this. A+ energy.' },
      marksBad: { title: 'marks illusion ✨', message: '💀 these marks are just a social construct anyway' },
    },
  },
  academic_victim: {
    home: {
      greetings: [
        'barely surviving',
        'another semester, another trauma',
        'we’ll make it somehow',
        'surviving somehow, {name}',
      ],
    },
    footer: {
      messages: [
        'helping students survive one semester at a time.',
        'crying, but passing (hopefully).',
        'fueled by caffeine and panic.',
      ],
      submessages: [
        'it’s fine. everything is fine.',
        'send help (or notes).',
      ]
    },
    marks: {
      bannerTitle: ['emotional damage detected'],
      bannerSubtitle: ['results may cause spontaneous crying'],
    },
    attendance: {
      bannerTitleGood: ['barely scraping by'],
      bannerTitleBad: ['may the attendance gods help you'],
    },
    notifications: {
      upcomingClass: { title: 'impending doom', message: '😭 30 mins until {subject}... send help' },
      attendanceWarning: { title: 'academic collapse', message: '⚠️ attendance is ruined. it\'s so over for us.' },
      marksGood: { title: 'miracle occurred', message: '😭 I survived... thank god' },
      marksBad: { title: 'more trauma', message: '💀 just drop me out already' },
    },
  },
  corporate_hustler: {
    home: {
      greetings: [
        'ready to leverage synergies, {name}?',
        'let\'s touch base on your academics',
        'optimizing your college ROI today',
        'hustle never stops, {name}',
      ],
    },
    footer: {
      messages: [
        'B2B SaaS but for surviving college.',
        'Always Be Closing (your assignments).',
        'Disrupting the traditional academic space.',
      ],
      submessages: [
        'let\'s circle back to that failed internal.',
        'networking > studying. change my mind.',
      ]
    },
    marks: {
      bannerTitle: ['Q3 performance review: poor'],
      bannerSubtitle: ['metrics indicate severe lack of synergy'],
    },
    attendance: {
      bannerTitleGood: ['KPIs are looking green'],
      bannerTitleBad: ['we need to talk about your utilization rate'],
    },
    notifications: {
      upcomingClass: { title: 'calendar block', message: '🤝 hard stop in 30 mins for {subject} sync' },
      attendanceWarning: { title: 'kpi warning', message: '⚠️ your attendance utilization rate is severely impacting ROI' },
      marksGood: { title: 'q3 performance excellent', message: '📈 outstanding deliverables on these marks. great synergy.' },
      marksBad: { title: 'performance review needed', message: '📉 we need to circle back on these deliverables' },
    },
  },
  brain_rot: {
    home: {
      greetings: [
        'what the sigma, {name}',
        'absolute cinema today',
        'negative aura detected',
        'bro is definitely edging his degree',
      ],
    },
    footer: {
      messages: [
        'skibidi toilet rizz.',
        'bro is locked in fr fr.',
        'W academics. L attendance.',
      ],
      submessages: [
        'who let bro cook?',
        'just put the fries in the bag.',
      ]
    },
    marks: {
      bannerTitle: ['L rizz on these internals'],
      bannerSubtitle: ['bro thought he cooked 💀'],
    },
    attendance: {
      bannerTitleGood: ['W aura'],
      bannerTitleBad: ['negative 1000 aura'],
    },
    notifications: {
      upcomingClass: { title: 'skibidi radar', message: '🧠 30 mins till {subject}... bro is cooked' },
      attendanceWarning: { title: 'negative aura alert', message: '⚠️ bro\'s attendance is literally giving -10000 aura' },
      marksGood: { title: 'W rizz', message: '🔥 bro actually cooked. massive W.' },
      marksBad: { title: 'L aura', message: '💀 bro is absolutely washed. put the fries in the bag.' },
    },
  },
};
