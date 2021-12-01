import * as http from 'http';

export async function request(body: string) {
    const host = '152.136.15.213'
    const options = {
        hostname: host,
        port: 8090,
        path: '/translator',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    }

    return await new Promise((c, e) => {
        const req = http.request(options, (res: any) => {
            if (res.statusCode != 200) {
                e(res);
            }
            let data = '';
            res.on('data', (chunk: any) => {
                data += chunk;
            });
            res.on('end', () => {
                c(data);
            });
        })
        req.on('error', (err: any) => {
            e(err);
        })
        req.write(body);
        req.end();
    })
}