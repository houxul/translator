// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {translator} from './translator'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "translator" is now active!');

	const trans = new translator();
	async function hover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
		// console.log('document', JSON.stringify(document));
		// console.log('position', JSON.stringify(position));
		// console.log('token', JSON.stringify(token));
		// const line = document.lineAt(position).text; // 光标所在的行
		// getWordRangeAtPosition获取光标所在单词的行列号范围；getText获取指定范围的文本
		const range = document.getWordRangeAtPosition(position);
		if (range) {
			const positionWord = document.getText(range);
			// console.log('光标所在位置的单词是：', positionWord);
			const result = await trans.exec(positionWord);
			return new vscode.Hover(result);
		}
		return new vscode.Hover('');
	}

	// registerHoverProvider的第一个参数数组表明此处理器的作用范围
	const hoverDisposable = vscode.languages.registerHoverProvider({ pattern: '**', scheme: 'file' }, {
			provideHover: hover,
	});

	context.subscriptions.push(hoverDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
