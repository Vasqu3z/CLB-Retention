import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: /api/revalidate
 *
 * Invalidates Next.js cache when called by Apps Script after stats updates.
 * This ensures users see fresh data immediately instead of waiting up to 60 seconds.
 *
 * Usage from Apps Script:
 * POST /api/revalidate
 * Body: { secret: "your-secret-key", tag: "sheets" }
 *
 * Security:
 * - Requires REVALIDATE_SECRET environment variable to match the secret in request
 * - Returns 401 if secret is invalid or missing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, tag } = body;

    // Validate secret
    const expectedSecret = process.env.REVALIDATE_SECRET;

    if (!expectedSecret) {
      console.error('REVALIDATE_SECRET environment variable not configured');
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!secret || secret !== expectedSecret) {
      console.warn('Invalid revalidation secret attempted');
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      );
    }

    // Revalidate the specified tag (or default to 'sheets')
    const tagToRevalidate = tag || 'sheets';
    revalidateTag(tagToRevalidate);

    console.log(`Cache revalidated for tag: ${tagToRevalidate}`);

    return NextResponse.json({
      revalidated: true,
      tag: tagToRevalidate,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error processing revalidation request' },
      { status: 500 }
    );
  }
}

// Method not allowed for other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
