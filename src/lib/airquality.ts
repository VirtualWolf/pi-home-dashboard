import { noUpdatesReceived } from './update-checker';

export class AirQuality {
    name: string;
    timestamp: number;
    pm_1_0?: number | '—';
    pm_2_5?: number | '—';
    pm_10?: number | '—';
    particles_0_3um?: number | '—';
    particles_0_5um?: number | '—';
    particles_1_0um?: number | '—';
    particles_2_5um?: number | '—';
    particles_5_0um?: number | '—';
    particles_10um?: number | '—';
    aqi?: number | '—';
    eco2?: number | '—';
    tvoc?: number | '—';

    constructor(name: string) {
        this.name = name;
        this.timestamp = 0;
        this.pm_1_0 =  '—';
        this.pm_2_5 =  '—';
        this.pm_10 =  '—';
        this.particles_0_3um =  '—';
        this.particles_0_5um =  '—';
        this.particles_1_0um =  '—';
        this.particles_2_5um =  '—';
        this.particles_5_0um =  '—';
        this.particles_10um =  '—';
        this.aqi = '—';
        this.eco2 = '—';
        this.tvoc = '—';

        setInterval(() => this.checkForRecentUpdates(), 600000);
    }

    getCurrentData = () => {
        return {
            timestamp: this.timestamp,
            pm_1_0: this.pm_1_0,
            pm_2_5: this.pm_2_5,
            pm_10: this.pm_10,
            particles_0_3um: this.particles_0_3um,
            particles_0_5um: this.particles_0_5um,
            particles_1_0um: this.particles_1_0um,
            particles_2_5um: this.particles_2_5um,
            particles_5_0um: this.particles_5_0um,
            particles_10um: this.particles_10um,
            aqi: this.aqi,
            eco2: this.eco2,
            tvoc: this.tvoc,
        };
    }

    updateCurrentData = ({
            timestamp,
            pm_1_0,
            pm_2_5,
            pm_10,
            particles_0_3um,
            particles_0_5um,
            particles_1_0um,
            particles_2_5um,
            particles_5_0um,
            particles_10um,
            aqi,
            eco2,
            tvoc,
        }: {
            timestamp: number,
            pm_1_0?: number,
            pm_2_5?: number,
            pm_10?: number,
            particles_0_3um?: number,
            particles_0_5um?: number,
            particles_1_0um?: number,
            particles_2_5um?: number,
            particles_5_0um?: number,
            particles_10um?: number,
            aqi?: number,
            eco2?: number,
            tvoc?: number,
    }) => {
        this.timestamp = timestamp;
        this.pm_1_0 = pm_1_0;
        this.pm_2_5 = pm_2_5;
        this.pm_10 = pm_10;
        this.particles_0_3um = particles_0_3um;
        this.particles_0_5um = particles_0_5um;
        this.particles_1_0um = particles_1_0um;
        this.particles_2_5um = particles_2_5um;
        this.particles_5_0um = particles_5_0um;
        this.particles_10um = particles_10um;
        this.aqi = aqi;
        this.eco2 = eco2;
        this.tvoc = tvoc;
    };

    checkForRecentUpdates = () => {
        if (noUpdatesReceived({name: this.name, timestamp: this.timestamp, interval: 10})) {
            this.timestamp = 0;
            this.pm_1_0 = '—';
            this.pm_2_5 = '—';
            this.pm_10 = '—';
            this.particles_0_3um = '—';
            this.particles_0_5um = '—';
            this.particles_1_0um = '—';
            this.particles_2_5um = '—';
            this.particles_5_0um = '—';
            this.particles_10um = '—';
            this.aqi = '—';
            this.eco2 = '—'
            this.tvoc = '—'
        }
    }
}
