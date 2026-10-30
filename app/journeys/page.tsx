export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';
import JourneysView from '@/components/journeys-view';

export default function JourneysPage() {
  return (
    <AppShell>
      <ProjectGate>
        <JourneysView />
      </ProjectGate>
    </AppShell>
  );
}
