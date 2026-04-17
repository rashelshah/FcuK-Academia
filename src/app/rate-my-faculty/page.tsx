import React from 'react';
import { getRmfFaculties } from '@/lib/server/rmf';
import FacultyListClient from './FacultyListClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RateMyFacultyPage() {
  const data = await getRmfFaculties();
  
  return (
    <FacultyListClient 
      initialFaculties={data.faculties || []} 
      college={data.college || null} 
    />
  );
}
