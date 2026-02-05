import { NextRequest, NextResponse } from 'next/server';

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

async function handler(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const joinedPath = path.join('/');
  const incomingUrl = new URL(req.url);

  const apiBaseUrl = process.env.CALLSOFT_API_BASE_URL || 'http://localhost:64231';
  const targetUrl = new URL(joinUrl(apiBaseUrl, joinedPath));
  targetUrl.search = incomingUrl.search;

  const headers = new Headers(req.headers);
  headers.delete('host');
  // Remove hop-by-hop headers that Node fetch/undici rejects.
  headers.delete('connection');
  headers.delete('keep-alive');
  headers.delete('proxy-connection');
  headers.delete('transfer-encoding');
  headers.delete('upgrade');
  // Avoid 304/conditional responses for volatile endpoints.
  headers.delete('if-none-match');
  headers.delete('if-modified-since');
  headers.delete('if-match');
  headers.delete('if-unmodified-since');

  const incomingAuth = headers.get('authorization');
  if (!incomingAuth) {
    const apiKey = process.env.CALLSOFT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'CALLSOFT_API_KEY não configurada no server (.env.local)' },
        { status: 500 },
      );
    }
    headers.set('authorization', `Bearer ${apiKey}`);
  }

  const method = req.method.toUpperCase();
  const isQrEndpoint = joinedPath.endsWith('/whatsapp/qr') || joinedPath === 'api/v1/whatsapp/qr';
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await req.arrayBuffer();

  const upstream = await fetch(targetUrl.toString(), {
    method,
    headers,
    body: body && body.byteLength ? body : undefined,
    redirect: 'manual',
    cache: isQrEndpoint ? 'no-store' : undefined,
  });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('content-encoding');
  if (isQrEndpoint) {
    responseHeaders.set('cache-control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    responseHeaders.set('pragma', 'no-cache');
    responseHeaders.set('expires', '0');
  }

  return new NextResponse(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, context: any) {
  return handler(req, context);
}
export async function POST(req: NextRequest, context: any) {
  return handler(req, context);
}
export async function PUT(req: NextRequest, context: any) {
  return handler(req, context);
}
export async function PATCH(req: NextRequest, context: any) {
  return handler(req, context);
}
export async function DELETE(req: NextRequest, context: any) {
  return handler(req, context);
}
export async function OPTIONS(req: NextRequest, context: any) {
  return handler(req, context);
}
