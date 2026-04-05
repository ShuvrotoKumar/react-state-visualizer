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
    hasPotentialInfiniteLoop: boolean;
}

export function parseReactState(code: string): ReactState[] {
    const states: ReactState[] = [];
    
    try {
        const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });

        const usedIdentifiers = new Set<string>();

        traverse(ast, {
            // Track used identifiers for primitive unused check
            Identifier(path) {
                if (path.isReferencedIdentifier()) {
                    usedIdentifiers.add(path.node.name);
                }
            },

            CallExpression(path) {
                const callee = path.node.callee;
                let hookName: string | null = null;
                
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
                            const initialValue = path.node.arguments.length > 0 
                                ? code.substring(path.node.arguments[0].start!, path.node.arguments[0].end!)
                                : 'undefined';

                            states.push({
                                name,
                                setter,
                                type: hookName as 'useState' | 'useReducer',
                                initialValue,
                                line: path.node.loc?.start.line || 0,
                                column: path.node.loc?.start.column || 0,
                                endLine: path.node.loc?.end.line || 0,
                                endColumn: path.node.loc?.end.column || 0,
                                isUnused: false,
                                hasPotentialInfiniteLoop: false
                            });
                        }
                    }
                }
                
                // Infinite Loop Detection
                if (t.isIdentifier(callee)) {
                    const state = states.find(s => s.setter === callee.name);
                    if (state) {
                        // Check if this call is inside a hook like useEffect
                        let parent = path.parentPath;
                        let isInsideSafeHook = false;
                        let isInsideEventHandler = false;

                        while (parent) {
                            if (t.isCallExpression(parent.node) && t.isIdentifier(parent.node.callee)) {
                                const hook = parent.node.callee.name;
                                if (['useEffect', 'useCallback', 'useMemo', 'useLayoutEffect'].includes(hook)) {
                                    isInsideSafeHook = true;
                                    break;
                                }
                            }
                            // Heuristic for event handlers: inside a function passed to an attribute like onClick
                            if (t.isJSXAttribute(parent.node) && parent.node.name.name.toString().startsWith('on')) {
                                isInsideEventHandler = true;
                                break;
                            }
                            parent = parent.parentPath;
                        }

                        if (!isInsideSafeHook && !isInsideEventHandler) {
                            // If it's directly inside the component body (FunctionDeclaration or ArrowFunctionExpression)
                            state.hasPotentialInfiniteLoop = true;
                        }
                    }
                }
            }
        });

        // Simple Unused Check
        states.forEach(state => {
            // A state is used if its name appears elsewhere in the code
            // (Note: this is a simple heuristic, a proper scope-check would be better)
            state.isUnused = !usedIdentifiers.has(state.name);
        });

    } catch (e) {
        console.error('Failed to parse React code:', e);
    }

    return states;
}
