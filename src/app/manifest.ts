import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FcuK Academia',
    short_name: 'FcuK',
    description: 'the future of rebellious learning',
    start_url: '/',
    display: 'standalone',
    background_color: '#080402',
    theme_color: '#f5a24f',
    icons: [
      {
        src: '/icons/android%20logo.jpeg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any',
      },
      {
        src: '/icons/android%20logo.jpeg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
      {
        src: '/icons/browser%20logo.jpeg',
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'any',
      },
    ],
  };
}
