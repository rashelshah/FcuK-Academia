import React from 'react';
import { getTodayRatings } from '@/lib/server/rmf';
import TodayClient from './TodayClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TodayPage() {
  const ratings = await getTodayRatings();
  
  return <TodayClient initialRatings={ratings} />;
}
