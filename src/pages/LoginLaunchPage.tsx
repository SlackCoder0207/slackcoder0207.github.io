import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../stores/appStore';

type Phase = 'login' | 'loading' | 'clickContinue' | 'welcome';

interface LoginLaunchPageProps {
  onComplete: () => void;
}

export function LoginLaunchPage({ onComplete }: LoginLaunchPageProps) {
  const doctorId = useAppStore((s) => s.doctorId);
  const [phase, setPhase] = useState<Phase>('login');
  const [typewriter, setTypewriter] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [welcomeLine1, setWelcomeLine1] = useState('');
  const [welcomeLine2, setWelcomeLine2] = useState('');
  const [welcomeLine3, setWelcomeLine3] = useState('');
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const loadStartRef = useRef(0);
  const stutterDoneRef = useRef(false);

  // ── Fixed position typewriter ──
  const typewriterText = 'RHODES ISLAND AUDIO TERMINAL v0.1.0';
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTypewriter(typewriterText.slice(0, i));
      if (i >= typewriterText.length) clearInterval(t);
    }, 40);
    return () => clearInterval(t);
  }, []);

  // ── Form appears from left after typewriter ──
  useEffect(() => {
    if (typewriter.length < typewriterText.length) return;
    const t = setTimeout(() => setFormVisible(true), 400);
    return () => clearTimeout(t);
  }, [typewriter]);

  // ── Login ──
  const handleLogin = useCallback(() => {
    if (username !== 'root' || password !== 'root') {
      setLoginError('INVALID CREDENTIALS');
      return;
    }
    setLoginError('');
    setPhase('loading');
    loadStartRef.current = Date.now();
  }, [username, password]);

  // ── Loading animation ──
  useEffect(() => {
    if (phase !== 'loading') return;
    const duration = 2800;
    const stutterAt = 0.6;
    const stutterMs = 300;
    const tick = () => {
      const elapsed = Date.now() - loadStartRef.current;
      let raw = Math.min(elapsed / duration, 1);
      if (raw >= stutterAt && !stutterDoneRef.current) {
        const se = elapsed - duration * stutterAt;
        if (se < stutterMs) raw = stutterAt;
        else stutterDoneRef.current = true;
      }
      if (stutterDoneRef.current && raw < 1) {
        const t = (elapsed - duration * stutterAt - stutterMs) / (duration * (1 - stutterAt));
        raw = stutterAt + (1 - stutterAt) * (1 - Math.pow(1 - t, 2));
      }
      const clamped = Math.min(raw, 1);
      setLoadPct(clamped);
      // When done, show "Click to Continue"
      if (clamped >= 1) {
        requestAnimationFrame(() => setPhase('clickContinue'));
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [phase, onComplete]);

  // ── Click to Continue → welcome ──
  const handleContinue = useCallback(() => {
    setPhase('welcome');
    setTimeout(() => setWelcomeVisible(true), 200);
  }, []);

  // ── Welcome typewriter ──
  useEffect(() => {
    if (!welcomeVisible) return;
    const blinkThen = (times: number, next: () => void) => {
      let count = 0;
      const blink = setInterval(() => {
        count++;
        document.getElementById('wl-cursor')?.style.setProperty('opacity', count % 2 === 0 ? '0' : '1');
        if (count >= times * 2) { clearInterval(blink); next(); }
      }, 350);
    };

    const str1 = 'Permission Level 8';
    let i1 = 0;
    const t1 = setInterval(() => {
      i1++; setWelcomeLine1(str1.slice(0, i1));
      if (i1 >= str1.length) {
        clearInterval(t1);
        blinkThen(2, () => {
          const str2 = 'Welcome Back';
          let i2 = 0;
          const t2 = setInterval(() => {
            i2++; setWelcomeLine2(str2.slice(0, i2));
            if (i2 >= str2.length) {
              clearInterval(t2);
              blinkThen(3, () => {
                const str3 = `, Dr. ${doctorId}`;
                let i3 = 0;
                const t3 = setInterval(() => {
                  i3++; setWelcomeLine3(str3.slice(0, i3));
                  if (i3 >= str3.length) { clearInterval(t3); setTimeout(onComplete, 1500); }
                }, 45);
              });
            }
          }, 45);
        });
      }
    }, 45);
    return () => clearInterval(t1);
  }, [welcomeVisible, doctorId, onComplete]);

  const showWelcome = phase === 'welcome';

  return (
    <div className="fixed inset-0 overflow-hidden select-none flex flex-col items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <AnimatePresence mode="wait">
        {/* ── Login phase ── */}
        {phase === 'login' && (
          <motion.div key="login" className="flex flex-col items-center w-full max-w-[520px] gap-8 z-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>

            {/* Typewriter — fixed position */}
            <div className="h-8">
              <span className="font-mono text-base tracking-[0.15em]" style={{ color: 'var(--text-primary)' }}>{typewriter}</span>
              <span className="w-[2px] h-5 ml-0.5 animate-pulse align-middle" style={{ background: 'var(--accent)', display: 'inline-block' }} />
            </div>

            {/* Login form + QR — appears from left */}
            {formVisible && (
              <motion.div className="flex items-start gap-8 w-full"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}>

                {/* Left: form */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
                      USERNAME
                    </label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                      className="w-full bevel-sm px-3 py-2 font-mono text-sm border outline-none"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}
                      placeholder="root" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      PASSWORD
                    </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full bevel-sm px-3 py-2 font-mono text-sm border outline-none"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}
                      placeholder="root" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                  </div>

                  {loginError && (
                    <p className="font-mono text-xs tracking-wider" style={{ color: 'var(--highlight)' }}>{loginError}</p>
                  )}

                  <button onClick={handleLogin}
                    className="bevel-sm w-full py-2.5 font-mono text-xs tracking-wider uppercase border transition-all duration-200 hover:brightness-110"
                    style={{ borderColor: 'var(--accent)', color: 'var(--bg-primary)', background: 'var(--accent)' }}>
                    SIGN IN
                  </button>
                </div>

                {/* Vertical divider */}
                <div className="w-px self-stretch" style={{ background: 'var(--border)' }} />

                {/* Right: QR */}
                <div className="flex flex-col items-center gap-3 pt-2">
                  <div className="bevel w-28 h-28 border flex items-center justify-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                    <span className="font-mono text-[9px] tracking-wider uppercase text-center" style={{ color: 'var(--text-secondary)' }}>QR LOGIN</span>
                  </div>
                  <span className="font-mono text-[9px] tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>SCAN CODE</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Loading + Click to Continue — black bg with logo ── */}
        {(phase === 'loading' || phase === 'clickContinue') && (
          <motion.div key="loading" className="fixed inset-0 flex flex-col items-center justify-center gap-8 z-50"
            style={{ background: '#000000' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }}
            onClick={phase === 'clickContinue' ? handleContinue : undefined}>

            {/* Rhodes Island Logo */}
            <motion.img src="/Logo.png" alt="Rhodes Island"
              className="w-32 h-32 object-contain"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }} />

            {/* Percentage */}
            {phase === 'loading' && (
              <motion.span className="font-mono text-3xl tracking-wider tabular-nums font-bold"
                style={{ color: 'var(--highlight)' }}
                animate={{ opacity: 1 }}>{Math.round(loadPct * 100)}%</motion.span>
            )}

            {/* Lines */}
            <div className="absolute left-0 right-0 top-1/2 h-px pointer-events-none" style={{ transform: 'translateY(40px)' }}>
              <motion.div className="absolute top-0 left-0 h-px"
                style={{ background: 'var(--highlight)', boxShadow: '0 0 8px var(--highlight)' }}
                animate={{ width: loadPct >= 1 || phase === 'clickContinue' ? '50vw' : `${loadPct * 50}vw` }}
                transition={{ duration: 0.3 }} />
              <motion.div className="absolute top-0 right-0 h-px"
                style={{ background: 'var(--highlight)', boxShadow: '0 0 8px var(--highlight)' }}
                animate={{ width: loadPct >= 1 || phase === 'clickContinue' ? '50vw' : `${loadPct * 50}vw` }}
                transition={{ duration: 0.3 }} />
            </div>

            {/* Click hint */}
            {phase === 'clickContinue' && (
              <motion.p className="font-mono text-sm tracking-widest uppercase animate-pulse"
                style={{ color: 'var(--highlight)' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}>
                CLICK ANYWHERE TO CONTINUE
              </motion.p>
            )}
          </motion.div>
        )}

        {/* ── Welcome ── */}
        {showWelcome && (
          <motion.div key="welcome" className="flex flex-col items-center gap-3 z-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
            <span className="font-mono text-lg tracking-[0.12em]" style={{ color: 'var(--text-primary)' }}>
              {welcomeLine1}
              {welcomeLine1.length > 0 && welcomeLine2.length === 0 && (
                <span id="wl-cursor" className="w-[2px] h-5 ml-0.5 align-middle" style={{ background: 'var(--accent)', display: 'inline-block' }} />
              )}
            </span>
            <span className="font-mono text-lg tracking-[0.12em]" style={{ color: 'var(--text-primary)' }}>
              {welcomeLine2}{welcomeLine3}
              {welcomeLine2.length > 0 && (
                <span id="wl-cursor" className="w-[2px] h-5 ml-0.5 align-middle" style={{ background: 'var(--accent)', display: 'inline-block' }} />
              )}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
