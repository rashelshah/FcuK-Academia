import { type NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync } from 'fs';
import path from 'path';

// Force Node.js runtime — required to access the filesystem
export const runtime = 'nodejs';

const VIDEO_PATH = path.join(process.cwd(), 'public', 'assets', 'videos', 'splash-ios-final.mp4');

/**
 * Serves the splash video via an /api/ route so it completely bypasses the
 * service worker (the SW explicitly skips all /api/ paths).
 *
 * This fixes the iOS PWA "readyState=0 HAVE_NOTHING" issue caused by the old
 * service worker dropping video fetch events without calling respondWith().
 *
 * Supports Range requests so iOS Safari can load the video progressively.
 */
export async function GET(request: NextRequest) {
  let stats;
  try {
    stats = statSync(VIDEO_PATH);
  } catch {
    return new NextResponse('Video not found', { status: 404 });
  }

  const fileSize = stats.size;
  const rangeHeader = request.headers.get('range');

  if (rangeHeader) {
    // iOS Safari always sends Range requests for video — handle them correctly
    const [startStr, endStr] = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end   = endStr ? parseInt(endStr, 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const stream = createReadStream(VIDEO_PATH, { start, end });
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data',  (chunk) => controller.enqueue(chunk));
        stream.on('end',   ()       => controller.close());
        stream.on('error', (err)    => controller.error(err));
      },
    });

    return new NextResponse(webStream, {
      status: 206,
      headers: {
        'Content-Type':   'video/mp4',
        'Content-Range':  `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': String(chunkSize),
        'Accept-Ranges':  'bytes',
        'Cache-Control':  'public, max-age=86400',
      },
    });
  }

  // Non-range request (initial HEAD or full fetch)
  const stream = createReadStream(VIDEO_PATH);
  const webStream = new ReadableStream({
    start(controller) {
      stream.on('data',  (chunk) => controller.enqueue(chunk));
      stream.on('end',   ()       => controller.close());
      stream.on('error', (err)    => controller.error(err));
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      'Content-Type':   'video/mp4',
      'Content-Length': String(fileSize),
      'Accept-Ranges':  'bytes',
      'Cache-Control':  'public, max-age=86400',
    },
  });
}
