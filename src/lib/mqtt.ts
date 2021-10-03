import { connect } from 'mqtt';
import { DateTime } from 'luxon';
const config = require('../../config.json');

export const currentData = {
    outdoor: {
        timestamp: 0,
        temperature: '—',
        humidity: '—',
    },
    indoor: {
        timestamp: 0,
        temperature: '—',
        humidity: '—',
    },
    power: {
        timestamp: 0,
        consumption: '—',
        production: '—',
        batteryChargePercentage: '—',
        batteryChargeState: 'idle',
    }
}

export function checkForRecentUpdates() {
    const now = DateTime.utc();

    const outdoorDiff = now.diff(DateTime.fromMillis(currentData.outdoor.timestamp), 'minutes').toObject();
    const indoorDiff = now.diff(DateTime.fromMillis(currentData.indoor.timestamp), 'minutes').toObject();
    const powerDiff = now.diff(DateTime.fromMillis(currentData.power.timestamp), 'minutes').toObject();

    if (outdoorDiff.minutes && outdoorDiff.minutes > 1) {
        log('Outdoor difference was greater than one minute, got ' + outdoorDiff.minutes, 'DEBUG');

        currentData.outdoor = {
            timestamp: 0,
            temperature: '—',
            humidity: '—',
        };
    }

    if (indoorDiff.minutes && indoorDiff.minutes > 1) {
        log('Indoor difference was greater than one minute, got ' + indoorDiff.minutes, 'DEBUG');

        currentData.indoor = {
            timestamp: 0,
            temperature: '—',
            humidity: '—',
        };
    }

    if (powerDiff.minutes && powerDiff.minutes > 1) {
        log('Power difference was greater than one minute, got ' + powerDiff.minutes, 'DEBUG');

        currentData.power = {
            timestamp: 0,
            consumption: '—',
            production: '—',
            batteryChargePercentage: '—',
            batteryChargeState: 'idle',
        };
    }
}

export function subscribeToBroker() {
    const client = connect('mqtt://' + config.brokerAddress, {
        clientId: 'pi-home-dashboard',
    });

    client.subscribe(Object.values(config.topics), {qos: 1});

    client.on('message', (topic, message) => {
        log(`Message received on topic ${topic}: ${message.toString()}`, 'DEBUG');

        if (topic === config.topics.outdoor || topic === config.topics.indoor) {
            const json = JSON.parse(message.toString());

            const location = Object.keys(config.topics).find(key => config.topics[key] === topic);

            updateCurrentWeatherData(<Location>location, json);
        }

        if (topic === config.topics.power) {
            const json = JSON.parse(message.toString());

            currentData.power.timestamp = json.timestamp;

            currentData.power.consumption = (json.home_usage/1000).toFixed(2);
            currentData.power.production = json.solar_generation <= 30
                ? '0.00'
                : (json.solar_generation/1000).toFixed(2);
            currentData.power.batteryChargePercentage = json.battery_charge_percentage.toFixed(1);
            currentData.power.batteryChargeState = json.battery_flow >= -30 && json.battery_flow <= 30
                ? 'idle'
                : json.battery_flow > 30
                    ? 'draining'
                    : 'charging';
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
    currentData[location].timestamp = message.timestamp;
}

function log(message: string, level: 'INFO' | 'DEBUG' = 'INFO') {
    const time = new Date().toLocaleTimeString('en-AU', {hour12: false})

    if (process.env.DEBUG && level === 'DEBUG') {
        console.log(`${time} [${level}]`, message);
    } else if (level !== 'DEBUG') {
        console.log(`${time} [${level}]`, message);
    }
}
