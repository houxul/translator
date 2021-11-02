import * as vscode from 'vscode';
import { ky, host } from './translator';

export class replacer {
    async exec(textEditor: vscode.TextEditor) {
        const value = textEditor.document.getText(textEditor.selection);
        if (value === '' || !isZhWord(value)) {
            return;
        }

        const url = `http://${host}:8090/translator`;
        const respText = await ky.post(url, { json: [value] });
        const respObj = await respText.json() as string[];

        const genSnippeter = new humpGenSnippeter();
        const snippetes: string[] = [];
        for (const item of respObj) {
            const snippet = genSnippeter.exec(item);
            if (!snippetes.includes(snippet)) {
                snippetes.push(snippet);
            }
        }

        if (snippetes.length > 0) {
            textEditor.insertSnippet(new vscode.SnippetString('').appendChoice(snippetes));
        }
    }
}

abstract class genSnippeter {
    abstract exec(str: string): string;
}

class humpGenSnippeter extends genSnippeter {
    exec(str: string): string {
        const words = removeSymbol(str).split(' ');
        const snipWords = removeSpecialWord(words);
        if (snipWords.length === 0) {
            return str;
        }

        let snippet = initialsLowercase(snipWords[0]);
        for (let i = 1; i < snipWords.length; i++) {
            snippet += initialsUppercase(snipWords[i]);
        }

        return snippet;
    }
}

function initialsLowercase(word: string): string {
    if (word.length === 0) {
        return word;
    }

    if (word[0] >= 'A' && word[0] <= 'Z') {
        return String.fromCharCode(word.charCodeAt(0) + 32) + word.substr(1);
    }
    return word;
}

function initialsUppercase(word: string): string {
    if (word.length === 0) {
        return word;
    }

    if (word[0] >= 'a' && word[0] <= 'z') {
        return String.fromCharCode(word.charCodeAt(0) - 32) + word.substr(1);
    }
    return word;
}

function removeSymbol(word: string): string {
    let newWord = word;
    newWord = newWord.replace(/\./g, ' ');
    newWord = newWord.replace(/,/g, ' ');
    newWord = newWord.replace(/\'s/g, '');
    newWord = newWord.replace(/\'m/g, '');
    return newWord;
}

const specialWord: string[] = ['the'];

function removeSpecialWord(words: string[]): string[] {
    return words.filter((word: string) => {
        return !specialWord.includes(word.toLowerCase());
    });
}

function isZhWord(word: string) {
    return escape(word).includes('%u');
}