import React from 'react';
import { getTodayRatings, RMF_MAINTENANCE_MODE } from '@/lib/server/rmf';
import TodayClient from './TodayClient';
import { RmfMaintenance } from '@/components/rmf/RmfMaintenance';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TodayPage() {
  if (RMF_MAINTENANCE_MODE) return <RmfMaintenance />;
  
  const ratings = await getTodayRatings();
  
  return <TodayClient initialRatings={ratings} />;
}
