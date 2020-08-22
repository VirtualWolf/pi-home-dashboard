const express = require('express');
const cors = require('cors');
const request = require('superagent');
const config = require('./config.json');

const app = express();
app.use(cors());

app.get('/', async(req, res) => {
    let outdoorData, indoorData, powerData;

    try {
        const { body } = await request.get(config.outdoor).timeout({response: 2000});
        outdoorData = body;
    } catch(err) {
        outdoorData = { temperature: '—', humidity: '—' };
    }

    try {
        const { body } = await request.get(config.indoor).timeout({response: 2000});
        indoorData = body;
    } catch (err) {
        indoorData = { temperature: '—', humidity: '—' };
    }

    try {
        const { body } = await request.get(config.power).timeout({response: 15000});
        powerData = {
            consumption: (body.consumption[0].wNow/1000).toFixed(2),
            production: (body.production[0].wNow/1000).toFixed(2),
        }
    } catch (err) {
        powerData = { consumption: '—', production: '—' }
    }

    return res.json({
        outdoor: outdoorData,
        indoor: indoorData,
        power: powerData,
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));