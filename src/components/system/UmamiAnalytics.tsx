'use client';

import Script from 'next/script';

export default function UmamiAnalytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || '10ba5aca-2e0b-42fd-a6bc-c8d42e712764';

  if (!websiteId) {
    return null;
  }

  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={websiteId}
      strategy="afterInteractive"
      defer
    />
  );
}
