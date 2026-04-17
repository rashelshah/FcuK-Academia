import React from 'react';
import { getFacultyDetails } from '@/lib/server/rmf';
import FacultyDetailClient from './FacultyDetailClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FacultyDetailPage({
  params,
}: {
  params: Promise<{ facultyId: string }>;
}) {
  const { facultyId } = await params;
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
