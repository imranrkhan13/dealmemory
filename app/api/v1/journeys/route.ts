import { NextRequest, NextResponse } from "next/server";
import { journeys } from "@/lib/intelligence";

export async function GET(req: NextRequest) {
  try {
    const projectKey =
      new URL(req.url).searchParams.get("projectKey") ?? undefined;

    const data = await journeys(projectKey);

    return NextResponse.json({
      journeys: data,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        journeys: [],
        error: err instanceof Error ? err.message : "Unknown error",
      },
      {
        status: 200, // TEMPORARY for demo
      }
    );
  }
}