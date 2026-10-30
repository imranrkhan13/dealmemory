export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { AppShell } from '@/components/app-shell';
import ProjectGate from '@/components/project-gate';
import OverviewProduct from '@/components/overview-product';

export default function OverviewPage() {
  return (
    <AppShell>
      <ProjectGate>
        <OverviewProduct />
      </ProjectGate>
    </AppShell>
  );
}
