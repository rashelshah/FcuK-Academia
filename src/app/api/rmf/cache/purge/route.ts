import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

/**
 * Developer utility to manually clear ALL RMF caches.
 * 
 * Usage:
 *   /api/rmf/cache/purge           → purge everything
 *   /api/rmf/cache/purge?id=abc    → purge a specific faculty too
 * 
 * IMPORTANT: After deleting reviews/ratings directly in the database,
 * you MUST visit this endpoint on the PRODUCTION URL to clear Vercel's
 * persistent Data Cache. Localhost clears automatically on restart.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const facultyId = url.searchParams.get('id');

    // Nuclear option: purge ALL RMF cache entries at once
    // This tag is shared across every unstable_cache call in rmf.ts
    revalidateTag('rmf-all', 'default');

    // Also purge individual tags for good measure
    revalidateTag('rmf-faculties', 'default');
    revalidateTag('rmf-college', 'default');
    revalidateTag('rmf-today', 'default');

    // If a specific faculty ID was provided, purge that too
    if (facultyId) {
      revalidateTag(`faculty-${facultyId}`, 'default');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'ALL RMF caches purged. Every page will fetch fresh data on next visit.',
      purgedFacultyId: facultyId || 'all',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
