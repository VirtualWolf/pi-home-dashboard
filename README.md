# pi-home-dashboard

This is a simple Node.js backend and Vue frontend written to display temperature and humidity data as well as the current power consumption, production, and charge percentage and state of a Tesla Powerwall 2 battery, and display it on a screen in a dashboard fashion at `/index.html`. There's also a clock at `/clock.html`. These have been sized for viewing on a [Pimoroni HyperPixel 4 display](https://shop.pimoroni.com/products/hyperpixel-4?variant=12569539706963).

It subscribes to three different types of topics on an MQTT broker, one for temperature and humidity, one for the Powerwall data, and one for an air quality sensor. The Powerwall data is fed by [powerwall-to-pvoutput-uploader](https://github.com/VirtualWolf/powerwall-to-pvoutput-uploader), the temperature and humidity data comes from [esp32-sensor-reader-mqtt](https://github.com/VirtualWolf/esp32-sensor-reader-mqtt), and the air quality from [esp32-air-quality-reader-mqtt](https://github.com/VirtualWolf/esp32-air-quality-reader-mqtt).

The air quality data is available at `/api` but isn't shown on the main `index.html` view due to lack of space.

It requires a file called `config.json` in the root level of the repository with the following contents:

```json
{
    "brokerAddress": "localhost",
    "topics": {
        "weather": [
            "home/outdoor/weather",
            "home/indoor/weather"
        ],
        "airquality": [
            "home/outdoor/airquality"
        ],
        "power": [
            "home/power"
        ]
    }
}
```

On the main dashboard page at `/index.html`, the upper and lower temperature/humidity locations default to `outdoor` and `indoor` respectively, but can be changed by optionally setting the `upper` and/or `lower` query parameters, e.g. `http://localhost/index.html?upper=office&lower=outdoor`.

## Changing colour for night time
Because none of the night time colour-changing applications work on Raspberry Pi ([xflux](https://justgetflux.com/linux.html), [Redshift](https://github.com/jonls/redshift)), you can optionally set a `location` object in `config.json` to have the body text colour change to a more yellow colour after sunset and before sunrise based on the time in your latitude and longitude:

```json
{
    "brokerAddress": "localhost",
    [...]
    "location": {
        "latitude": -33.872761,
        "longitude": 151.205338
    }
}
```

This uses [Suncalc](https://github.com/mourner/suncalc) to do the time calculations.

## ESP32 management
This repository also includes an admin UI to manage the ESP32s that are running the [esp32-sensor-reader-mqtt](https://github.com/VirtualWolf/esp32-sensor-reader-mqtt) code, it lives at `/admin.html` and requires some extra configuration in the `config.json` file, which is an array of the client IDs of all the ESP32s you want to manage:

```json
{
    "brokerAddress": "localhost",
    [...]
    "clientIds": [
        "outdoor", "backroom", "indoor", "office"
    ]
}
```

Each one specified here will show as a button in the UI and allow you to configure it.

For over-the-air firmware updates, the board must initially be flashed with the "Support for OTA" firmware from the [MicroPython download page](https://micropython.org/download/) for your specific board.
