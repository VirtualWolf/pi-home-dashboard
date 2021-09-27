import { connect } from 'mqtt';
const config = require('../../config.json');

export const currentData = {
    outdoor: {
        temperature: '—',
        humidity: '—',
    },
    indoor: {
        temperature: '—',
        humidity: '—',
    },
    power: {
        consumption: '—',
        production: '—',
        batteryChargePercentage: '—',
        batteryChargeState: 'idle',
    }
}

export function subscribeToBroker() {
    const client = connect('mqtt://' + config.brokerAddress, {
        clientId: 'pi-home-dashboard',
        clean: false,
    });

    client.subscribe(Object.values(config.topics), {qos: 1});

    client.on('message', (topic, message) => {
        log(`Message received on topic ${topic}: ${message.toString()}`, 'DEBUG');

        if (topic === config.topics.outdoor || topic === config.topics.indoor) {
            const json = JSON.parse(message.toString());

            const location = Object.keys(config.topics).find(key => config.topics[key] === topic);

            updateCurrentWeatherData(<Location>location, json);
        } else if (topic === config.topics.power) {
            const json = JSON.parse(message.toString());

            currentData.power = json;
        }
    });
}

type Location = 'outdoor' | 'indoor';

interface Message {
    timestamp: number;
    temperature: number;
    humidity: number;
}

function updateCurrentWeatherData(location: Location, message: Message) {
    currentData[location].temperature = message.temperature.toFixed(1);
    currentData[location].humidity = message.humidity.toFixed(0);
}

function log(message: string, level: 'INFO' | 'DEBUG' = 'INFO') {
    const time = new Date().toLocaleTimeString('en-AU', {hour12: false})

    if (process.env.DEBUG && level === 'DEBUG') {
        console.log(`${time} [${level}]`, message);
    } else if (level !== 'DEBUG') {
        console.log(`${time} [${level}]`, message);
    }
}
