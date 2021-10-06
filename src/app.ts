import express from 'express';
import { subscribeToBroker, checkForRecentUpdates, currentData } from './lib/mqtt';

const app = express();

app.use(express.static('public'));

subscribeToBroker();

setInterval(() => checkForRecentUpdates(), 60000);

app.get('/api', async(req, res) => {
    return res.json({
        outdoor: currentData.outdoor,
        indoor: currentData.indoor,
        power: currentData.power,
        airquality: currentData.airquality,
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));
