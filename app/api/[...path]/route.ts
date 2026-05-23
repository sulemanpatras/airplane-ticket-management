import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://java-application-production-b3af.up.railway.app/api';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
  'Access-Control-Max-Age': '86400',
};

// Handle preflight OPTIONS requests immediately – no need to hit Railway
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

async function proxyRequest(req: NextRequest, method: string): Promise<NextResponse> {
  const { pathname, search } = new URL(req.url);

  // Strip the leading /api prefix added by Next.js routing
  const backendPath = pathname.replace(/^\/api/, '');
  const targetUrl = `${BACKEND_URL}${backendPath}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    // Skip host header – it would confuse the Railway backend
    if (key.toLowerCase() !== 'host') {
      headers.set(key, value);
    }
  });

  const body =
    method !== 'GET' && method !== 'HEAD' ? await req.arrayBuffer() : undefined;

  const backendRes = await fetch(targetUrl, {
    method,
    headers,
    body,
  });

  const resBody = await backendRes.arrayBuffer();

  const resHeaders = new Headers(CORS_HEADERS);
  backendRes.headers.forEach((value, key) => {
    // Don't override our CORS headers with whatever Railway returns
    if (!key.toLowerCase().startsWith('access-control-')) {
      resHeaders.set(key, value);
    }
  });

  return new NextResponse(resBody, {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: resHeaders,
  });
}

export async function GET(req: NextRequest) {
  return proxyRequest(req, 'GET');
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, 'POST');
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req, 'PUT');
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req, 'DELETE');
}

export async function PATCH(req: NextRequest) {
  return proxyRequest(req, 'PATCH');
}
