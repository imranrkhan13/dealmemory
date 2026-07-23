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
        <p className="text-sm font-semibold text-[#4F46E5]">Product actions, made clear</p>
        <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-bold tracking-[-.045em] md:text-6xl">
          See what users do in your product — without becoming an analytics expert.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#666]">
          AgentLens turns real user actions into a calm, founder-friendly view of what is working, where people stop, and what to do next.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-primary" href="/signup">
            Create my workspace
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
                title="Create your workspace"
                text="Sign in and AgentLens creates a project with a public key ready for your product."
              />
              <Step
                n="02"
                title="Copy the setup into your app"
                text="Choose npm or pip in Settings. Your project key and a ready-to-copy snippet are waiting there."
              />
              <Step
                n="03"
                title="Watch actions arrive"
                text="See page views, clicks, forms, and the important events you choose — organized into user journeys."
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
                  “I opened the report builder and exported my first report.”
                </p>
                <div className="mt-4 rounded-lg border-l-2 border-[#F59E0B] bg-[#FFFBEB] p-3 text-sm">
                  <b className="text-[#B45309]">Signal:</b>{" "}
                  Export completed after a second visit.
                </div>
                <Link className="btn btn-primary mt-4 w-full" href="/demo">
                  See a live example
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
            q="Do I need to be technical to use AgentLens?"
            a={
              <>
                No. Create a workspace, then give the ready-to-copy npm or pip snippet to whoever maintains your app. Once it is installed, your dashboard starts filling with real actions.
              </>
            }
          />
          <FAQItem
            q="How does my app connect?"
            a={
              <>
                AgentLens gives each project a public <code>pk_</code> key. Paste that key into the setup snippet in Settings. Your dashboard login and project key are kept separate.
              </>
            }
          />
          <FAQItem
            q="Will it record private customer data?"
            a={
              <>
                No. It does not collect passwords, form values, arbitrary page text, screen recordings, or session replay. It records safe action metadata and the events you explicitly send.
              </>
            }
          />
          <FAQItem
            q="What can I see after installation?"
            a={
              <>
                A live feed of incoming actions, every user’s chronological journey, activation signals, and the users who may need attention.
              </>
            }
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link className="btn btn-primary" href="/signup">
            Create my workspace
          </Link>
          <Link className="btn" href="/auth/signin">
            I already have an account
          </Link>
          <span className="text-sm text-[#666]">No analytics setup project required.</span>
        </div>
      </section>
    </main>
  );
}
