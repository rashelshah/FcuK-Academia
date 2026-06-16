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
  },
  girlie_pop: {
    home: {
      greetings: [
        'you’ve got this, bestie 💅',
        'attendance glow-up pending ✨',
        'slay the semester',
        'hey bestie, you\'re doing amazing 💖',
      ],
    },
    footer: {
      messages: [
        'making college chaos a little more iconic ✨',
        'romanticizing the academic struggle 💅',
        'serving straight A energy ✨',
      ],
      submessages: [
        'romanticizing the grind one day at a time',
        'doing it for the aesthetic ✨',
      ]
    },
    marks: {
      bannerTitle: ['time for a little academic glow-up 💅'],
      bannerSubtitle: ['subjects that need a little more love 💖'],
    },
    attendance: {
      bannerTitleGood: ['attendance check passed bestie ✨'],
      bannerTitleBad: ['attendance needs some love 💖'],
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
  },
  delulu: {
    home: {
      greetings: [
        'A+ energy only ✨',
        'manifesting academic success',
        'you’re definitely passing',
        'the universe is giving you a 10.0',
      ],
    },
    footer: {
      messages: [
        'delulu is the solulu ✨',
        'manifesting distinction for everyone.',
        'what are exams if not a construct?',
      ],
      submessages: [
        'believing in the curve ✨',
        'living in our own academic reality.',
      ]
    },
    marks: {
      bannerTitle: ['comeback season starts now ✨'],
      bannerSubtitle: ['minor setbacks for a major comeback'],
    },
    attendance: {
      bannerTitleGood: ['perfect attendance energy ✨'],
      bannerTitleBad: ['there\'s still time to recover ✨'],
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
  },
};
