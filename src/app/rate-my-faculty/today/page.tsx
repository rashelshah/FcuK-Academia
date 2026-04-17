import React from 'react';
import { getTodayRatings } from '@/lib/server/rmf';
import TodayClient from './TodayClient';

export const dynamic = 'force-dynamic';
export const revalidate = 30; // Feed updates every 30s

export default async function RmfTodayPage() {
  const ratings = await getTodayRatings();

  return <TodayClient initialRatings={ratings} />;
}
