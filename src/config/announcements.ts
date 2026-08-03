export interface AnnouncementConfig {
  id: string;
  title: string;
  description: string;
  video: string;
  thumbnail: string;
  priority: number;
  version: string;
  autoPlay: boolean;
  dismissible: boolean;
  expiresAt?: string;
}

// Ensure you export the configuration that should be currently active.
// Set to null if no announcement should be shown.
export const activeAnnouncement: AnnouncementConfig | null = {
  id: 'customize-timetable',
  title: 'Customize Timetable',
  description: 'Design a learning schedule that perfectly matches your daily routine. Experience rebellious learning on your own terms.',
  video: '/assets/videos/Announcement.json', // Local file path
  thumbnail: '', // You can leave this blank or point it to a real thumbnail later
  priority: 1,
  version: 'fcuk_seenAnnouncement_v1', // Update this to force showing the announcement again
  autoPlay: true,
  dismissible: true,
};
