import { motion } from 'framer-motion';
import { Target, Activity, Layers, ArrowRight } from 'lucide-react';

export function FlowGraph({ states }: { states: any[] }) {
    const mainStates = states.filter(s => !s.isDerived);
    const derivedStates = states.filter(s => s.isDerived);

    return (
        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-2xl relative overflow-hidden min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h3 className="text-xs font-black opacity-40 uppercase tracking-[0.2em]">State Flow Architecture</h3>
                    <p className="text-[10px] opacity-20">Visualizing dependencies and derived transformations</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 opacity-40">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Source</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-40">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Derived</span>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 relative flex items-center justify-between gap-12 px-4">
                {/* Source Column */}
                <div className="flex flex-col gap-6 relative z-10 w-1/3">
                    {mainStates.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative p-3 bg-white/5 border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all cursor-default"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl scale-90 group-hover:scale-100 transition-transform ${s.type === 'useState' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                    {s.type === 'useState' ? <Target className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                </div>
                                <span className="text-xs font-mono font-black text-white/80 group-hover:text-white">{s.name}</span>
                            </div>
                            
                            {/* Connector line start points could go here if we used a real SVG library, 
                                but we'll use a CSS/motion approach for simplicity and performance */}
                        </motion.div>
                    ))}
                    {mainStates.length === 0 && (
                        <div className="py-10 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center opacity-10">
                            <Target className="w-8 h-8 mb-2" />
                            <span className="text-[10px] font-bold uppercase">No Source</span>
                        </div>
                    )}
                </div>

                {/* Center Transition Arrows */}
                <div className="flex flex-col gap-8 opacity-10 py-10">
                    <ArrowRight className="w-5 h-5 animate-pulse" />
                    <ArrowRight className="w-5 h-5 animate-pulse [animation-delay:0.2s]" />
                    <ArrowRight className="w-5 h-5 animate-pulse [animation-delay:0.4s]" />
                </div>

                {/* Derived Column */}
                <div className="flex flex-col gap-6 relative z-10 w-1/3">
                    {derivedStates.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative p-3 bg-purple-500/5 border border-purple-500/20 rounded-2xl hover:border-purple-500/50 transition-all cursor-default"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl scale-90 group-hover:scale-100 transition-transform bg-purple-500/20 text-purple-400">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-mono font-black text-white/80 group-hover:text-white">{s.name}</span>
                                    <span className="text-[8px] opacity-30 font-bold uppercase tracking-tighter">
                                        from {s.derivedFrom?.join(', ')}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {derivedStates.length === 0 && (
                        <div className="py-10 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center opacity-10">
                            <Layers className="w-8 h-8 mb-2" />
                            <span className="text-[10px] font-bold uppercase">No Derived</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none delay-1000" />
            
            <div className="mt-8 text-center bg-white/5 p-2 rounded-xl border border-white/10">
                 <p className="text-[9px] opacity-30 font-bold tracking-widest uppercase">
                    Graph reflects static source code dependency analysis
                 </p>
            </div>
        </div>
    );
}

