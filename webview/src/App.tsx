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
    hasPotentialInfiniteLoop: boolean;
}

const vscode = (window as any).acquireVsCodeApi();

export default function App() {
    const [states, setStates] = useState<ReactState[]>([]);
    const [activeTab, setActiveTab] = useState<'list' | 'timeline' | 'graph'>('list');
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            switch (message.type) {
                case 'update':
                    setStates(message.value);
                    setHistory(prev => [{ timestamp: new Date().toLocaleTimeString(), states: message.value }, ...prev].slice(0, 20));
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        
        // Initial refresh
        vscode.postMessage({ type: 'refresh' });

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const onJumpToCode = (state: ReactState) => {
        vscode.postMessage({ type: 'jumpToCode', value: state });
    };

    const onRefresh = () => {
        vscode.postMessage({ type: 'refresh' });
    };

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] p-4 font-sans flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    React State
                </h1>
                <button 
                    onClick={onRefresh}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                    title="Manual Refresh"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-white/5 p-1 rounded-xl backdrop-blur-md border border-white/10 shrink-0">
                <button 
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${activeTab === 'list' ? 'bg-blue-600/20 text-blue-400 shadow-xl' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    List
                </button>
                <button 
                    onClick={() => setActiveTab('timeline')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${activeTab === 'timeline' ? 'bg-blue-600/20 text-blue-400 shadow-xl' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
                >
                    <History className="w-4 h-4" />
                    History
                </button>
                <button 
                    onClick={() => setActiveTab('graph')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${activeTab === 'graph' ? 'bg-blue-600/20 text-blue-400 shadow-xl' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
                >
                    <Share2 className="w-4 h-4" />
                    Flow
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'list' && <StateList states={states} onJump={onJumpToCode} />}
                {activeTab === 'timeline' && <Timeline history={history} />}
                {activeTab === 'graph' && <FlowGraph states={states} />}
            </div>
            
            {states.length === 0 && activeTab === 'list' && (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                    <LayoutDashboard className="w-12 h-12 mb-2" />
                    <p>No react state detected.</p>
                </div>
            )}
        </div>
    );
}
