(async () => await checkForLocationConfiguration())()

async function checkForLocationConfiguration() {
    const response = await fetch('/api/config');
    const json = await response.json();

    if (json.location?.latitude && json.location?.longitude) {
        setInterval(() => setBodyColour({
            latitude: json.location.latitude,
            longitude: json.location.longitude,
        }), 60000);
    }
}

function setBodyColour({latitude, longitude}) {
    const now = new Date();
    const { sunrise, sunset } = SunCalc.getTimes(now, latitude, longitude);

    const body = document.getElementsByTagName('body');

    if (now < sunrise || now > sunset) {
        body[0].style.setProperty('color', '#e9c996');
    } else {
        body[0].style.setProperty('color', '#ffffff');
    }
}
