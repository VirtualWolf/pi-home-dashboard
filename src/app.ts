import express from 'express';
import { subscribeToBroker, getCurrentData } from './lib/mqtt';

const app = express();

app.use(express.static('public'));

subscribeToBroker();

app.get('/api', async(req, res) => {
    return res.json(getCurrentData());
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));
