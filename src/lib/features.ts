export const FEATURES = {
  WHATSAPP_COMMUNITY_POPUP: process.env.NEXT_PUBLIC_ENABLE_COMMUNITY_POPUP !== 'false',
};

export const WHATSAPP_COMMUNITY_POPUP_CONFIG = {
  sessionKey: 'hasSeenCommunityPopup',
  cooldownKey: 'lastCommunityPopupShownAt',
  cooldownMs: 24 * 60 * 60 * 1000,
  whatsappUrl: 'https://chat.whatsapp.com/GxFXJHIpgWw6APJuYpGKjF',
} as const;
