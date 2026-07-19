import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginClient from "@/app/login/LoginClient";
import { getCurrentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string };
}) {
  const session = await getCurrentSession();

  if (session?.user) {
    const raw = searchParams?.callbackUrl;
    const safe =
      raw && raw.startsWith("/") && !raw.startsWith("/auth") ? raw : "/overview";
    redirect(safe);
  }

  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}