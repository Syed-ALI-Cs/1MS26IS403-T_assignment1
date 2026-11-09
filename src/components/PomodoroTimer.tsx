import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Coffee, 
  Flame, 
  Volume2, 
  VolumeX, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  Maximize2, 
  Minimize2,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

interface PresetOption {
  id: string;
  name: string;
  focusMinutes: number;
  breakMinutes: number;
  desc: string;
}

const PRESETS: PresetOption[] = [
  { id: 'classic', name: 'Classic Pomodoro', focusMinutes: 25, breakMinutes: 5, desc: '25m Focus • 5m Break' },
  { id: 'deep', name: 'Deep Focus Sprint', focusMinutes: 50, breakMinutes: 10, desc: '50m Focus • 10m Break' },
  { id: 'quick', name: 'Quick Review', focusMinutes: 15, breakMinutes: 3, desc: '15m Focus • 3m Break' },
];

interface PomodoroTimerProps {
  currentSectionTitle?: string;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ currentSectionTitle }) => {
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [customFocusMinutes, setCustomFocusMinutes] = useState<number>(25);
  const [customBreakMinutes, setCustomBreakMinutes] = useState<number>(5);
  const [selectedPreset, setSelectedPreset] = useState<string>('classic');
  
  // Timer state (seconds)
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [totalDuration, setTotalDuration] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isEditingCustom, setIsEditingCustom] = useState<boolean>(false);
  const [justFinished, setJustFinished] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play a pleasant synthesizer chime via Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const now = ctx.currentTime;
      const freqs = mode === 'focus' ? [523.25, 659.25, 783.99, 1046.50] : [783.99, 659.25, 523.25]; // C5, E5, G5, C6
      
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        
        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.6);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.65);
      });
    } catch (e) {
      console.warn('Audio playback not supported or user has not interacted with DOM yet.', e);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, customFocusMinutes, customBreakMinutes]);

  const handlePhaseComplete = () => {
    setIsRunning(false);
    playChime();
    setJustFinished(true);
    setTimeout(() => setJustFinished(false), 5000);

    if (mode === 'focus') {
      const nextCount = completedSessions + 1;
      setCompletedSessions(nextCount);
      // Auto switch to break
      const isLongBreak = nextCount % 4 === 0;
      const nextMode = isLongBreak ? 'longBreak' : 'shortBreak';
      const breakSecs = (isLongBreak ? customBreakMinutes * 2 : customBreakMinutes) * 60;
      setMode(nextMode);
      setTimeLeft(breakSecs);
      setTotalDuration(breakSecs);
    } else {
      // Break finished, switch to focus
      setMode('focus');
      const focusSecs = customFocusMinutes * 60;
      setTimeLeft(focusSecs);
      setTotalDuration(focusSecs);
    }
  };

  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
    setJustFinished(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    const targetSecs = mode === 'focus' 
      ? customFocusMinutes * 60 
      : (mode === 'longBreak' ? customBreakMinutes * 2 : customBreakMinutes) * 60;
    setTimeLeft(targetSecs);
    setTotalDuration(targetSecs);
    setJustFinished(false);
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      const nextCount = completedSessions + 1;
      setCompletedSessions(nextCount);
      const isLongBreak = nextCount % 4 === 0;
      const nextMode = isLongBreak ? 'longBreak' : 'shortBreak';
      const breakSecs = (isLongBreak ? customBreakMinutes * 2 : customBreakMinutes) * 60;
      setMode(nextMode);
      setTimeLeft(breakSecs);
      setTotalDuration(breakSecs);
    } else {
      setMode('focus');
      const focusSecs = customFocusMinutes * 60;
      setTimeLeft(focusSecs);
      setTotalDuration(focusSecs);
    }
    setJustFinished(false);
  };

  const switchModeManually = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    let targetSecs = customFocusMinutes * 60;
    if (newMode === 'shortBreak') targetSecs = customBreakMinutes * 60;
    if (newMode === 'longBreak') targetSecs = customBreakMinutes * 2 * 60;
    setTimeLeft(targetSecs);
    setTotalDuration(targetSecs);
    setJustFinished(false);
  };

  const applyPreset = (preset: PresetOption) => {
    setSelectedPreset(preset.id);
    setCustomFocusMinutes(preset.focusMinutes);
    setCustomBreakMinutes(preset.breakMinutes);
    setIsRunning(false);
    const secs = (mode === 'focus' ? preset.focusMinutes : preset.breakMinutes) * 60;
    setTimeLeft(secs);
    setTotalDuration(secs);
    setIsEditingCustom(false);
  };

  const applyCustomDuration = (focusMins: number, breakMins: number) => {
    const validFocus = Math.max(1, Math.min(180, focusMins || 25));
    const validBreak = Math.max(1, Math.min(60, breakMins || 5));
    setCustomFocusMinutes(validFocus);
    setCustomBreakMinutes(validBreak);
    setSelectedPreset('custom');
    setIsRunning(false);
    const secs = (mode === 'focus' ? validFocus : validBreak) * 60;
    setTimeLeft(secs);
    setTotalDuration(secs);
  };

  // Formatter mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Progress calculations
  const progressRatio = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const progressPercent = Math.min(100, Math.max(0, Math.round(progressRatio * 100)));
  const circumference = 2 * Math.PI * 40; // r=40
  const strokeDashoffset = circumference - (circumference * progressRatio);

  const isFocusMode = mode === 'focus';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden mb-6 transition-all">
      {/* Header bar */}
      <div className={`px-4 sm:px-6 py-3.5 border-b flex items-center justify-between transition-colors ${
        isFocusMode 
          ? 'bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/50 border-indigo-100' 
          : 'bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/50 border-emerald-100'
      }`}>
        <div className="flex items-center space-x-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-xs ${
            isFocusMode ? 'bg-indigo-600' : 'bg-emerald-600'
          }`}>
            {isFocusMode ? <Clock className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-slate-900">Study Session Timer</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isFocusMode ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {mode === 'focus' ? 'Focus Mode' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </span>
              {isRunning && (
                <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {isFocusMode 
                ? (currentSectionTitle ? `Focused review on: ${currentSectionTitle}` : 'Stay immersed in your material without distractions')
                : 'Step away, stretch, or grab a drink before the next study block'}
            </p>
          </div>
        </div>

        {/* Top actions: Sound toggle, collapse toggle */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Quick status badge for completed sessions */}
          <div className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>{completedSessions} {completedSessions === 1 ? 'Round' : 'Rounds'}</span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Expand timer' : 'Minimize timer'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsed state mini-bar */}
      {isCollapsed && (
        <div className="px-5 py-3 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xl font-extrabold text-slate-900 tracking-tight">
              {formattedTime}
            </span>
            <span className="text-xs text-slate-500">
              ({progressPercent}% complete)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStartPause}
              className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-xs ${
                isRunning 
                  ? 'bg-amber-600 hover:bg-amber-700' 
                  : isFocusMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause' : 'Start'}</span>
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Expanded timer content */}
      {!isCollapsed && (
        <div className="p-5 sm:p-6">
          {/* Completion celebration banner */}
          {justFinished && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between animate-fadeIn">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">
                  {mode === 'focus' ? 'Session completed! Great work staying focused.' : 'Break time is over! Ready for the next round?'}
                </span>
              </div>
              <button
                onClick={() => setJustFinished(false)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Interactive Circular Timer Clock */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center select-none">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Track circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-100"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={`transition-all duration-1000 ease-linear ${
                      isFocusMode ? 'stroke-indigo-600' : 'stroke-emerald-600'
                    }`}
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Inside Timer digits */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {formattedTime}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                    {isFocusMode ? 'Focus Time' : 'Rest Break'}
                  </span>
                </div>
              </div>

              {/* Main Timer Action Controls */}
              <div className="flex items-center space-x-2.5 mt-5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors"
                  title="Reset session timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleStartPause}
                  className={`inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all ${
                    isRunning
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                      : isFocusMode
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Session</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Start {isFocusMode ? 'Focus' : 'Break'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors"
                  title="Skip to next phase"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Presets & Custom Configuration */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6 pt-4 lg:pt-0">
              {/* Mode Selector Tabs */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Session Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => switchModeManually('focus')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border ${
                      mode === 'focus'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Focus ({customFocusMinutes}m)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => switchModeManually('shortBreak')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border ${
                      mode === 'shortBreak'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Short ({customBreakMinutes}m)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => switchModeManually('longBreak')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border ${
                      mode === 'longBreak'
                        ? 'bg-teal-50 border-teal-300 text-teal-800 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Long ({customBreakMinutes * 2}m)</span>
                  </button>
                </div>
              </div>

              {/* Study Interval Presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Duration Presets
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsEditingCustom((prev) => !prev)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>{isEditingCustom ? 'Close Custom' : 'Custom Minutes'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`text-left p-2.5 rounded-xl border transition-all ${
                        selectedPreset === preset.id && !isEditingCustom
                          ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900">{preset.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Minutes Input Panel */}
              {isEditingCustom && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800">Custom Duration Settings:</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Focus Duration (min):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={customFocusMinutes}
                        onChange={(e) => applyCustomDuration(parseInt(e.target.value) || 25, customBreakMinutes)}
                        className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Break Duration (min):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={customBreakMinutes}
                        onChange={(e) => applyCustomDuration(customFocusMinutes, parseInt(e.target.value) || 5)}
                        className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Session Streaks & Tips */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-slate-700">Rounds Completed:</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4].map((step) => (
                      <span
                        key={step}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          completedSessions >= step
                            ? 'bg-amber-500 ring-2 ring-amber-100'
                            : 'bg-slate-200'
                        }`}
                        title={`Round ${step}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    ({completedSessions % 4}/4 before long break)
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 italic">
                  💡 High retention tip: Review flashcards during 25m focus blocks
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
