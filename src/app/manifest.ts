import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'FcuK Academia',
    short_name: 'FcuK',
    description: 'the future of rebellious learning',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'window-controls-overlay'],
    orientation: 'portrait',
    background_color: '#080402',
    theme_color: '#f5a24f',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
