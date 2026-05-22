import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../themes/ThemeProvider';
import { useAppStore } from '../../stores/appStore';

export function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const doctorId = useAppStore((s) => s.doctorId);
  const setView = useAppStore((s) => s.setView);
  const [time, setTime] = useState(() => new Date());
  const [statusMode, setStatusMode] = useState<'ONLINE' | 'STEALTH'>('ONLINE');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!showUserMenu && !showStatusMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatusMenu(false);
    };
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [showUserMenu, showStatusMenu]);

  const timeStr = time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header
      className="flex items-center justify-between px-5 py-2 border-b flex-shrink-0"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
    >
      {/* Left: theme name — enlarged */}
      <div className="flex items-center gap-6">
        <span
          className="font-mono text-sm tracking-[0.2em] uppercase font-bold"
          style={{ color: 'var(--accent)' }}
        >
          {theme.nameCn}
        </span>
      </div>

      {/* Right: user info + controls */}
      <div className="flex items-center gap-4">
        {/* Status toggle */}
        <div ref={statusRef} className="relative">
          <button onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="font-mono text-[10px] tracking-wider uppercase transition-all duration-200 hover:opacity-80"
            style={{ color: statusMode === 'ONLINE' ? 'var(--accent)' : 'var(--highlight)' }}>
            {statusMode}
          </button>
          <AnimatePresence>
            {showStatusMenu && (
              <motion.div className="absolute top-full right-0 mt-1 bevel-sm border py-1 shadow-lg z-30"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', minWidth: 120, transformOrigin: 'top' }}
                initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}>
                {(['ONLINE', 'STEALTH'] as const).map((m) => (
                  <button key={m} onClick={() => { setStatusMode(m); setShowStatusMenu(false); }}
                    className="block w-full text-left px-3 py-1.5 font-mono text-xs transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ color: m === 'ONLINE' ? 'var(--accent)' : 'var(--highlight)', fontWeight: statusMode === m ? 700 : 400 }}>
                    {m}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className="bevel-sm px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase transition-all duration-bevel border"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'transparent' }}>
          {theme.id === 'clinical' ? 'DARK' : 'LIGHT'}
        </button>

        {/* Time */}
        <span className="font-mono text-[10px] tracking-wider tabular-nums" style={{ color: 'var(--text-secondary)' }}>
          {timeStr}
        </span>

        {/* User dropdown */}
        <div ref={menuRef} className="relative">
          <button onClick={() => setShowUserMenu(!showUserMenu)}
            className="font-mono text-xs tracking-wider uppercase transition-all duration-200 hover:text-[var(--accent)]"
            style={{ color: 'var(--text-secondary)' }}>
            DR.{doctorId}
          </button>
          <AnimatePresence>
            {showUserMenu && (
              <motion.div className="absolute top-full right-0 mt-1 bevel-sm border py-1 shadow-lg z-30"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', minWidth: 140, transformOrigin: 'top' }}
                initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}>
                <button onClick={() => setShowUserMenu(false)}
                  className="block w-full text-left px-3 py-1.5 font-mono text-xs transition-colors hover:bg-[var(--bg-secondary)]"
                  style={{ color: 'var(--text-primary)' }}>
                  个人中心
                </button>
                <button onClick={() => { setShowUserMenu(false); setView('launch'); }}
                  className="block w-full text-left px-3 py-1.5 font-mono text-xs transition-colors hover:bg-[var(--bg-secondary)]"
                  style={{ color: 'var(--text-primary)' }}>
                  退出登录
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
