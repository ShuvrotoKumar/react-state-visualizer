import React, { useEffect, useState } from 'react';
import { StateList } from './components/StateList';
import { Timeline } from './components/Timeline';
import { FlowGraph } from './components/FlowGraph';
import { LayoutDashboard, History, Share2, RefreshCw } from 'lucide-react';

interface ReactState {
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

const vscode = (window as any).acquireVsCodeApi();

export default function App() {
    const [states, setStates] = useState<ReactState[]>([]);
    const [workspaceResults, setWorkspaceResults] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'list' | 'timeline' | 'graph' | 'workspace'>('list');
    const [history, setHistory] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            switch (message.type) {
                case 'update':
                    setStates(message.value);
                    setHistory(prev => [{ 
                        timestamp: new Date().toLocaleTimeString(), 
                        states: message.value,
                        fileName: message.fileName?.split('/').pop()
                    }, ...prev].slice(0, 20));
                    break;
                case 'workspaceUpdate':
                    setWorkspaceResults(message.value);
                    setIsScanning(false);
                    setActiveTab('workspace');
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        vscode.postMessage({ type: 'refresh' });
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const onJumpToCode = (state: ReactState) => {
        vscode.postMessage({ type: 'jumpToCode', value: state });
    };

    const onRefresh = () => {
        vscode.postMessage({ type: 'refresh' });
    };

    const onScanWorkspace = () => {
        setIsScanning(true);
        vscode.postMessage({ type: 'scanWorkspace' });
    };

    const filteredStates = states.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.setter.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans flex flex-col gap-4 overflow-hidden">
            {/* Header */}
            <div className="p-4 pb-0 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
                        STATE VISUALIZER
                    </h1>
                    <div className="flex gap-2">
                        <button 
                            onClick={onScanWorkspace}
                            className={`p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all ${isScanning ? 'animate-pulse' : ''}`}
                            title="Scan Workspace"
                        >
                            <Share2 className={`w-4 h-4 text-purple-400 ${isScanning ? 'animate-spin' : ''}`} />
                        </button>
                        <button 
                            onClick={onRefresh}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                            title="Refresh Active File"
                        >
                            <RefreshCw className="w-4 h-4 text-blue-400" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <input 
                        type="text"
                        placeholder="Search states, setters, actions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:opacity-30"
                    />
                    <div className="absolute inset-0 bg-blue-500/5 blur-xl pointer-events-none group-focus-within:opacity-100 opacity-0 transition-opacity" />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-4 shrink-0">
                <div className="flex bg-white/5 p-1 rounded-xl backdrop-blur-md border border-white/10">
                    <button 
                        onClick={() => setActiveTab('list')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'list' ? 'bg-blue-600/30 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
                    >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        List
                    </button>
                    <button 
                        onClick={() => setActiveTab('timeline')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'timeline' ? 'bg-blue-600/30 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
                    >
                        <History className="w-3.5 h-3.5" />
                        History
                    </button>
                    <button 
                        onClick={() => setActiveTab('graph')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'graph' ? 'bg-blue-600/30 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        Flow
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                {activeTab === 'list' && (
                    filteredStates.length > 0 ? (
                        <StateList states={filteredStates} onJump={onJumpToCode} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-20 select-none">
                            <LayoutDashboard className="w-12 h-12 mb-2 stroke-[1px]" />
                            <p className="text-sm">No states found</p>
                        </div>
                    )
                )}
                {activeTab === 'timeline' && <Timeline history={history} />}
                {activeTab === 'graph' && <FlowGraph states={states} />}
                {activeTab === 'workspace' && (
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold opacity-40 uppercase tracking-widest">Workspace Scan Results</h2>
                        {workspaceResults.map((res, i) => (
                            <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-[10px] font-mono opacity-50 truncate mb-2">{res.fileName}</p>
                                <div className="flex flex-wrap gap-1">
                                    {res.states.map((s: any, j: number) => (
                                        <span key={j} className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                                            {s.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Actions - Export */}
            <div className="p-4 pt-0">
                <button 
                    className="w-full py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-white/20 transition-all opacity-60 hover:opacity-100"
                    onClick={() => {
                        const blob = new Blob([JSON.stringify(states, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `react-states-${new Date().getTime()}.json`;
                        a.click();
                    }}
                >
                    Export State Report (JSON)
                </button>
            </div>
        </div>
    );
}

