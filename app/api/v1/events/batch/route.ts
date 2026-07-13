import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { activationEventSchema } from "@/packages/shared/src/events";
import { ingest } from "@/lib/intelligence";
import { validProjectKey } from "@/lib/projects";
import { error, ok } from "@/lib/api";

const schema = z.object({
    events: z.array(activationEventSchema).min(1).max(100),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:3001",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-project-key",
};

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
    });
}

export async function POST(req: NextRequest) {
    const key = req.headers.get("x-project-key");

    const body = schema.safeParse(await req.json());

    if (!key || !(await validProjectKey(key))) {
        const res = error("Invalid project API key.", 401);
        Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
        return res;
    }

    if (!body.success) {
        const res = error(body.error.issues[0].message);
        Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
        return res;
    }

    if (body.data.events.some((e) => e.projectKey !== key)) {
        const res = error("Project key does not match event tenant.", 403);
        Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
        return res;
    }

    const res = ok(await ingest(body.data.events));
    Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
    return res;
}