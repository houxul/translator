import { readPanel } from './readpanel';

export class declaimer {
    exec(text: string) {
        readPanel().postMessage({text});
    }
}