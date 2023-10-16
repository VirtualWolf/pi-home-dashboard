import express from 'express';
import { subscribeToBroker, getCurrentData, setHyperPixelDisplayIsOn } from './lib/mqtt';
const config = require('../config.json');

const app = express();

app.use(express.static('public'));
app.use(express.json());

subscribeToBroker();

app.get('/api', async(req, res) => {
    return res.json(getCurrentData());
});

app.get('/api/config', async (req, res) => {
    return res.json(config);
});

app.post('/api/hyperpixel', async(req, res) => {
    setHyperPixelDisplayIsOn(req.body.is_on);

    return res.status(204).send();
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));
