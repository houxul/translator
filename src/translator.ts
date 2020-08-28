import * as kyModule from 'ky-universal';

const ky = kyModule.default || kyModule;

export async function translator(text: string){
    const texts = filterText(text);
    //console.log(JSON.stringify(texts));
    if (!texts.length) {
        return text;
    }

    const url = `http://houxulu.club:8090/translator`;
    const resp = await ky.post(url, {json: texts});
    const result = await resp.json();
    if (Array.isArray(result)) {
        return result.join('');
    }
    return text;
}

function filterText(text: string) {
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
        if (isUpperCase(text[i])) {
            if (isUpperCase(text[i-1]) && (i + 1 === text.length ? true: isUpperCase(text[i+1]))) {
                continue;
            }
            texts.push(text.substring(startIndex, i));
            startIndex = i;
        }
    }
    texts.push(text.substring(startIndex, text.length));
    return texts;
}

function isUpperCase(src: string) {
    return src >= 'A' && src <= 'Z';
}