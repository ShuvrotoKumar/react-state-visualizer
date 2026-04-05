import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export function Timeline({ history }: { history: any[] }) {
    return (
        <div className="flex flex-col gap-4 relative pl-6 border-l border-white/5">
            {history.map((entry, idx) => (
                <motion.div
                    key={`${entry.timestamp}-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                >
                    {/* Circle on line */}
                    <div className="absolute -left-[30px] top-1 w-2 h-2 rounded-full border border-blue-500 bg-[#0d1117] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    
                    <div className="bg-white/3 p-3 rounded-lg border border-white/5 hover:border-blue-500/20 transition-all">
                        <div className="flex items-center gap-2 mb-2 opacity-60">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-mono">{entry.timestamp}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {entry.states.map((s: any, sidx: number) => (
                                <span key={sidx} className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded text-[8px] font-mono">
                                    {s.name}
                                </span>
                            ))}
                            {entry.states.length === 0 && <span className="opacity-20 text-[8px]">0 states</span>}
                        </div>
                    </div>
                </motion.div>
            ))}
            {history.length === 0 && (
                <div className="text-[10px] opacity-20 text-center py-4">No history yet. Scan the file to start.</div>
            )}
        </div>
    );
}
