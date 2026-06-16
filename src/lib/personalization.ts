import { PERSONALITY_COPY_VERSION, PersonalityMode, personalityContent } from '@/config/personality';

/**
 * Generates a stable integer index for a user based on a given section salt.
 * Ensures that a user always sees the same variant for a particular section/version.
 */
export function getStableVariantIndex(userId: string | undefined, salt: string, maxItems: number): number {
  if (maxItems <= 1) return 0;
  
  const seed = `${userId || 'anonymous'}-${salt}`;
  const hash = [...seed].reduce((total, char, index) => total + (char.charCodeAt(0) * (index + 1)), 0);
  
  return hash % maxItems;
}

export interface PersonalityCopyContext {
  mode: PersonalityMode;
  user?: {
    id?: string;
    regNumber?: string;
    name?: string;
  } | null;
}

/**
 * Resolves the localized copy for the given mode and user.
 * It computes the stable variant for each text section to provide a full layout configuration.
 */
export function getPersonalityCopy({ mode, user }: PersonalityCopyContext) {
  const content = personalityContent[mode] || personalityContent.fcuk_academia;
  const userId = user?.id || user?.regNumber;
  const firstName = user?.name?.split(' ')[0]?.trim() || 'student';
  const profileName = firstName ? `${firstName.charAt(0).toUpperCase()}${firstName.slice(1).toLowerCase()}` : 'Student';

  const greetingIndex = getStableVariantIndex(userId, `${mode}-greeting-v${PERSONALITY_COPY_VERSION}`, content.home.greetings.length);
  const footerIndex = getStableVariantIndex(userId, `${mode}-footer-v${PERSONALITY_COPY_VERSION}`, content.footer.messages.length);
  const footerSubIndex = getStableVariantIndex(userId, `${mode}-footer-sub-v${PERSONALITY_COPY_VERSION}`, content.footer.submessages.length);
  const marksTitleIndex = getStableVariantIndex(userId, `${mode}-marks-title-v${PERSONALITY_COPY_VERSION}`, content.marks.bannerTitle.length);
  const marksSubtitleIndex = getStableVariantIndex(userId, `${mode}-marks-subtitle-v${PERSONALITY_COPY_VERSION}`, content.marks.bannerSubtitle.length);
  const attGoodIndex = getStableVariantIndex(userId, `${mode}-att-good-v${PERSONALITY_COPY_VERSION}`, content.attendance.bannerTitleGood.length);
  const attBadIndex = getStableVariantIndex(userId, `${mode}-att-bad-v${PERSONALITY_COPY_VERSION}`, content.attendance.bannerTitleBad.length);

  const rawGreeting = content.home.greetings[greetingIndex] ?? content.home.greetings[0];
  const greeting = rawGreeting.replace('{name}', profileName);

  return {
    home: {
      greeting,
    },
    footer: {
      message: content.footer.messages[footerIndex] ?? content.footer.messages[0],
      submessage: content.footer.submessages[footerSubIndex] ?? content.footer.submessages[0],
    },
    marks: {
      bannerTitle: content.marks.bannerTitle[marksTitleIndex] ?? content.marks.bannerTitle[0],
      bannerSubtitle: content.marks.bannerSubtitle[marksSubtitleIndex] ?? content.marks.bannerSubtitle[0],
    },
    attendance: {
      bannerTitleGood: content.attendance.bannerTitleGood[attGoodIndex] ?? content.attendance.bannerTitleGood[0],
      bannerTitleBad: content.attendance.bannerTitleBad[attBadIndex] ?? content.attendance.bannerTitleBad[0],
    },
  };
}
