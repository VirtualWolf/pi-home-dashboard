import { noUpdatesReceived } from './update-checker';

export class Weather {
    name: string;
    temperature: string;
    humidity: string;
    timestamp: number;
    dew_point?: string;
    pressure?: string;
    noUpdatesReceived: boolean;

    constructor(name: string) {
        this.name = name;
        this.temperature = '—';
        this.humidity = '—';
        this.dew_point = undefined;
        this.pressure = undefined;
        this.timestamp = 0;
        this.noUpdatesReceived = false;

        setInterval(() => this.checkForRecentUpdates(), 120000);
    }

    getCurrentData = () => {
        return {
            timestamp: this.timestamp,
            temperature: this.temperature,
            humidity: this.humidity,
            dew_point: this.dew_point,
            pressure: this.pressure,
            noUpdatesReceived: this.noUpdatesReceived,
        }
    }

    updateCurrentData = ({timestamp, temperature, humidity, dew_point, pressure}: {timestamp: number, temperature: number, humidity: number, dew_point?: number, pressure?: number}) => {
        this.timestamp = timestamp;
        this.temperature = temperature.toFixed(1);
        this.humidity = humidity.toFixed(0);
        this.dew_point = dew_point
            ? dew_point.toFixed(1)
            : undefined,
        this.pressure = pressure
            ? pressure.toFixed(0)
            : undefined,
        this.noUpdatesReceived = false;
    }

    checkForRecentUpdates = () => {
        if (noUpdatesReceived({name: this.name, timestamp: this.timestamp})) {
            this.noUpdatesReceived = true;
        }
    }
}
