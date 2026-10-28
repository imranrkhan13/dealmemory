'use client';

import { AppShell } from '@/components/app-shell';
import DocsHub from '@/components/docs-hub';

export default function SdkPage() {
  return (
    <AppShell>
      <main>
        <DocsHub />
      </main>
    </AppShell>
  );
}
