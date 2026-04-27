import React, { Suspense } from 'react';
import { getRmfFaculties, RMF_MAINTENANCE_MODE } from '@/lib/server/rmf';
import FacultyListClient from './FacultyListClient';
import FacultyListLoading from './loading';
import { RmfMaintenance } from '@/components/rmf/RmfMaintenance';

// Cache handled by unstable_cache in rmf.ts (5 min + tag-based instant purge)
// Do NOT use force-dynamic — it defeats the cache

async function FacultyList() {
  if (RMF_MAINTENANCE_MODE) return <RmfMaintenance />;
  
  const data = await getRmfFaculties();
  return (
    <FacultyListClient 
      initialFaculties={data.faculties || []} 
      college={'college' in data ? data.college : null} 
    />
  );
}

export default function RateMyFacultyPage() {
  return (
    <Suspense fallback={<FacultyListLoading />}>
      <FacultyList />
    </Suspense>
  );
}
