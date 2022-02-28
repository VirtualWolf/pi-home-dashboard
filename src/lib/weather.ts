import { noUpdatesReceived } from './update-checker';

export class Weather {
    name: string;
    temperature: string;
    humidity: string;
    timestamp: number;

    constructor(name: string) {
        this.name = name;
        this.temperature = '—';
        this.humidity = '—';
        this.timestamp = 0;

        setInterval(() => this.checkForRecentUpdates(), 60000);
    }

    getCurrentData = () => {
        return {
            timestamp: this.timestamp,
            temperature: this.temperature,
            humidity: this.humidity,
        }
    }

    updateCurrentData = ({timestamp, temperature, humidity}: {timestamp: number, temperature: number, humidity: number}) => {
        this.timestamp = timestamp;
        this.temperature = temperature.toFixed(1);
        this.humidity = humidity.toFixed(0);
    }

    checkForRecentUpdates = () => {
        if (noUpdatesReceived({name: this.name, timestamp: this.timestamp})) {
            this.timestamp = 0;
            this.temperature = '—';
            this.humidity = '—';
        }
    }
}
