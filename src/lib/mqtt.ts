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
    },
    airquality: {
        timestamp: 0,
        pm_1_0: '—',
        pm_2_5: '—',
        pm_10: '—',
        particles_0_3um: '—',
        particles_0_5um: '—',
        particles_1_0um: '—',
        particles_2_5um: '—',
        particles_5_0um: '—',
        particles_10um: '—',
    },
}

export function checkForRecentUpdates() {
    const now = DateTime.utc();

    const outdoorDiff = now.diff(DateTime.fromMillis(currentData.outdoor.timestamp), 'minutes').toObject();
    const indoorDiff = now.diff(DateTime.fromMillis(currentData.indoor.timestamp), 'minutes').toObject();
    const powerDiff = now.diff(DateTime.fromMillis(currentData.power.timestamp), 'minutes').toObject();
    const airQualityDiff = now.diff(DateTime.fromMillis(currentData.airquality.timestamp), 'minutes').toObject();

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

    if (airQualityDiff.minutes && airQualityDiff.minutes > 10) {
        log('Air quality difference was greater than 10 minutes, got ' + airQualityDiff.minutes, 'DEBUG');

        currentData.airquality = {
            timestamp: 0,
            pm_1_0: '—',
            pm_2_5: '—',
            pm_10: '—',
            particles_0_3um: '—',
            particles_0_5um: '—',
            particles_1_0um: '—',
            particles_2_5um: '—',
            particles_5_0um: '—',
            particles_10um: '—',
        }
    }
}

export function subscribeToBroker() {
    const client = connect('mqtt://' + config.brokerAddress, {
        clientId: 'pi-home-dashboard',
    });

    client.subscribe(Object.values(config.topics), {qos: 1});

    client.on('message', (topic, message) => {
        log(`Message received on topic ${topic}: ${message.toString()}`, 'DEBUG');

        const json = JSON.parse(message.toString());

        if (topic === config.topics.outdoor || topic === config.topics.indoor) {
            const location = Object.keys(config.topics).find(key => config.topics[key] === topic);

            updateCurrentWeatherData(<Location>location, json);
        }

        if (topic === config.topics.power) {
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

        if (topic === config.topics.airquality) {
            currentData.airquality = json;
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
