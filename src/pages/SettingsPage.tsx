import { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { TerminalButton } from '../components/ui/TerminalButton';
import { cn } from '../utils/cn';

type SettingsTab = 'general' | 'playback' | 'appearance' | 'lyrics' | 'about';

const tabs: { id: SettingsTab; label: string }[] = [
  { id: 'general', label: 'GENERAL' },
  { id: 'playback', label: 'PLAYBACK' },
  { id: 'appearance', label: 'APPEARANCE' },
  { id: 'lyrics', label: 'LYRICS' },
  { id: 'about', label: 'ABOUT' },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <div className="space-y-6">
      <SectionHeader subtitle="SYSTEM CONFIGURATION">
        SETTINGS
      </SectionHeader>

      {/* Tabs */}
      <div className="flex gap-1 border-b pb-0" style={{ borderColor: 'var(--border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 font-mono text-[10px] tracking-wider uppercase transition-all duration-bevel border-b-2',
              activeTab === tab.id
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-4">
        {activeTab === 'general' && (
          <SettingRow label="CACHE" value="256 MB USED">
            <TerminalButton variant="danger" size="sm">CLEAR</TerminalButton>
          </SettingRow>
        )}
        {activeTab === 'playback' && (
          <>
            <SettingRow label="OUTPUT" value="WEBAUDIO API" />
            <SettingRow label="SAMPLE RATE" value="44100 Hz" />
          </>
        )}
        {activeTab === 'about' && (
          <div className="font-mono text-xs space-y-2" style={{ color: 'var(--text-secondary)' }}>
            <p>RIAT v0.1.0</p>
            <p>RHODES ISLAND AUDIO TERMINAL</p>
            <p>BUILD: PRE-ALPHA</p>
          </div>
        )}
        {activeTab !== 'general' && activeTab !== 'playback' && activeTab !== 'about' && (
          <p className="font-mono text-xs italic" style={{ color: 'var(--text-secondary)' }}>
            [NOT IMPLEMENTED]
          </p>
        )}
      </div>
    </div>
  );
}

function SettingRow({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
      <div>
        <span className="font-mono text-xs tracking-wider uppercase block" style={{ color: 'var(--text-primary)' }}>
          {label}
        </span>
        <span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          {value}
        </span>
      </div>
      {children}
    </div>
  );
}
