import React from 'react';
import { getFacultyDetails } from '@/lib/server/rmf';
import FacultyDetailClient from './FacultyDetailClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

export default async function FacultyDetailPage({ 
  params 
}: { 
  params: Promise<{ facultyId: string }> 
}) {
  const { facultyId } = await params;
  
  if (!facultyId) {
    return notFound();
  }

  const data = await getFacultyDetails(facultyId);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center p-8 bg-[var(--surface-elevated)] border border-red-500/20 rounded-2xl">
          <p className="text-red-400 font-medium">Faculty not found</p>
        </div>
      </div>
    );
  }

  // Next.js will prefetch this data when the user hovers a faculty card
  return <FacultyDetailClient faculty={data.faculty} reviews={data.reviews} />;
}
