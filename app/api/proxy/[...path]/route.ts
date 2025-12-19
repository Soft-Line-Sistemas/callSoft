import { NextRequest, NextResponse } from 'next/server';

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

async function handler(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const incomingUrl = new URL(req.url);

  const apiBaseUrl = process.env.CALLSOFT_API_BASE_URL || 'http://localhost:64231';
  const targetUrl = new URL(joinUrl(apiBaseUrl, path.join('/')));
  targetUrl.search = incomingUrl.search;

  const headers = new Headers(req.headers);
  headers.delete('host');
  // Remove hop-by-hop headers that Node fetch/undici rejects.
  headers.delete('connection');
  headers.delete('keep-alive');
  headers.delete('proxy-connection');
  headers.delete('transfer-encoding');
  headers.delete('upgrade');

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
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await req.arrayBuffer();

  const upstream = await fetch(targetUrl.toString(), {
    method,
    headers,
    body: body && body.byteLength ? body : undefined,
    redirect: 'manual',
  });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('content-encoding');

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
