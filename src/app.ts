import path from 'path';
import { mkdir, readFile, stat } from 'fs/promises';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { ReadableStream } from 'stream/web'
import express from 'express';
import { subscribeToBroker, getCurrentData, toggleDisplays } from './lib/mqtt';
const config = require('../config.json');

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use('/firmware', express.static(path.resolve(__dirname, '..', 'firmware')));

subscribeToBroker();

app.get('/api', async(req, res) => {
    return res.json(getCurrentData());
});

app.get('/api/admin/config', async (req, res) => {
    return res.json(config);
});

app.post('/api/admin/start-firmware-update', async (req, res) => {
    try {
        const url = new URL(req.body.url);

        if (url.hostname === 'micropython.org' && url.pathname.match(/^.*-OTA-.*\.app-bin$/)) {
            const filename = url.pathname.split('/').at(-1);
            const filePath = path.join(__dirname, '..', 'firmware', filename!);

            const firmwareDir = path.join(__dirname, '../firmware');
            await mkdir(firmwareDir, { recursive: true });

            let file: ArrayBuffer | undefined = undefined;

            try {
                const buffer = await readFile(filePath);

                file = buffer.buffer;
            } catch (err) {
                const stream = createWriteStream(filePath);
                const { body } = await fetch(req.body.url);

                await finished(Readable.fromWeb(body as ReadableStream).pipe(stream));
            }

            const { size } = await stat(filePath);

            const sha256 = Array.from(
                new Uint8Array(
                    await crypto.subtle.digest('SHA-256', new Uint8Array(file as ArrayBuffer))
                )
            )
                .map(h => h.toString(16).padStart(2, '0'))
                .join('');

            return res.send({
                filename,
                size,
                sha256,
            });
        } else {
            return res.status(400).send({
                error: 'Not a valid firmware URL'
            });
        }
    } catch (err) {
        return res.status(500).send(err);
    }

});

app.post('/api/displays', async(req, res) => {
    toggleDisplays();

    return res.status(204).send();
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));
