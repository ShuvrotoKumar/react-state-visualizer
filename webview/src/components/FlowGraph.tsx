import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Target } from 'lucide-react';

export function FlowGraph({ states }: { states: any[] }) {
    const useStates = states.filter(s => s.type === 'useState');
    const useReducers = states.filter(s => s.type === 'useReducer');

    return (
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl relative overflow-hidden">
            <h3 className="text-xs font-bold opacity-60 mb-8 uppercase tracking-widest">State Distribution</h3>
            
            <div className="flex flex-col items-center gap-12 relative">
                {/* Center Node: Component */}
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 z-10"
                >
                   <span className="font-bold text-xs">APP</span>
                </motion.div>

                {/* State Nodes */}
                <div className="grid grid-cols-2 gap-8 w-full">
                    {/* useState group */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 mb-2">
                             <Target className="w-3 h-3 text-blue-400" />
                             <span className="text-[10px] opacity-40">useState ({useStates.length})</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {useStates.map((s, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[10px] font-mono text-blue-400"
                                    title={s.name}
                                >
                                    {s.name[0]}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                     {/* useReducer group */}
                     <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 mb-2">
                             <Activity className="w-3 h-3 text-purple-400" />
                             <span className="text-[10px] opacity-40">useReducer ({useReducers.length})</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {useReducers.map((s, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-[10px] font-mono text-purple-400"
                                    title={s.name}
                                >
                                    {s.name[0]}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center opacity-40">
                <p className="text-[10px]">Graph feature is experimental (static view)</p>
            </div>
            
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
    );
}
