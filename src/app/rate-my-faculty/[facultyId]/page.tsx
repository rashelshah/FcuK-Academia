import React, { Suspense } from 'react';
import { getFacultyDetails, RMF_MAINTENANCE_MODE } from '@/lib/server/rmf';
import dynamic from 'next/dynamic';
import FacultyDetailLoading from './loading';
import { RmfMaintenance } from '@/components/rmf/RmfMaintenance';
const FacultyDetailClient = dynamic(() => import('./FacultyDetailClient'), {
  loading: () => <FacultyDetailLoading />
});
import { notFound } from 'next/navigation';

// Use the cache from rmf.ts (60s revalidate + tag-based instant purge)
// Do NOT use force-dynamic — it defeats the cache and causes cold fetches on every click

async function FacultyDetails({ facultyId }: { facultyId: string }) {
  if (RMF_MAINTENANCE_MODE) return <RmfMaintenance />;
  
  const data = await getFacultyDetails(facultyId);

  if (!data) {
    notFound();
  }

  return (
    <FacultyDetailClient 
      faculty={data.faculty as any} 
      reviews={data.reviews as any} 
    />
  );
}

export default async function FacultyDetailPage({
  params,
}: {
  params: Promise<{ facultyId: string }>;
}) {
  const { facultyId } = await params;

  return (
    <Suspense fallback={<FacultyDetailLoading />}>
      <FacultyDetails facultyId={facultyId} />
    </Suspense>
  );
}
