const express = require('express');
const cors = require('cors');
const request = require('superagent');
const config = require('./config.json');

const app = express();
app.use(cors());

app.get('/', async(req, res) => {
    const outdoor = await request.get(config.outdoor);
    const indoor = await request.get(config.indoor);
    const power = await request.get(config.power);

    return res.json({
        outdoor: outdoor.body,
        indoor: indoor.body,
        power: {
            consumption: power.body.consumption[0].wNow,
            production: power.body.production[0].wNow,
        },
    })
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));