import { NextResponse } from "next/server";

import { processAtlasRequest, tenantRegistry } from "@/lib/atlas";
import type { TenantId } from "@/lib/atlas";

interface AtlasRequestBody {
  requestText: string;
  tenantId?: TenantId;
}

function isValidBody(body: unknown): body is AtlasRequestBody {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const candidate = body as Record<string, unknown>;
  if (typeof candidate.requestText !== "string" || candidate.requestText.trim().length === 0) {
    return false;
  }

  if (candidate.tenantId !== undefined) {
    if (typeof candidate.tenantId !== "string" || !(candidate.tenantId in tenantRegistry)) {
      return false;
    }
  }

  return true;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      { error: "requestText is required and must be a non-empty string; tenantId, if provided, must be a known tenant." },
      { status: 400 },
    );
  }

  const result = processAtlasRequest({
    requestText: body.requestText,
    tenantId: body.tenantId,
  });

  return NextResponse.json(result);
}
