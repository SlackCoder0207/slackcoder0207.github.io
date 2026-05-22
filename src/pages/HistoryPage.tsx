import { SectionHeader } from '../components/ui/SectionHeader';

export function HistoryPage() {
  return (
    <div className="space-y-6">
      <SectionHeader subtitle="RECENT ACTIVITY">
        HISTORY
      </SectionHeader>
      <p className="font-mono text-xs italic" style={{ color: 'var(--text-secondary)' }}>
        NO HISTORY
      </p>
    </div>
  );
}
