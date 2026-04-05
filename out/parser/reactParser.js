"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReactState = void 0;
const parser = __importStar(require("@babel/parser"));
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
function parseReactState(code) {
    const states = [];
    try {
        const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });
        const usedIdentifiers = new Set();
        (0, traverse_1.default)(ast, {
            // Track used identifiers for primitive unused check
            Identifier(path) {
                if (path.isReferencedIdentifier()) {
                    usedIdentifiers.add(path.node.name);
                }
            },
            CallExpression(path) {
                const callee = path.node.callee;
                let hookName = null;
                if (t.isIdentifier(callee)) {
                    hookName = callee.name;
                }
                else if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
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
                                ? code.substring(path.node.arguments[0].start, path.node.arguments[0].end)
                                : 'undefined';
                            states.push({
                                name,
                                setter,
                                type: hookName,
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
    }
    catch (e) {
        console.error('Failed to parse React code:', e);
    }
    return states;
}
exports.parseReactState = parseReactState;
//# sourceMappingURL=reactParser.js.map