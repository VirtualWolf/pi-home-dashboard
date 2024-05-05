let latitude, longitude;

const getLocation = async () => {
    const response = await fetch('/api/admin/config');
    const json = await response.json();

    if (json.location?.latitude && json.location?.longitude) {
        latitude =  json.location.latitude;
        longitude = json.location.longitude;
    }
}

const isDayTime = () => {
    if (latitude && longitude) {
        const now = new Date();
        const { sunrise, sunset } = SunCalc.getTimes(now, latitude, longitude);

        return now > sunrise && now < sunset
            ? true
            : false;
    } else {
        return true;
    }
}
