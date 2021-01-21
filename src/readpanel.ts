// 创建播放窗口
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const viewPath = path.join(__dirname, '..', 'view', 'list.html');
const viewHtml = fs.readFileSync(viewPath, { encoding: 'utf-8' });

let _readPanel :any;

export function readPanel () {
    if (!_readPanel) {
        const activeDocument = vscode.window.activeTextEditor?.document;
        const panel = _readPanel = vscode.window.createWebviewPanel(
            'ReadPanel',
            '单词朗读',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // WebView内容
        panel.webview.html = viewHtml;

        // 读完关闭
        panel.webview.onDidReceiveMessage(_data => {
            // 接收 webview message
        });

        // 关闭事件
        panel.onDidDispose(() => {
            _readPanel = null;
        });

        // 启动后激活之前的标签
        if (activeDocument) {
            setTimeout(() => {
                vscode.window.showTextDocument(activeDocument);
            }, 200);
        }
    }
    return _readPanel.webview;
};