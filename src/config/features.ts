export const featureFlags = {
  rmfAnnouncement: {
    enabled: false,
    cooldownHours: 24, // Show popup after 24 hours
  },
};

export const WRAP_MODE = process.env.NEXT_PUBLIC_WRAP_MODE === 'true';
