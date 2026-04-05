import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Activity, AlertTriangle, ChevronRight } from 'lucide-react';

interface ReactState {
    name: string;
    setter: string;
    type: 'useState' | 'useReducer';
    initialValue: string;
    line: number;
    column: number;
    isUnused: boolean;
}

export function StateList({ states, onJump }: { states: ReactState[], onJump: (s: ReactState) => void }) {
    return (
        <div className="flex flex-col gap-3">
            <AnimatePresence>
                {states.map((state, idx) => (
                    <motion.div
                        key={`${state.name}-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => onJump(state)}
                        className={`group relative p-4 rounded-xl backdrop-blur-lg border border-white/10 transition-all cursor-pointer overflow-hidden ${
                            state.isUnused ? 'hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                        }`}
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)'
                        }}
                    >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${
                            state.isUnused ? 'from-yellow-500/20 to-transparent' : 'from-blue-500/20 to-transparent'
                        }`} />

                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${state.isUnused ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    {state.type === 'useState' ? <Target className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                </div>
                                <div>
                                    <h3 className="font-mono text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                        {state.name}
                                    </h3>
                                    <p className="text-[10px] opacity-40 font-mono">
                                        {state.setter}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                             <div className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono opacity-80">
                                init: {state.initialValue}
                            </div>
                            <div className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono opacity-80">
                                L{state.line}:{state.column}
                            </div>
                            {state.isUnused && (
                                <div className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Unused
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
