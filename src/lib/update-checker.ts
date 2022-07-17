import { DateTime } from 'luxon';
import log from '../log';

export function noUpdatesReceived({name, timestamp, interval = 1}: {name: string, timestamp: number, interval?: number}) {
    const now = DateTime.utc();

    const diff = now.diff(DateTime.fromMillis(timestamp), 'minutes').toObject();

    if (diff.minutes && diff.minutes > interval) {
        log(`${name}: Difference was greater than ${interval} minute(s), got ${diff.minutes}`, 'DEBUG');

        return true;
    }

    return false;
}
