import Link from "next/link";

export const dynamic = "force-dynamic";

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <span className="mono pt-0.5 text-xs text-[#999]">{n}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-[#666]">{text}</p>
      </div>
    </div>
  );
}

function FAQItem({
  q,
  a,
}: {
  q: string;
  a: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#E8E7E3] bg-white p-4">
      <p className="font-medium">{q}</p>
      <div className="mt-2 text-sm leading-6 text-[#666]">{a}</div>
    </div>
  );
}

export default function Page() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-20 text-center md:pt-28">
        <p className="text-sm font-semibold text-[#4F46E5]">The activation layer for AI SaaS</p>
        <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-bold tracking-[-.045em] md:text-6xl">
          Help trial users reach value, then ask them to pay.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#666]">
          DealMemory remembers a user’s goal and where they got stuck, so they can resume progress
          instead of restarting from zero.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-primary" href="/signup">
            Get started — Free
          </Link>
          <Link className="btn" href="/auth/signin">
            Sign in
          </Link>
          <Link className="btn" href="/pricing">
            Pricing
          </Link>
        </div>
      </section>

      {/* Simple process */}
      <section className="border-y border-[#E8E7E3] bg-white">
        <div className="mx-auto grid max-w-6xl px-5 py-12 md:grid-cols-2 md:gap-8">
          <div className="md:border-r md:border-[#E8E7E3] md:pr-8">
            <p className="text-sm font-semibold text-[#4F46E5]">A clear path</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Three steps to value</h2>
            <div className="mt-8 space-y-6">
              <Step
                n="01"
                title="Sign up and create your first project"
                text="Start with a founder account and an auto-created project. You’ll receive one-time onboarding keys to integrate quickly."
              />
              <Step
                n="02"
                title="Integrate the SDK and start remembering"
                text="Send user goals and key events. DealMemory captures intent and blockers so users can resume from where they left off."
              />
              <Step
                n="03"
                title="Guide users to first success — then monetize"
                text="Gate paywalls behind real outcomes. Once a user achieves their first success, prompt a contextual upgrade."
              />
            </div>
          </div>

          <div className="mt-10 md:mt-0 md:pl-8">
            <div className="rounded-xl border border-[#E8E7E3] bg-[#FAFAF8] p-6">
              <div className="mx-auto max-w-md rounded-lg border border-[#E8E7E3] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Trial session</span>
                  <span className="rounded-full bg-[#EEF2FF] px-2 py-1 text-[11px] font-semibold text-[#4F46E5]">
                    Remembered
                  </span>
                </div>
                <p className="mt-5 text-sm leading-6">
                  “I want to generate an architecture map from my GitHub repository.”
                </p>
                <div className="mt-4 rounded-lg border-l-2 border-[#F59E0B] bg-[#FFFBEB] p-3 text-sm">
                  <b className="text-[#B45309]">Blocker:</b>{" "}
                  OAuth callback could not be verified.
                </div>
                <Link className="btn btn-primary mt-4 w-full" href="/demo">
                  Resume setup
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-sm font-semibold text-[#4F46E5]">FAQ</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">Common questions</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <FAQItem
            q="How does DealMemory remember a user’s goal?"
            a={
              <>
                You can send the initial user intent (goal) and key onboarding events via our SDK.
                If a session is interrupted, the goal and most recent blocker are recalled on return.
              </>
            }
          />
          <FAQItem
            q="Is authentication required to integrate?"
            a={
              <>
                Yes. All dashboard and project APIs require an authenticated session. SDK ingestion
                uses project keys that are verified server-side; never trust client-provided IDs.
              </>
            }
          />
          <FAQItem
            q="What if a user gets stuck during OAuth or setup?"
            a={
              <>
                DealMemory records the failed step as a blocker and surfaces the exact next action
                to resume — no need to start over.
              </>
            }
          />
          <FAQItem
            q="When should I show pricing or a paywall?"
            a={
              <>
                After the first successful outcome. The upgrade prompt appears contextually once a
                user reaches value.
              </>
            }
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link className="btn btn-primary" href="/signup">
            Create founder account
          </Link>
          <Link className="btn" href="/auth/signin">
            I already have an account
          </Link>
          <span className="text-sm text-[#666]">Questions? See Pricing or start the guided demo.</span>
        </div>
      </section>
    </main>
  );
}