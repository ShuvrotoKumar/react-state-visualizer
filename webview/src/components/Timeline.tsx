import { motion, AnimatePresence } from 'framer-motion';
import { Clock, FileText, ChevronRight } from 'lucide-react';

export function Timeline({ history }: { history: any[] }) {
    return (
        <div className="flex flex-col gap-6 relative px-2">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent" />
            
            <AnimatePresence mode="popLayout">
                {history.map((entry, idx) => (
                    <motion.div
                        key={`${entry.timestamp}-${idx}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="relative pl-10"
                    >
                        {/* Circle on line */}
                        <div className="absolute left-[14px] top-1.5 w-3 h-3 rounded-full border-2 border-blue-500 bg-[#0d1117] z-10 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                        
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xl hover:border-blue-500/30 transition-all group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                                            <Clock className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-black tracking-widest text-blue-400/80 uppercase">{entry.timestamp}</span>
                                    </div>
                                    {entry.fileName && (
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                                            <FileText className="w-3 h-3 text-purple-400" />
                                            <span className="text-[10px] font-mono opacity-60 truncate max-w-[120px]">{entry.fileName}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] opacity-40 uppercase font-bold tracking-tighter">Detected States ({entry.states.length})</p>
                                    <div className="flex flex-wrap gap-2">
                                        {entry.states.map((s: any, sidx: number) => (
                                            <div 
                                                key={sidx} 
                                                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2 py-1 transition-colors cursor-default"
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${s.type === 'useState' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                                                <span className="text-[10px] font-mono font-medium text-white/80">{s.name}</span>
                                            </div>
                                        ))}
                                        {entry.states.length === 0 && (
                                            <span className="text-[10px] opacity-20 italic">No states found in this scan</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] opacity-30 italic">Snapshotted view</span>
                                    <ChevronRight className="w-3 h-3 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {history.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-20 select-none">
                    <Clock className="w-12 h-12 mb-3 stroke-[1px]" />
                    <p className="text-sm font-medium tracking-tight">Timeline is empty</p>
                    <p className="text-[10px] uppercase tracking-widest mt-1 opacity-50">Scan a file to record history</p>
                </div>
            )}
        </div>
    );
}

