import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How DealMemory works · DealMemory',
  description:
    'A plain-English walkthrough of DealMemory: install, tracking, journeys, AI insights, predictions and the API.',
};

const SECTIONS = [
  ['setup', '1. Set it up'],
  ['tracking', '2. How tracking works'],
  ['flow', '3. From event to insight'],
  ['predict', '4. Predictions'],
  ['api', '5. The API'],
  ['dashboard', '6. The dashboard'],
  ['copilot', '7. Ask the AI'],
  ['plans', '8. Plans and limits'],
  ['do', '9. What you do'],
  ['why', '10. Why it works this way'],
  ['rules', '11. Rules and limits'],
] as const;

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-line bg-[#0f1115] p-4 text-[12.5px] leading-relaxed text-[#e6e8ec]">
      <code>{children}</code>
    </pre>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-20 pt-10 text-[22px] font-medium tracking-[-0.02em] text-ink">
      {children}
    </h2>
  );
}

function Box({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-line bg-[#fafafa] p-4">
      <div className="eyebrow mb-1">{label}</div>
      <div className="space-y-2 text-[14px] leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}

function C({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-[#f1f1f1] px-1 py-0.5 font-mono text-[12.5px] text-ink">{children}</code>;
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-[15px] font-medium text-ink">
            DealMemory
          </Link>
          <nav className="flex items-center gap-4 text-[13px] text-ink-soft">
            <Link href="/docs">SDK docs</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/signup" className="font-medium text-ink">
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-10 lg:grid-cols-[200px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-1.5 text-[13px]">
            <div className="eyebrow mb-2">On this page</div>
            {SECTIONS.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="block text-ink-soft hover:text-ink">
                {label}
              </a>
            ))}
          </div>
        </aside>

        <main className="min-w-0 pb-20 text-[14.5px] leading-relaxed text-ink-soft">
          <span className="eyebrow">Guide</span>
          <h1 className="mt-2 text-[32px] font-medium leading-tight tracking-[-0.03em] text-ink">
            How DealMemory works, start to finish
          </h1>
          <p className="mt-3 text-[15px]">
            DealMemory watches what people do inside your SaaS product during a trial. It rebuilds each
            person&apos;s journey, finds where they got stuck, and suggests what to do next. You set it up with
            one API key.
          </p>

          <Box label="Example first">
            <p>
              Picture a shop owner who watches customers walk in. One person picks up a shirt, goes to the
              fitting room, then leaves without buying. The owner notices and thinks: &quot;the fitting room
              line was too long.&quot; DealMemory does this for your app. A user signs up, connects GitHub,
              hits an error, and never comes back. DealMemory shows you that story and says where it broke.
            </p>
          </Box>

          <H2 id="setup">1. Set it up: one key, one command</H2>
          <Box label="Example">
            <p>
              Think of the API key as a name tag. Every event your app sends wears that tag, so DealMemory knows
              the event belongs to your project.
            </p>
          </Box>
          <p className="mt-4 font-medium text-ink">Steps</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Install the SDK (the helper package).</li>
            <li>Run the init command. It writes the tracking code into your files for you.</li>
            <li>Put your key in your <C>.env</C> file. This is the only setting you need.</li>
          </ol>
          <p className="mt-4 font-medium text-ink">The technical version</p>
          <Code>{`# 1. Install the SDK
npm install dealmemory

# 2. Initialize - the CLI writes tracking code into your files
npx dealmemory init

# 3. Add your API key to .env
DEALMEMORY_API_KEY=pk_live_...`}</Code>
          <p className="mt-3">
            There is no <C>projectKey</C> in your code, no <C>apiUrl</C>, and no config object. The CLI detects
            your framework (Next.js pages router, app router, or plain React) and adds the right import and key
            line. You can run <C>npx dealmemory init</C> more than once. The second run changes nothing.
          </p>

          <H2 id="tracking">2. How tracking works</H2>
          <Box label="Example">
            <p>
              Your app asks &quot;what is my name tag?&quot; once, when it starts. It looks in a few places, in
              order, and uses the first one it finds.
            </p>
          </Box>
          <p className="mt-4 font-medium text-ink">Where the SDK looks for the key, in order</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li><C>DEALMEMORY_API_KEY</C> (the main one)</li>
            <li><C>NEXT_PUBLIC_DEALMEMORY_API_KEY</C> (so Next.js can include it in browser code)</li>
            <li><C>DEALMEMORY_KEY</C> (old name, still works)</li>
            <li><C>DEALMEMORY_PROJECT_KEY</C> (old name, still works)</li>
          </ol>
          <p className="mt-4 font-medium text-ink">Events it can track for you</p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {[
              ['user_signed_up', 'account created'],
              ['app_opened', 'the app loads'],
              ['feature_used', 'a core feature is used'],
              ['dashboard_opened', 'the dashboard is viewed'],
              ['project_created', 'a new project is made'],
              ['integration_connect_attempted', 'user tries to connect GitHub or similar'],
              ['integration_connected', 'the connection worked'],
              ['integration_connection_failed', 'the connection failed'],
              ['first_map_generated', 'first visualization made'],
              ['checkout_started', 'user starts a purchase'],
              ['payment_completed', 'payment succeeded (verified webhook)'],
              ['trial_started', 'trial begins'],
            ].map(([n, d]) => (
              <li key={n} className="text-[13.5px]">
                <C>{n}</C> - {d}
              </li>
            ))}
          </ul>
          <p className="mt-3">
            Events are de-duplicated, enriched with user details (email, company, role), and saved to your
            PostgreSQL database through the HTTP API.
          </p>
          <p className="mt-4 font-medium text-ink">Zero-config tracking</p>
          <Code>{`// one line, anywhere that runs on app start
import 'dealmemory/auto'

// or pick what you need
import { track, identify, setGoal } from 'dealmemory'`}</Code>
          <p className="mt-3">
            <C>dealmemory/auto</C> makes one shared client from your environment and starts tracking. The
            functions <C>track</C>, <C>identify</C>, <C>setGoal</C>, <C>page</C>, <C>flush</C> and{' '}
            <C>reset</C> all use that same client. If no key is found, each call quietly does nothing. It never
            throws an error into your code.
          </p>

          <H2 id="flow">3. From event to insight</H2>
          <Box label="Example">
            <p>
              A user clicks &quot;Connect GitHub&quot; and it fails. That click becomes an event, the event is
              stored, the story of that user is rebuilt, and you see &quot;stuck at GitHub connection&quot; with
              a suggested fix.
            </p>
          </Box>
          <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-white p-3 text-center font-mono text-[12.5px] text-ink">
            User event &rarr; SDK &rarr; HTTP API &rarr; PostgreSQL &rarr; Intelligence &rarr; AI recommendations
          </div>

          <h3 className="mt-6 text-[16px] font-medium text-ink">Step 1: Event ingestion</h3>
          <p className="mt-1">
            Events are sent with <C>track(&apos;event_name&apos;, {'{ properties }'})</C> or automatically through{' '}
            <C>dealmemory/auto</C>. Before sending, the SDK:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Makes a SHA256 <C>payloadHash</C> for each event, so the same event is not counted twice.</li>
            <li>
              Removes secrets from URLs and properties. It looks for things like <C>pk_live</C>, <C>sk_live</C>,{' '}
              <C>whsec</C>, Bearer tokens, JWTs, PEM blocks and passwords.
            </li>
            <li>Sends events in batches to <C>/api/v1/events/batch</C>.</li>
          </ul>

          <h3 className="mt-6 text-[16px] font-medium text-ink">Step 2: Journey reconstruction</h3>
          <p className="mt-1">
            The <C>intelligence.ts</C> module rebuilds each user&apos;s journey. It:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Cleans events: removes duplicates by ID and sorts them by time.</li>
            <li>Drops events that make no sense, such as <C>checkout_started</C> before the user was activated.</li>
            <li>
              Builds the expected path: <C>trial_started</C> &rarr; <C>repository_connected</C> &rarr;{' '}
              <C>first_map_generated</C> &rarr; <C>checkout_started</C> &rarr; <C>payment_completed</C>.
            </li>
            <li>Finds blockers: GitHub auth failure, first value never reached, checkout not completed.</li>
            <li>Gives each user a diagnosis: friction, milestone reached, exploring, creating, or general.</li>
          </ul>

          <h3 className="mt-6 text-[16px] font-medium text-ink">Step 3: Customer memory capsules</h3>
          <p className="mt-1">For each user, DealMemory writes a short card called a CustomerMemoryCapsule:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><b>Title</b> - for example &quot;Friction: OAuth timeout&quot; or &quot;Alice · SaaS Analytics&quot;.</li>
            <li><b>Summary</b> - time spent, what they used, and how it ended.</li>
            <li><b>Intent</b> - their stated goals, searches or interests.</li>
            <li><b>Tech stack</b> - providers, frameworks and languages seen in events.</li>
            <li><b>Friction points</b> - errors they hit during onboarding.</li>
            <li><b>Suggested action</b> - a recommendation based on the diagnosis.</li>
          </ul>

          <h3 className="mt-6 text-[16px] font-medium text-ink">Step 4: AI insights</h3>
          <p className="mt-1">
            The <C>gemini.ts</C> module asks Google Gemini 2.5 Flash questions about your real data. It pulls trial
            users, their journeys and recent events from PostgreSQL, sends them as context, and gets back a short
            summary, next steps and friction spotted. If the Gemini quota runs out, it falls back to the plain
            telemetry numbers.
          </p>

          <H2 id="predict">4. Predictions</H2>
          <Box label="Example">
            <p>
              Two users joined this week. Sam used three features and connected GitHub. Priya signed up, hit an
              error and has been gone for two days. DealMemory gives Sam a high score and Priya a low one, and
              puts Priya on the &quot;at risk&quot; list so you can reach out.
            </p>
          </Box>
          <p className="mt-3">
            These are rule-based scores built from user behavior. They are estimates from your own event data,
            not a trained machine-learning model. With only a few users they are rough.
          </p>
          <p className="mt-4 font-medium text-ink">The technical version: <C>lib/predictive-analytics.ts</C></p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <C>predictConversionProbability(userId, projectId)</C> - a score from 0.0 to 1.0 using behavior
              patterns, time in state, friction ratio, milestone ratio and recent activity. It lists positive and
              negative factors and a confidence level (high, medium or low).
            </li>
            <li>
              <C>discoverFunnels(projectId, minSupport)</C> - finds the most common 3-step paths in real user
              sequences, plus where people drop off. No funnel names are hard-coded.
            </li>
            <li>
              <C>identifyAtRiskUsers(projectId, threshold)</C> - users below the threshold (default 0.3), with
              last action, hours inactive and a recommendation.
            </li>
            <li>
              <C>predictNextAction(userId, projectId)</C> - guesses the next action by comparing with users who
              started the same way. Returns the action, probability, number of similar users and the reason.
            </li>
            <li>
              <C>behavioralClustering(projectId, k)</C> - groups users into Explorers (browsing), Creators
              (setting things up), Friction Stall (hit errors), Activated (very engaged) and General (mixed).
            </li>
            <li>
              <C>buildUserPredictionSummary(userId, projectId)</C> - one compact summary: probability, at-risk
              flag, likely next action, archetype and current funnel step.
            </li>
          </ul>

          <H2 id="api">5. The API</H2>
          <Box label="Example">
            <p>
              The API is a menu you can order from with a web request. You say what you want (&quot;give me the
              predictions for this project&quot;) and it sends back JSON, which is just structured text.
            </p>
          </Box>
          <p className="mt-4 font-medium text-ink">Routes</p>
          <div className="mt-2 overflow-x-auto rounded-lg border border-line">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#fafafa] text-ink">
                <tr>
                  <th className="p-3 font-medium">Route</th>
                  <th className="p-3 font-medium">What it does</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  ['POST /api/v1/events/batch', 'Receives events from the SDK (this is where tracking data goes in).'],
                  ['GET /api/v1/analytics/predict?projectId=xxx', 'Predictive analytics for a project (below).'],
                  ['GET /api/v1/journeys', 'All user journeys with diagnoses.'],
                  ['GET /api/v1/events/recent', 'Recent events.'],
                  ['GET /api/v1/ai/ask?projectId=xxx&question=...', 'Ask the AI copilot a question.'],
                  ['POST /api/v1/demo/reset', 'Resets demo data.'],
                ].map(([r, d]) => (
                  <tr key={r}>
                    <td className="whitespace-nowrap p-3 font-mono text-[12px] text-ink">{r}</td>
                    <td className="p-3">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 font-medium text-ink">What the predict route returns</p>
          <Code>{`{
  "conversionScores": [{ userId, conversionProbability, atRisk, positiveFactors, negativeFactors }],
  "funnelDiscovery": { topFunnel, funnels, dropOffPoints, totalUsers },
  "atRiskUsers": [{ userId, probability, lastAction, inactiveHours, recommendation }],
  "nextActionPredictions": [{ nextAction, probability, similarUsers, rationale }],
  "clustering": { clusters, error },
  "userSummaries": [{ userId, conversionProbability, atRisk, nextLikelyAction, behavioralArchetype, funnelStep }],
  "metadata": { totalUsers, generatedAt }
}`}</Code>
          <p className="mt-3">
            Project data is scoped to your project, so requests for your own data need to come from a signed-in
            session or carry your project&apos;s key.
          </p>

          <H2 id="dashboard">6. The intelligence dashboard</H2>
          <p className="mt-3">After you sign in, the dashboard shows:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Conversion probability badges: green above 60%, yellow 30-60%, red below 30%.</li>
            <li>An at-risk list with probability, hours inactive and a recommended next step.</li>
            <li>Next-action predictions for the top 3 at-risk users.</li>
            <li>Automatic funnel discovery: the most common conversion path and its conversion rate.</li>
            <li>Behavior clusters: Explorers, Creators, Friction Stall, Activated and General.</li>
            <li>The classic funnel with stage counts and percentages.</li>
            <li>Blocker analysis (in the demo data, GitHub auth is the biggest blocker).</li>
            <li>A journey table: current stage, last event, time inactive, blocker and recommendation.</li>
          </ul>

          <H2 id="copilot">7. AI copilot</H2>
          <Box label="Example">
            <p>Ask: &quot;What&apos;s the top blocker for my trial users and what should I do about it?&quot;</p>
          </Box>
          <p className="mt-3">
            Call <C>GET /api/v1/ai/ask?projectId=xxx&amp;question=...</C>. DealMemory asks Gemini over your live
            data and sends back:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>A telemetry breakdown: active time, top feature, last action and onboarding status.</li>
            <li>A 2-3 sentence summary written like a product lead would explain it.</li>
            <li>One concrete next step.</li>
          </ul>
          <p className="mt-3">
            Onboarding status shows &quot;Healthy · No friction detected&quot; unless a real error blocked the
            user.
          </p>

          <H2 id="plans">8. Plans and projects</H2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-line p-4">
              <div className="font-medium text-ink">Starter (free)</div>
              <p className="mt-1 text-[13.5px]">1 project, up to 10,000 events a month.</p>
            </div>
            <div className="rounded-lg border border-line p-4">
              <div className="font-medium text-ink">Growth Pro ($49/mo)</div>
              <p className="mt-1 text-[13.5px]">
                Unlimited projects. Each has its own keys, events, journeys and AI memory.
              </p>
            </div>
          </div>
          <p className="mt-3">
            On Pro, a &quot;New project&quot; button appears in Settings. Projects never share data.
          </p>

          <H2 id="do">9. What you actually do</H2>
          <Code>{`# one-time setup
npm install dealmemory
npx dealmemory init

# .env
DEALMEMORY_API_KEY=pk_live_...

# in your code
import 'dealmemory/auto'
// or: import { track, identify, setGoal } from 'dealmemory'`}</Code>
          <p className="mt-3">After that, DealMemory handles the rest on its own:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Events show up in your dashboard.</li>
            <li>Journeys are rebuilt and blockers are found.</li>
            <li>AI recommendations, conversion scores, funnels and at-risk users are produced.</li>
          </ul>

          <H2 id="why">10. Why it works this way</H2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-line">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#fafafa] text-ink">
                <tr>
                  <th className="p-3 font-medium">Decision</th>
                  <th className="p-3 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  ['One env var (DEALMEMORY_API_KEY)', 'Less setup. Old names still work as fallbacks.'],
                  ['Automatic secret removal', 'Keeps secrets out of your event data.'],
                  ['No hard-coded funnel names', 'Funnels come from the data, not from guesses.'],
                  ['Probability scores', 'Converting is a pattern of behavior, not a yes/no.'],
                  ['Clusters over fixed funnels', 'People take different paths.'],
                  ['AI on top of real data', 'Real telemetry comes first. AI summarizes it and does not make things up.'],
                  ['Quiet no-op without a key', 'Never breaks your app if the key is missing.'],
                ].map(([d, r]) => (
                  <tr key={d}>
                    <td className="p-3 font-medium text-ink">{d}</td>
                    <td className="p-3">{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <H2 id="rules">11. Rules and limits</H2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Events per month: Starter 10,000, Pro unlimited.</li>
            <li>Projects: Starter 1, Pro unlimited.</li>
            <li>Event names use snake_case, like <C>trial_started</C>.</li>
            <li>Properties must be JSON-friendly. Secrets are stripped automatically.</li>
            <li>User IDs: <C>user_</C> prefix for known users, <C>anon:</C> for anonymous ones.</li>
            <li>
              The SDK reads <C>process.env.DEALMEMORY_API_KEY</C> on the server and the <C>NEXT_PUBLIC_</C>{' '}
              version in the browser.
            </li>
            <li>The init command is safe to run again. A second run changes nothing.</li>
          </ul>

          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-line pt-6">
            <Link href="/signup" className="btn btn-primary text-sm">
              Get your API key
            </Link>
            <Link href="/docs" className="btn btn-outline text-sm">
              Open the SDK docs
            </Link>
          </div>
          <p className="mt-6 text-[12.5px] text-ink-faint">
            DealMemory - product memory for SaaS trials. Capture every interaction. Understand every journey.
            Act on every insight.
          </p>
        </main>
      </div>
    </div>
  );
}
