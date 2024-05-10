import { connect } from 'mqtt';
import { Weather } from './weather';
import { AirQuality } from './airquality';
import { Power } from './power';
import log from '../log';
const config = require('../../config.json');

const weatherData = new Array<Weather>();
const airQualityData = new Array<AirQuality>();
const powerData = new Array<Power>();
let displaysOn = true;

const client = connect({
    servers: [{
        host: config.brokerAddress,
        port: config.brokerPort || 1883,
    }],
    clientId: config.clientId || 'pi-home-dashboard',
    clean: config.clean || true,
});

export function subscribeToBroker() {
    const topics: string[] = [];

    if (config.topics.displays) {
        topics.push(config.topics.displays);
    }

    Object.keys(config.topics).forEach((type: string) => {
        Object.values(config.topics[type]).forEach((topic: any) => {
            topics.push(topic);

            if (type === 'weather') {
                const location: string = topic.split('/').slice(-2, -1).join();

                weatherData.push(new Weather(location));
            }

            if (type === 'airquality') {
                const location: string = topic.split('/').slice(-2, -1).join();

                airQualityData.push(new AirQuality(location));
            }

            if (type === 'power') {
                powerData.push(new Power());
            }
        });
    });

    client.subscribe(Object.values(topics), {qos: 1});

    client.on('message', (topic, message) => {
        log(`Message received on topic ${topic}: ${message.toString()}`, 'DEBUG');

        const json = JSON.parse(message.toString());

        if (topic === config.topics.displays) {
            displaysOn = json.is_on;
        }

        if (config.topics.weather?.includes(topic)) {
            // Weather topics end in the form "/$LOCATION/weather"
            const location = topic.split('/').slice(-2, -1).join();

            const index = weatherData.findIndex(element => element.name === location);

            weatherData[index].updateCurrentData({
                timestamp: json.timestamp,
                temperature: json.temperature,
                humidity: json.humidity,
                dew_point: json.dew_point,
                pressure: json.pressure,
            });
        }

        if (config.topics.power?.includes(topic)) {
            powerData[0].updateCurrentData({
                timestamp: json.timestamp,
                home_usage: json.home_usage,
                solar_generation: json.solar_generation,
                battery_charge_percentage: json.battery_charge_percentage,
                battery_flow: json.battery_flow,
            });
        }

        if (config.topics.airquality?.includes(topic)) {
            // Air quality topics end in the form "/$LOCATION/airquality"
            const location = topic.split('/').slice(-2, -1).join();

            const index = airQualityData.findIndex(element => element.name === location);

            airQualityData[index].updateCurrentData({
                timestamp: json.timestamp,
                pm_1_0: json.pm_1_0,
                pm_2_5: json.pm_2_5,
                pm_10: json.pm_10,
                particles_0_3um: json.particles_0_3um,
                particles_0_5um: json.particles_0_5um,
                particles_1_0um: json.particles_1_0um,
                particles_2_5um: json.particles_2_5um,
                particles_5_0um: json.particles_5_0um,
                particles_10um: json.particles_10um,
                aqi: json.aqi,
                eco2: json.eco2,
                tvoc: json.tvoc,
            });
        }
    });
}

export function getCurrentData() {
    const allData: any = {};

    airQualityData.forEach(location => {
        allData[location.name] = {
            ...allData[location.name],
            ...location.getCurrentData(),
        };
    });

    weatherData.forEach(location => {
        allData[location.name] = {
            ...allData[location.name],
            ...location.getCurrentData(),
        };
    });

    allData.power = powerData[0].getCurrentData();

    return allData;
}

export function toggleDisplays() {
    const payload = JSON.stringify({is_on: !displaysOn});

    client.publish(config.topics.displays, payload, {
        qos: 2,
        retain: true,
    }, (err: any) => {
        if (err) {
            log(err.message);
        } else {
            log(`Message successfully sent to ${config.topics.displays}: ${payload}`);
        }
    });
}
