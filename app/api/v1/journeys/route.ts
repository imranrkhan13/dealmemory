import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { journeysForPrefixes } from "@/lib/intelligence";

export async function GET(req: NextRequest) {
  const { userId } = await requireAuth();

  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId") ?? undefined;

  // Never trust client-provided projectKey/userId; derive allowed prefixes by ownership
  let prefixes: string[] = [];

  if (projectId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const keys = await prisma.projectApiKey.findMany({
      where: { projectId: projectId, revokedAt: null },
      select: { keyPrefix: true },
    });
    prefixes = keys.map((k) => k.keyPrefix);
  } else {
    const keys = await prisma.projectApiKey.findMany({
      where: { project: { ownerId: userId }, revokedAt: null },
      select: { keyPrefix: true },
    });
    prefixes = keys.map((k) => k.keyPrefix);
  }

  const data = await journeysForPrefixes(prefixes);

  return NextResponse.json({
    journeys: data,
  });
}