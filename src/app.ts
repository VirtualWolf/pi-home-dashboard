import express from 'express';
import cors from 'cors';
import request from 'superagent';
import { getPowerwallData } from './lib/get-powerwall-data';
const config = require('../config.json');

const app = express();
app.use(cors());

app.get('/', async(req, res) => {
    let outdoorData, indoorData;

    try {
        const { body } = await request.get(config.outdoor)
            .timeout({response: 2000});

        outdoorData = body;
    } catch(err) {
        outdoorData = { temperature: '—', humidity: '—' };
    }

    try {
        const { body } = await request.get(config.indoor)
            .timeout({response: 2000});

        indoorData = body;
    } catch (err) {
        indoorData = { temperature: '—', humidity: '—' };
    }

    return res.json({
        outdoor: outdoorData,
        indoor: indoorData,
        power: await getPowerwallData(),
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));
