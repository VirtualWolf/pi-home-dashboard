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
        // Powerwall has a self-signed certificate hence the use of .disableTLSCerts()
        const batteryPercentage = await request.get(`${config.power}/api/system_status/soe`)
            .disableTLSCerts()
            .timeout({response: 15000});


        const usage = await request.get(`${config.power}/api/meters/aggregates`)
            .timeout({response: 15000})
            .disableTLSCerts();

        powerData = {
            consumption: (usage.body.load.instant_power/1000).toFixed(2),
            production: (usage.body.solar.instant_power/1000).toFixed(2),
            battery: batteryPercentage.body.percentage.toFixed(0),
            batteryChargeState: usage.body.battery.instant_power === 0
                ? 'idle'
                : usage.body.battery.instant_power > 0
                    ? 'draining'
                    : 'charging',
        }
    } catch (err) {
        powerData = { consumption: '—', production: '—', battery: '—', batteryChargeState: 'idle', }
    }

    return res.json({
        outdoor: outdoorData,
        indoor: indoorData,
        power: powerData,
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
