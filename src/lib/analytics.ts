'use client';

type EventParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    __gaInitialized?: boolean;
    __gaLastTrackedPagePath?: string;
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

export function isGAEnabled() {
  return typeof window !== 'undefined' && Boolean(GA_MEASUREMENT_ID);
}

export function getGAMeasurementId() {
  return GA_MEASUREMENT_ID;
}

export function trackPageView(path: string) {
  if (!isGAEnabled() || !path) return;

  if (window.__gaLastTrackedPagePath === path) return;

  window.__gaLastTrackedPagePath = path;

  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  } else {
    // If gtag is not ready yet, push directly to dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}

export function trackEvent(name: string, params: EventParams = {}) {
  if (!isGAEnabled() || !name) return;

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...params });
  }
}
