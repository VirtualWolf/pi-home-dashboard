import express from 'express';
import { getSensorData } from './lib/get-sensor-data';
import { getPowerwallData } from './lib/get-powerwall-data';
const config = require('../config.json');

const app = express();

app.use(express.static('public'));

app.get('/api', async(req, res) => {
    const [outdoorData, indoorData, powerwallData] = await Promise.all([
        await getSensorData(config.outdoor),
        await getSensorData(config.indoor),
        await getPowerwallData(),
    ]);

    return res.json({
        outdoor: outdoorData,
        indoor: indoorData,
        power: powerwallData,
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));
