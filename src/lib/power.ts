import { noUpdatesReceived } from './update-checker';

export class Power {
    timestamp: number;
    consumption: string;
    production: string;
    batteryChargePercentage: string;
    batteryChargeState: 'idle' | 'draining' | 'charging';

    constructor() {
        this.timestamp = 0;
        this.consumption = '—';
        this.production = '—';
        this.batteryChargePercentage = '—';
        this.batteryChargeState = 'idle';

        setInterval(() => this.checkForRecentUpdates(), 60000);
    }

    getCurrentData = () => {
        return {
            timestamp: this.timestamp,
            consumption: this.consumption,
            production: this.production,
            batteryChargePercentage: this.batteryChargePercentage,
            batteryChargeState: this.batteryChargeState,
        }
    }

    updateCurrentData = (
        {timestamp, home_usage, solar_generation, battery_charge_percentage, battery_flow}: {
            timestamp: number, home_usage: number, solar_generation: number, battery_charge_percentage: number, battery_flow: number,
        }) => {
            this.timestamp = timestamp;

            this.consumption = (home_usage/1000).toFixed(2);

            this.production = solar_generation <= 30
                ? '0'
                : (solar_generation/1000).toFixed(2);

            this.batteryChargePercentage = battery_charge_percentage.toFixed(1);

            this.batteryChargeState = battery_flow >= -30 && battery_flow <= 30
                ? 'idle'
                : battery_flow > 30
                    ? 'draining'
                    : 'charging';
    }

    checkForRecentUpdates = () => {
        if (noUpdatesReceived({name: 'power', timestamp: this.timestamp})) {
            this.timestamp = 0;
            this.consumption = '—';
            this.production = '—';
            this.batteryChargePercentage = '—';
            this.batteryChargeState = 'idle';
        }
    }
}
