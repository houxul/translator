// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { translator } from './translator';
import { declaimer } from './declaimer';
import { jumper } from './jumper';
import { replacer } from './replacer';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "translator" is now active!');

	const tran = new translator();
	const decl = new declaimer();
	const jump = new jumper();
	const repl = new replacer();
	async function hover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
		const range = document.getWordRangeAtPosition(position);
		if (range) {
			const positionWord = document.getText(range);
			const result = await tran.querySnippet(positionWord);
			return new vscode.Hover(result);
		}
		return new vscode.Hover('');
	}

	context.subscriptions.push(vscode.languages.registerHoverProvider({ pattern: '**', scheme: 'file' }, {
		provideHover: hover,
	}));

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('extension.readAloud', (textEditor, edit, args) => {
		const positionWord = textEditor.document.getText(textEditor.selection);
		if (positionWord.trim() !== '') {
			decl.exec(positionWord);
		}
	}));

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('extension.jumpWeb', (textEditor, edit, args) => {
		jump.exec(textEditor.document.fileName, textEditor.selection.start.line + 1, textEditor.selection.end.line + 1);
	}));

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('extension.replaceWord', (textEditor, edit, args) => {
		repl.exec(textEditor);
	}));

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('extension.translateNotes', async (textEditor, edit, args) => {
		const text = textEditor.document.getText(textEditor.selection);
		if (text.trim() === '') {
			return;
		}
		const value = await tran.queryNotes(text);
		vscode.window.showInformationMessage(text+'\n'+value);
	}));
}

// this method is called when your extension is deactivated
export function deactivate() { }
