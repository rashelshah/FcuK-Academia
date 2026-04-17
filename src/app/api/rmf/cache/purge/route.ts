import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

/**
 * Developer utility to manually clear RMF caches.
 * Useful when making direct database changes via Prisma Studio 
 * that the Next.js Data Cache wouldn't otherwise detect.
 */
export async function GET() {
  try {
    // Purge the main faculty list
    revalidateTag('rmf-faculties', 'default');
    
    // Purge the college info
    revalidateTag('rmf-college', 'default');
    
    // Purge the "Today" live feed
    revalidateTag('rmf-today', 'default');
    
    // Note: Individual faculty details have a 60s revalidate 
    // and will refresh automatically very quickly now.
    
    return NextResponse.json({ 
      success: true, 
      message: 'RMF Cache purged successfully. Production data should now sync with the database.',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
