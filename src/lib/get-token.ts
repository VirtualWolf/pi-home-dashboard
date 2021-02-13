import request from 'superagent';
const config = require('../../config.json');

let token: string | undefined;

export async function getToken(refresh = false) {
    if (token && refresh === false) {
        return token;
    }

    try {
        const response = await request.post(`${config.power}/api/login/Basic`)
            .send({
                'username': 'customer',
                'password': config.password,
                "email": config.email,
                "force_sm_off":true,
            })
            .disableTLSCerts()
            .timeout(5000);

        token = response.body.token;

        return token;
    } catch (err) {
        console.error(`Failed to get a token: ${err.status} ${err.message}`);
    }
}
