import * as vscode from 'vscode';
import { SidebarProvider } from './provider/SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
	const sidebarProvider = new SidebarProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"react-state-visualizer.sidebar",
			sidebarProvider
		)
	);

	// Event: On file save, re-scan if it's a React file
	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument((doc) => {
			if (doc.languageId === "javascriptreact" || doc.languageId === "typescriptreact") {
				sidebarProvider.scanActiveFile();
			}
		})
	);

    // Event: On active editor change, re-scan
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(() => {
            sidebarProvider.scanActiveFile();
        })
    );

	// Command: Manual refresh
	context.subscriptions.push(
		vscode.commands.registerCommand("react-state-visualizer.refresh", () => {
			sidebarProvider.scanActiveFile();
		})
	);
}

export function deactivate() {}
