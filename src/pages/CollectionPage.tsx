import { SectionHeader } from '../components/ui/SectionHeader';

export function CollectionPage() {
  return (
    <div className="space-y-6">
      <SectionHeader subtitle="0 ITEMS">
        COLLECTION
      </SectionHeader>
      <p className="font-mono text-xs italic" style={{ color: 'var(--text-secondary)' }}>
        NO COLLECTED ITEMS
      </p>
    </div>
  );
}
