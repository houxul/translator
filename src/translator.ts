import { request } from './request';

export class translator {
    private words = new Map();

    public async querySnippet(text: string) {
        if (this.words.has(text)) {
            return this.words.get(text);
        }

        const srcs = this.parseSnippet(text);
        if (!srcs.length) {
            return text;
        }

        const resp = await request(JSON.stringify(srcs))
        const result = await JSON.parse(resp as string);
        if (Array.isArray(result)) {
            const rs = result.join('');
            this.words.set(text, rs);
            return rs;
        }
        return text;
    }

    private parseSnippet(text: string) {
        if (escape(text).includes("%u")) {
            return [];
        }

        // 移除 $ . 
        if (text.startsWith('$') || text.startsWith('.')) {
            text = text.substr(1);
        }

        if (text.includes('_')) {
            return text.split('_');
        }

        if (text.includes('-')) {
            return text.split('-');
        }

        const texts = [];
        let startIndex = 0;
        for (let i = 1; i < text.length; i++) {
            if (this.isUpperCase(text[i])) {
                if (this.isUpperCase(text[i - 1]) && (i + 1 === text.length ? true : this.isUpperCase(text[i + 1]))) {
                    continue;
                }
                texts.push(text.substring(startIndex, i));
                startIndex = i;
            }
        }
        texts.push(text.substring(startIndex, text.length));
        return texts;
    }

    public async queryNotes(text: string) {
        const sentence = this.parseNotes(text);
        const resp = await request(JSON.stringify([sentence]))
        const result = await JSON.parse(resp as string);
        if (Array.isArray(result)) {
            return result[0];
        }
        return text;
    }

    private parseNotes(text: string) {
        let comment = text;
        comment = comment.replace(/\/\/ /g, '');
        comment = comment.replace(/\/\*\*/g, '');
        comment = comment.replace(/ \* /g, '');
        comment = comment.replace(/ \*\//g, '');
        comment = comment.replace(/\t/g, '');
        comment = comment.replace(/    /g, '');
        comment = comment.replace(/\n/g, ' ');
        return comment;
    }

    private isUpperCase(src: string) {
        return src >= 'A' && src <= 'Z';
    }
}
