export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';
import EventsView from '@/components/events-view';

export default function EventsPage() {
  return (
    <AppShell>
      <ProjectGate>
        <EventsView />
      </ProjectGate>
    </AppShell>
  );
}
