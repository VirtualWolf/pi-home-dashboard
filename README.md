# pi-home-dashboard

This is a simple Node.js backend and Vue frontend written to display temperature and humidity data as well as the current power consumption, production, and charge percentage and state of a Tesla Powerwall 2 battery, and display it on a screen in a dashboard fashion at `/index.html`. There's also a clock at `/clock.html`. These have been sized for viewing on a [Pimoroni HyperPixel 4 display](https://shop.pimoroni.com/products/hyperpixel-4?variant=12569539706963).

It subscribes to four topics on an MQTT broker, one for outdoor temperature and humidity, one for indoor temperature and humidity, one for the Powerwall data, and one for an air quality sensor. The Powerwall data is fed by [powerwall-to-pvoutput-uploader](https://github.com/VirtualWolf/powerwall-to-pvoutput-uploader), the temperature and humidity data comes from [esp32-sensor-reader-mqtt](https://github.com/VirtualWolf/esp32-sensor-reader-mqtt), and the air quality from [esp32-air-quality-reader-mqtt](https://github.com/VirtualWolf/esp32-air-quality-reader-mqtt).

The air quality data is available at `/api` but isn't shown on the main `index.html` view due to lack of space.

It requires a file called `config.json` in the root level of the repository with the following contents:

```json
{
    "brokerAddress": "localhost",
    "topics": {
        "outdoor": "home/outdoor/weather",
        "indoor": "home/indoor/weather",
        "power": "home/power",
        "airquality": "home/outdoor/airquality"
    }
}
```
