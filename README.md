# pi-home-dashboard

This is a simple Node.js backend and Vue frontend written to display temperature and humidity data as well as the current power consumption, production, and charge percentage and state of a Tesla Powerwall 2 battery, and display it on a screen in a dashboard fashion.

It subscribes to three topics on an MQTT broker, one for outdoor temperature and humidity, one for indoor temperature and humidity, and one for the Powerwall data. The Powerwall data is fed by [powerwall-to-pvoutput-uploader](https://github.com/VirtualWolf/powerwall-to-pvoutput-uploader), and the temperature and humidity data comes from [esp32-sensor-reader-mqtt](https://github.com/VirtualWolf/esp32-sensor-reader-mqtt).

It requires a file called `config.json` in the root level of the repository with the following contents:

```json
{
    "brokerAddress": "localhost",
    "topics": {
        "outdoor": "home/outdoor/weather",
        "indoor": "home/indoor/weather",
        "power": "home/power"
    }
}
```
