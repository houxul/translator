import { request } from './request';

export class translator {
    private words  = new Map();

    public async exec(text: string) {
        if (this.words.has(text)) {
            return this.words.get(text);
        }

        const srcs = this.parseText(text);
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

    private parseText(text: string) {
        if (escape(text).includes( "%u" )) {
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
        for (let i=1; i<text.length; i++) {
            if (this.isUpperCase(text[i])) {
                if (this.isUpperCase(text[i-1]) && (i + 1 === text.length ? true: this.isUpperCase(text[i+1]))) {
                    continue;
                }
                texts.push(text.substring(startIndex, i));
                startIndex = i;
            }
        }
        texts.push(text.substring(startIndex, text.length));
        return texts;
    }
    
    private isUpperCase(src: string) {
        return src >= 'A' && src <= 'Z';
    }
}
