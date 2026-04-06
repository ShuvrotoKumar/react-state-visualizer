import { motion, AnimatePresence } from 'framer-motion';
import { Target, Activity, AlertTriangle, ChevronRight, Copy, Pin, Layers } from 'lucide-react';

export interface ReactState {
    name: string;
    setter: string;
    type: 'useState' | 'useReducer';
    initialValue: string;
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    isUnused: boolean;
    isSetterUnused: boolean;
    usageCount: number;
    setterUsageCount: number;
    hasPotentialInfiniteLoop: boolean;
    dispatch?: string;
    actions?: string[];
    isDerived: boolean;
    derivedFrom?: string[];
    suggestions: string[];
}

export function StateList({ states, onJump }: { states: ReactState[], onJump: (s: ReactState) => void }) {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // We could add a toast here
    };

    return (
        <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
                {states.map((state, idx) => (
                    <motion.div
                        key={`${state.name}-${idx}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                        className={`group relative p-4 rounded-2xl backdrop-blur-xl border transition-all cursor-pointer overflow-hidden ${
                            state.hasPotentialInfiniteLoop ? 'bg-red-500/5 border-red-500/30' :
                            state.isUnused ? 'bg-yellow-500/5 border-yellow-500/30' : 
                            state.isDerived ? 'bg-purple-500/5 border-purple-500/30' :
                            'bg-white/5 border-white/10 hover:border-blue-500/50'
                        }`}
                        onClick={() => onJump(state)}
                    >
                        {/* Glow effect */}
                        <div className="absolute -inset-px bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                                    state.hasPotentialInfiniteLoop ? 'bg-red-500/20 text-red-400' :
                                    state.isUnused ? 'bg-yellow-500/20 text-yellow-400' : 
                                    state.isDerived ? 'bg-purple-500/20 text-purple-400' :
                                    'bg-blue-500/20 text-blue-400'
                                }`}>
                                    {state.isDerived ? <Layers className="w-5 h-5" /> : 
                                     state.type === 'useState' ? <Target className="w-5 h-5" /> : 
                                     <Activity className="w-5 h-5" />}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {state.name}
                                        </h3>
                                        {state.isDerived && (
                                            <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                                Derived
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] opacity-40 font-mono flex items-center gap-1.5">
                                        {state.setter || '(no setter)'}
                                        {state.setter && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); copyToClipboard(state.setter); }}
                                                className="hover:text-white transition-colors"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex gap-1">
                                    <button className="p-1.5 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all">
                                        <Pin className="w-3 h-3" />
                                    </button>
                                    <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                                <span className="text-[10px] font-mono opacity-20">L{state.line}</span>
                            </div>
                        </div>

                        {/* Metrics Bar */}
                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex -space-x-1">
                                <div className="px-2 py-1 bg-white/5 border border-white/5 rounded-l-lg text-[9px] font-bold">
                                    READS: <span className={state.usageCount > 0 ? 'text-blue-400' : 'text-yellow-500/60'}>{state.usageCount}</span>
                                </div>
                                <div className="px-2 py-1 bg-white/5 border border-white/5 rounded-r-lg text-[9px] font-bold">
                                    WRITES: <span className={state.setterUsageCount > 0 ? 'text-purple-400' : 'text-yellow-500/60'}>{state.setterUsageCount}</span>
                                </div>
                            </div>

                            {state.initialValue && (
                                <div className="text-[10px] opacity-40 font-mono truncate max-w-[100px]" title={state.initialValue}>
                                    init: {state.initialValue}
                                </div>
                            )}
                        </div>

                        {/* Actions (for useReducer) */}
                        {state.actions && state.actions.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {state.actions.map((action, i) => (
                                    <span key={i} className="text-[9px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">
                                        {action}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Suggestions / Errors */}
                        {state.suggestions.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                                {state.suggestions.map((suggestion, i) => (
                                    <div key={i} className={`flex items-start gap-2 text-[10px] leading-relaxed ${
                                        suggestion.includes('⚠️') ? 'text-red-400' : 'text-yellow-400/80'
                                    }`}>
                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        <span>{suggestion}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

