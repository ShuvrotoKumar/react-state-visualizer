import * as vscode from 'vscode';
import { getNonce } from './utils';
import { parseReactState, ReactState } from '../parser/reactParser';

export class SidebarProvider implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "onInfo": {
                    if (!data.value) { return; }
                    vscode.window.showInformationMessage(data.value);
                    break;
                }
                case "onError": {
                    if (!data.value) { return; }
                    vscode.window.showErrorMessage(data.value);
                    break;
                }
                case "jumpToCode": {
                    if (!data.value) { return; }
                    const { line, column } = data.value;
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        const position = new vscode.Position(line - 1, column);
                        editor.selection = new vscode.Selection(position, position);
                        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
                    }
                    break;
                }
                case "refresh": {
                    this.scanActiveFile();
                    break;
                }
            }
        });
    }

    public scanActiveFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this._view?.webview.postMessage({ type: 'update', value: [] });
            return;
        }

        const text = editor.document.getText();
        const states = parseReactState(text);
        this._view?.webview.postMessage({ type: 'update', value: states });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "dist", "webview", "main.js"));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "dist", "webview", "style.css"));

        const nonce = getNonce();

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>React State Visualizer</title>
			</head>
			<body>
				<div id="root"></div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}
