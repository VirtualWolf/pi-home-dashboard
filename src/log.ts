export default function log(message: string, level: 'INFO' | 'DEBUG' = 'INFO') {
    const time = new Date().toLocaleTimeString('en-AU', {hour12: false})

    if (process.env.DEBUG && level === 'DEBUG') {
        console.log(`${time} [${level}]`, message);
    } else if (level !== 'DEBUG') {
        console.log(`${time} [${level}]`, message);
    }
}
