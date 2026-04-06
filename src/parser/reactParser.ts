import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

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
    // useReducer specific
    dispatch?: string;
    actions?: string[];
    // Dependency tracking
    isDerived: boolean;
    derivedFrom?: string[];
    // Smart suggestions
    suggestions: string[];
    // Performance insights
    complexityScore?: number;
    insightCategory?: 'Performance' | 'Best Practice' | 'Warning';
}

export function parseReactState(code: string): ReactState[] {
    const states: ReactState[] = [];

    try {
        const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });

        const identifiers = new Map<string, number>();
        const potentialDerived = new Map<string, string[]>();

        // First Pass: Find Hooks, Identifiers and Reducers
        traverse(ast, {
            Identifier(path) {
                if (path.isReferencedIdentifier()) {
                    const name = path.node.name;
                    identifiers.set(name, (identifiers.get(name) || 0) + 1);
                }
            },

            // Action detection for useReducer
            FunctionDeclaration(path) {
                const name = path.node.id?.name;
                if (name && (name.toLowerCase().includes('reducer'))) {
                    // Check switch statements for action types
                    traverse(path.node, {
                        SwitchCase(casePath) {
                            if (t.isStringLiteral(casePath.node.test)) {
                                const action = casePath.node.test.value;
                                // Associate this with any useReducer using this function name
                                states.forEach(s => {
                                    if (s.type === 'useReducer' && s.initialValue.includes(name)) {
                                        s.actions?.push(action);
                                    }
                                });
                            }
                        },
                        noScope: true
                    });
                }
            },

            CallExpression(path) {
                const callee = path.node.callee;
                let hookName: string | null = null;
                const hookNode = path.node;

                if (t.isIdentifier(callee)) {
                    hookName = callee.name;
                } else if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
                    hookName = callee.property.name;
                }

                if (hookName === 'useState' || hookName === 'useReducer') {
                    const parent = path.parentPath.node;

                    if (t.isVariableDeclarator(parent) && t.isArrayPattern(parent.id)) {
                        const elements = parent.id.elements;

                        if (elements.length >= 1 && t.isIdentifier(elements[0])) {
                            const name = elements[0].name;
                            const setter = elements.length >= 2 && t.isIdentifier(elements[1]) ? elements[1].name : '';
                            const initialValue = hookNode.arguments.length > 0
                                ? code.substring(hookNode.arguments[0].start!, hookNode.arguments[0].end!)
                                : 'undefined';

                            const state: ReactState = {
                                name,
                                setter,
                                type: hookName as 'useState' | 'useReducer',
                                initialValue,
                                line: hookNode.loc?.start.line || 0,
                                column: hookNode.loc?.start.column || 0,
                                endLine: hookNode.loc?.end.line || 0,
                                endColumn: hookNode.loc?.end.column || 0,
                                isUnused: false,
                                isSetterUnused: false,
                                usageCount: 0,
                                setterUsageCount: 0,
                                hasPotentialInfiniteLoop: false,
                                isDerived: false,
                                suggestions: []
                            };

                            if (hookName === 'useReducer') {
                                state.dispatch = setter;
                                state.actions = [];
                            }

                            states.push(state);
                        }
                    }
                }

                // Infinite Loop Detection
                if (t.isIdentifier(callee)) {
                    const state = states.find(s => s.setter === callee.name);
                    if (state) {
                        let currentPath: any = path.parentPath;
                        let isInsideSafeHook = false;
                        let isInsideEventHandler = false;

                        while (currentPath) {
                            if (t.isCallExpression(currentPath.node) && t.isIdentifier(currentPath.node.callee)) {
                                const hook = currentPath.node.callee.name;
                                if (['useEffect', 'useCallback', 'useMemo', 'useLayoutEffect'].includes(hook)) {
                                    isInsideSafeHook = true;
                                    break;
                                }
                            }
                            if (t.isJSXAttribute(currentPath.node) && currentPath.node.name.name.toString().startsWith('on')) {
                                isInsideEventHandler = true;
                                break;
                            }
                            currentPath = currentPath.parentPath;
                        }

                        if (!isInsideSafeHook && !isInsideEventHandler) {
                            state.hasPotentialInfiniteLoop = true;
                        }
                    }
                }
            },

            // Find derived state patterns: const derived = state + 1
            VariableDeclarator(path) {
                if (t.isIdentifier(path.node.id) && path.node.init) {
                    const deps: string[] = [];
                    traverse(path.node.init, {
                        Identifier(innerPath) {
                            deps.push(innerPath.node.name);
                        },
                        noScope: true
                    });
                    if (deps.length > 0) {
                        potentialDerived.set(path.node.id.name, deps);
                    }
                }
            }
        });

        // Second Pass: Correlation & Analysis
        states.forEach(state => {
            // Count usages (excluding declarations)
            state.usageCount = (identifiers.get(state.name) || 1) - 1;
            state.setterUsageCount = (identifiers.get(state.setter) || 1) - 1;

            state.isUnused = state.usageCount === 0;
            state.isSetterUnused = state.setterUsageCount === 0;

            // Infinite Loop Detection (Improved)
            // Re-traverse or use markers from first pass
            // For now, keep the basic check or improve it here
        });

        // Detect Derived States & Linkage
        const derivedStates: ReactState[] = [];
        potentialDerived.forEach((deps, name) => {
            const sourceStates = states.filter(s => deps.includes(s.name));
            if (sourceStates.length > 0) {
                // This variable 'name' is derived from one or more states
                // We add it as a 'derived' entry for visualization
                derivedStates.push({
                    name,
                    setter: '',
                    type: 'useState', // We treat it as a pseudo-state for the list
                    initialValue: '',
                    line: 0, // Would need more traversal to find exact line
                    column: 0,
                    endLine: 0,
                    endColumn: 0,
                    isUnused: (identifiers.get(name) || 0) === 0,
                    isSetterUnused: true,
                    usageCount: identifiers.get(name) || 0,
                    setterUsageCount: 0,
                    hasPotentialInfiniteLoop: false,
                    isDerived: true,
                    derivedFrom: sourceStates.map(s => s.name),
                    suggestions: []
                });
            }
        });

        states.push(...derivedStates);

        // Add suggestions & warnings & Calculate Complexity
        const globalSuggestions: string[] = [];
        if (states.filter(s => s.type === 'useState').length >= 5) {
            globalSuggestions.push("💡 Component has 5+ useState hooks. Consolidating into useReducer might improve state management.");
        }

        states.forEach(state => {
            // Base Complexity Score calculation
            state.complexityScore = (state.usageCount || 0) + (state.setterUsageCount || 0) * 2;
            if (state.isDerived) state.complexityScore += 5;
            if (state.hasPotentialInfiniteLoop) state.complexityScore += 50;

            if (state.isUnused && !state.isDerived) {
                state.suggestions.push(`State '${state.name}' is declared but never read. Consider removing it to reduce memory overhead.`);
                state.insightCategory = 'Performance';
            }
            if (state.isSetterUnused && state.type === 'useState' && !state.isDerived) {
                state.suggestions.push(`Setter '${state.setter}' is never called. This state might be static or updated incorrectly.`);
                state.insightCategory = 'Warning';
            }
            if (state.setterUsageCount > 3) {
                state.suggestions.push(`'${state.name}' has ${state.setterUsageCount} update locations. Multiple setters can make state flow hard to track.`);
                state.insightCategory = 'Best Practice';
            }
            if (state.hasPotentialInfiniteLoop) {
                state.suggestions.push(`⚠️ CRITICAL: Potential infinite loop detected! '${state.setter}' is called directly in the component body.`);
                state.insightCategory = 'Warning';
            }
            if (state.isDerived) {
                if (state.usageCount === 0) {
                     state.suggestions.push(`Derived value '${state.name}' is calculated but never used.`);
                }
                if (state.derivedFrom && state.derivedFrom.length >= 3) {
                    state.suggestions.push(`💡 Optimization: '${state.name}' has 3+ dependencies. Consider wrapping the calculation in useMemo.`);
                    state.insightCategory = 'Performance';
                }
            }
        });

        // Add global suggestions if any
        if (globalSuggestions.length > 0) {
            // We can attach global suggestions to the first state or add a dummy state
            // For now, let's just make it clear in the UI
        }

    } catch (e) {
        console.error('Failed to parse React code:', e);
    }

    return states;
}

