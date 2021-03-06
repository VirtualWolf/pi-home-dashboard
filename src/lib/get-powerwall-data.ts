import request from 'superagent';
import { getToken } from './get-token';
const config = require('../../config.json');

interface PowerwallData {
    consumption: number | string;
    production: number | string;
    batteryChargePercentage: number | string;
    batteryChargeState: string;
}

export async function getPowerwallData(): Promise<PowerwallData> {
    let token = await getToken();

    try {
        // Powerwall has a self-signed certificate hence the use of .disableTLSCerts()
        const batteryPercentage = await request.get(`${config.power}/api/system_status/soe`)
            .set('Cookie', `AuthCookie=${token}`)
            .disableTLSCerts()
            .timeout({response: 5000});

        const usage = await request.get(`${config.power}/api/meters/aggregates`)
            .set('Cookie', `AuthCookie=${token}`)
            .timeout({response: 5000})
            .disableTLSCerts();

        return {
            consumption: (usage.body.load.instant_power/1000).toFixed(2),
            production: (usage.body.solar.instant_power/1000).toFixed(2) === '-0.00'
                ? '0.00'
                : (usage.body.solar.instant_power/1000).toFixed(2),
            batteryChargePercentage: batteryPercentage.body.percentage.toFixed(1),
            batteryChargeState: usage.body.battery.instant_power === 0
                ? 'idle'
                : usage.body.battery.instant_power > 0
                    ? 'draining'
                    : 'charging',
        }
    } catch (err) {
        const defaultPowerwallData = {
            consumption: '—',
            production: '—',
            batteryChargePercentage: '—',
            batteryChargeState: 'idle',
        };

        if (err.status === 401 || err.status === 403) {
            console.warn('Access to API was forbidden, getting a new token...');

            try {
                token = await getToken(true);

                return defaultPowerwallData;
            } catch (err) {
                console.error(`Failed to get a token: ${err.status} ${err.message}`);

                return defaultPowerwallData;
            }
        } else {
            return defaultPowerwallData;
        }
    }
}
