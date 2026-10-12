import { NextResponse } from 'next/server';

// Proxy endpoint to serve a Vercel Blob by id. This endpoint fetches the
// blob from Vercel using the server-side `VERCEL_TOKEN` and streams it to
// the client. This allows returning a stable public URL without exposing
// the token.

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Missing blob id' }, { status: 400 });
    }

    const token = process.env.VERCEL_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Server misconfiguration: missing VERCEL_TOKEN' }, { status: 500 });
    }

    const resp = await fetch(`https://api.vercel.com/v1/edge/blobs/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: 'Failed fetching blob from Vercel', detail: text }, { status: 502 });
    }

    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    const body = await resp.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Cache for a short while — tune as needed
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to proxy blob', message: String(err) }, { status: 500 });
  }
}
