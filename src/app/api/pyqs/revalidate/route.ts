import { NextResponse } from 'next/server';
import { getDriveData } from '@/lib/drive';

/**
 * Manually refreshes the Google Drive cache
 * POST /api/pyqs/revalidate
 */
export async function POST() {
  try {
    console.log('🔄 Revalidation triggered: Clearing cache and fetching fresh data...');
    await getDriveData(true); // Force refresh
    return NextResponse.json({ 
      success: true, 
      message: 'Drive cache refreshed successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('[/api/pyqs/revalidate] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to refresh Drive cache' 
    }, { status: 500 });
  }
}

/**
 * Also support GET for easy manual testing
 */
export async function GET() {
  return POST();
}
