import request from 'superagent';

export async function getSensorData(url: string) {
    try {
        const response = await request.get(url)
            .timeout({response: 5000});

        return {
            temperature: response.body.temperature.toFixed(1),
            humidity: response.body.humidity.toFixed(0),
        }
    } catch (err) {
        console.error(err);

        return {
            temperature: '—',
            humidity: '—',
        };
    }
}
