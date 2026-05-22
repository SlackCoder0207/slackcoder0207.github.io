import type { PlayerStatus } from '../types';
import { usePlayerStore } from '../stores/playerStore';

type AudioEvent = 'timeupdate' | 'statuschange' | 'ended';

type Listener = () => void;

const FFTSize = 256;

/**
 * Singleton WebAudio engine.
 * Call AudioEngine.getInstance() to use.
 */
export class AudioEngine {
  private static instance: AudioEngine;

  private ctx: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private buffer: AudioBuffer | null = null;

  private _startTime = 0;
  private _pausedAt = 0;
  private _duration = 0;
  private _status: PlayerStatus = 'idle';

  private listeners = new Map<AudioEvent, Set<Listener>>();
  private animFrame = 0;

  static getInstance() {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  // ---- Public API ----

  async load(url: string) {
    const store = usePlayerStore.getState();
    store.setStatus('loading');

    try {
      const resp = await fetch(url);
      const arrayBuf = await resp.arrayBuffer();

      if (!this.ctx) {
        this.ctx = new AudioContext();
      }

      this.buffer = await this.ctx.decodeAudioData(arrayBuf);
      this._duration = this.buffer.duration;
      store.setDuration(this._duration);
      store.setStatus('buffering');
    } catch (err) {
      console.error('[AudioEngine] load failed', err);
      store.setStatus('idle');
    }
  }

  play() {
    if (!this.ctx || !this.buffer) return;

    if (this._status === 'paused') {
      this._resume();
      return;
    }

    // Create fresh source
    this._cleanupSource();
    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.buffer;

    this.gain = this.ctx.createGain();
    this.gain.gain.value = usePlayerStore.getState().volume;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = FFTSize;

    this.source.connect(this.gain);
    this.gain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.source.onended = () => {
      if (this._status === 'playing') {
        this._setStatus('ended');
        this._emit('ended');
      }
    };

    this.source.start(0, this._pausedAt);
    this._startTime = this.ctx.currentTime - this._pausedAt;
    this._setStatus('playing');
    this._startTick();
  }

  pause() {
    if (this._status !== 'playing') return;
    this._pausedAt = this.currentTime;
    this._setStatus('paused');
    this._stopTick();
    this.ctx?.suspend();
  }

  seek(time: number) {
    if (!this.buffer) return;
    this._pausedAt = Math.max(0, Math.min(time, this._duration));
    this._startTime = (this.ctx?.currentTime ?? 0) - this._pausedAt;

    if (this._status === 'playing' || this._status === 'paused') {
      // Recreate source at new position
      const wasPlaying = this._status === 'playing';
      this._cleanupSource();
      this._pausedAt = this._pausedAt;
      if (wasPlaying) {
        this.play();
      }
    }
  }

  setVolume(v: number) {
    if (this.gain) {
      this.gain.gain.value = v;
    }
  }

  get currentTime() {
    if (this._status === 'playing' && this.ctx) {
      return this.ctx.currentTime - this._startTime;
    }
    return this._pausedAt;
  }

  get duration() {
    return this._duration;
  }

  get status() {
    return this._status;
  }

  on(event: AudioEvent, fn: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
    return () => this.listeners.get(event)?.delete(fn);
  }

  destroy() {
    this._cleanupSource();
    this.ctx?.close();
    this.ctx = null;
    this._stopTick();
    this.listeners.clear();
  }

  // ---- Private ----

  private _resume() {
    this.ctx?.resume();
    this._startTime = this.ctx!.currentTime - this._pausedAt;
    this._setStatus('playing');
    this._startTick();
  }

  private _cleanupSource() {
    try {
      this.source?.stop();
      this.source?.disconnect();
    } catch {}
    this.source = null;
  }

  private _setStatus(s: PlayerStatus) {
    this._status = s;
    usePlayerStore.getState().setStatus(s);
    this._emit('statuschange');
  }

  private _startTick() {
    this._stopTick();

    const store = usePlayerStore.getState();
    const data = new Uint8Array((this.analyser?.frequencyBinCount ?? 0));

    const tick = () => {
      this.animFrame = requestAnimationFrame(tick);

      const ct = this.currentTime;
      store.setCurrentTime(ct);

      if (this.analyser) {
        this.analyser.getByteFrequencyData(data);
        store.setAnalyserData(new Uint8Array(data));
      }

      this._emit('timeupdate');
    };
    this.animFrame = requestAnimationFrame(tick);
  }

  private _stopTick() {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = 0;
    }
  }

  private _emit(event: AudioEvent) {
    this.listeners.get(event)?.forEach((fn) => fn());
  }
}
