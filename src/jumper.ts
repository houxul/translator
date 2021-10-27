import * as vscode from 'vscode';

export class jumper {
    async exec(fileName: string, start: number, end: number) {
        const fileSplits = fileName.split('/');
        let i = fileSplits.length-1;
        let gitPath : string | undefined;
        for (; i>=0; i--) {
            const itemPath = this.jointPath(fileSplits.slice(0, i));
            gitPath = await this.gitPath(itemPath);
            if (gitPath) {
                break;
            }
        }
        if (!gitPath) {
            return;
        }
        const pathSuffix = this.jointPath(fileSplits.slice(i));
        const remoteUrl = await this.remotePath(gitPath, pathSuffix, start, end);
		vscode.env.clipboard.writeText(remoteUrl);
		vscode.env.openExternal(vscode.Uri.parse(remoteUrl));
        return remoteUrl;
    }

    jointPath(fileSplits: string[]) {
        return fileSplits.join('/');
    }

    async gitPath(path: string) {
        const files = await new Promise((c, e) => {
            vscode.workspace.fs.readDirectory(vscode.Uri.file(path)).then(c, e);
        }) as Array<any>;

        for (const item of files) {
            if (item[0] !== '.git') {
                continue;
            }
            if (item[1] === vscode.FileType.Directory) {
                return path + '/.git';
            }
            const fileContent = await new Promise((c, e) => {
                vscode.workspace.fs.readFile(vscode.Uri.file(path + '/.git')).then(c, e);
            }) as Uint8Array;

            const realPath = path + '/' + this.uint8ArrayToString(fileContent).split(" ")[1].trim();
            return realPath;
        }
        
        return undefined;
    }

    async remotePath(gitPath: string, pathSuffix: string, start: number, end: number) {
        const cfgPath = gitPath + '/config';
        const content = await new Promise((c, e) => {
            vscode.workspace.fs.readFile(vscode.Uri.file(cfgPath)).then(c, e);
        }) as Uint8Array;
        const fileContent = this.uint8ArrayToString(content);        
        const urlLineBlocks = fileContent.split('\n').filter((value: string)=> {
            return value.includes('url = ');
        })[0].split(" ");
        let url = urlLineBlocks[urlLineBlocks.length-1];
        url = url.replace('https://', '').replace('git@', '').replace('.git', '').replace(':', '/');
        if (url.includes('github.com')) {
            return 'https://' + url + '/blob/master/' + pathSuffix + `#L${start}-L${end}`;
        }
        return 'https://' + url + '/-/tree/master/' + pathSuffix + `#L${start}-${end}`;
    }

    uint8ArrayToString(u8a: Uint8Array) {
        let str = '';
        for (var i = 0; i < u8a.length; i++) {
            str += String.fromCharCode(u8a[i]);
        }
        return str;
    }
}
