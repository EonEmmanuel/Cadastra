import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function getBackendBaseUrls(): string[] {
  const configuredBackend =
    process.env.BACKEND_URL ||
    process.env.INTERNAL_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL;

  const urls: string[] = [];
  if (configuredBackend) {
    urls.push(configuredBackend.replace(/\/$/, ""));
  }
  urls.push("http://127.0.0.1:8000");
  urls.push("http://localhost:8000");
  return Array.from(new Set(urls));
}

async function forwardToBackend(
  pathWithQuery: string,
  options: RequestInit
): Promise<Response> {
  const baseUrls = getBackendBaseUrls();
  let lastError: unknown = null;
  for (const base of baseUrls) {
    try {
      const res = await fetch(`${base}${pathWithQuery}`, options);
      return res;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("Impossible de joindre le serveur FastAPI backend.");
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ plan_id: string }> }
) {
  try {
    const { plan_id } = await props.params;
    const cleanId = encodeURIComponent(plan_id);
    const upstreamRes = await forwardToBackend(`/api/report/pdf/${cleanId}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!upstreamRes.ok) {
      const errorText = await upstreamRes.text();
      return new Response(errorText, {
        status: upstreamRes.status,
        headers: {
          "Content-Type": upstreamRes.headers.get("content-type") || "application/json",
        },
      });
    }

    const buffer = await upstreamRes.arrayBuffer();
    if (!buffer || buffer.byteLength === 0) {
      return new Response(
        JSON.stringify({ detail: "Le serveur amont a renvoyé un flux binaire vide (0 octet)." }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const contentDisposition =
      upstreamRes.headers.get("content-disposition") ||
      `attachment; filename="cadastre_audit_${plan_id}.pdf"`;

    return new Response(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
        "Content-Length": String(buffer.byteLength),
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=120",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ detail: error?.message || "Erreur interne lors de la génération PDF." }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function HEAD(
  request: NextRequest,
  props: { params: Promise<{ plan_id: string }> }
) {
  try {
    const { plan_id } = await props.params;
    const cleanId = encodeURIComponent(plan_id);
    const upstreamRes = await forwardToBackend(`/api/report/pdf/${cleanId}`, {
      method: "HEAD",
      cache: "no-store",
    });

    const contentDisposition =
      upstreamRes.headers.get("content-disposition") ||
      `attachment; filename="cadastre_audit_${plan_id}.pdf"`;
    const contentLength = upstreamRes.headers.get("content-length") || "0";

    return new Response(null, {
      status: upstreamRes.status,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
        "Content-Length": contentLength,
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=120",
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
