const Admin = {
    data() {
        return {
            config: {},
            clientIds: [],
            selectedClient: undefined,
            selectedClientConfig: {
                ssid: undefined,
                wifi_pw: undefined,
                server: undefined,
                port: undefined,
                client_id: undefined,
                ntp_server: undefined,
                sensors: [],
                sda_pin: undefined,
                scl_pin: undefined,
                led_pin: undefined,
                neopixel_pin: undefined,
                neopixel_power_pin: undefined,
                disable_watchdog: false,
                github_token: undefined,
                github_username: undefined,
                github_repository: undefined,
                github_ref: undefined,
                status: undefined,
            },
            subscriptionActive: false,
            connecting: false,
            connected: false,
            messages: [],
            sensorTypes: [
                {text: 'DHT22', value: 'dht22'},
                {text: 'BME280', value: 'bme280'},
                {text: 'PMS5003', value: 'pms5003'},
                {text: 'ENS160', value: 'ens160'},
            ],
            firmware: {
                url: undefined,
                size: undefined,
                sha256: undefined,
                is_valid_url: false,
                update_status: undefined,
            },
            replacementConfiguration: {
                config: '',
                isValidJson: false,
            }
        };
    },

    async mounted() {
        await this.fetchConfig()
        await this.connect();
    },

    computed: {
        inputsDisabled() {
            return !this.connected || !this.subscriptionActive || this.selectedClientConfig.status === 'offline'
        },

        hidePlaceholderText() {
            return !this.subscriptionActive || this.selectedClientConfig.status === 'offline'
        },

        updateFirmwareButtonDisabled() {
            return this.inputsDisabled || !this.firmware.url || !this.firmware.is_valid_url || this.firmware.update_status === 'updating';
        }
    },

    methods: {
        async fetchConfig() {
            const response = await fetch('/api/admin/config');
            const json = await response.json();

            return this.config = {
                host: json.brokerAddress,
                port: 8083,
                protocol: 'ws',
                clientIds: json.clientIds,
            };
        },

        init() {
            this.connecting = false;
            this.subscriptionActive = false;
        },

        async connect() {
            try {
                this.connecting = true;

                const { protocol, host, port, ...options } = this.config;
                const connectionUrl = `${protocol}://${host}:${port}`;

                this.client = mqtt.connect(connectionUrl, options);

                if (this.client.on) {
                    this.client.on('connect', () => {
                        this.connecting = false;
                        this.connected = true;

                        console.log(`Connection to broker at ${host}:${port} succeeded`);
                    });

                    this.client.on('message', async (topic, message) => {
                        console.log(`Received message on ${topic}: ${message}`);

                        try {
                            const json = JSON.parse(message);

                            if (json.config) {
                                this.selectedClientConfig = json.config;
                            }

                            if (json.status) {
                                this.selectedClientConfig.status = json.status;

                                if (json.status === 'online') {
                                    await this.getClientConfiguration(this.selectedClient);
                                }
                            }

                            if (json.update_status) {
                                this.firmware.update_status = json.update_status;

                                if (json.update_status === 'updated' || json.update_status === 'failed') {
                                    this.firmware.url = undefined;
                                    this.firmware.size = undefined;
                                    this.firmware.sha256 = undefined;
                                }
                            }
                        } catch (err) {
                            console.log(err)
                        }

                        const now = new Date();
                        const hour = now.getHours().toString().padStart(2, '0');
                        const minute = now.getMinutes().toString().padStart(2, '0');
                        this.messages.unshift(`[${hour}:${minute}] ` + message.toString());
                    });

                    this.client.on('offline', () => {
                        this.connecting = true;
                        this.connected = false;
                    })
                }
            } catch (err) {
                this.connecting = false;
                console.log('MQTT connection error', err);
            }
        },

        async subscribe(clientId) {
            const topic = `logs/${clientId}`;

            try {
                await this.client.subscribeAsync(topic, {qos: 1});

                this.subscriptionActive = true;

                console.log(`Successfully subscribed to ${topic}`);
            } catch (err) {
                console.log(`Subscription to ${topic} failed`, err);

                return;
            }

        },

        async unsubscribe(clientId) {
            try {
                await this.client.unsubscribeAsync(`logs/${clientId}`);

                console.log(`Successfully unsubscribed from ${clientId}`);

                this.selectedClient = undefined;
                this.subscriptionActive = false;
                this.messages = [];
            } catch (err) {
                console.log(`Failed to unsubscribe from logs/${clientId}`, err);
            }

        },

        async setActiveClient(clientId) {
            if (this.selectedClient !== clientId && this.selectedClient !== undefined) {
                this.resetLoadedConfiguration();

                await this.unsubscribe(clientId);
            }

            if (this.selectedClient === clientId) {
                this.resetLoadedConfiguration();

                await this.unsubscribe(clientId);

                return;
            }

            this.selectedClient = clientId;

            await this.subscribe(clientId);
        },

        resetLoadedConfiguration() {
            this.selectedClientConfig = {
                ssid: undefined,
                wifi_pw: undefined,
                server: undefined,
                port: undefined,
                client_id: undefined,
                ntp_server: undefined,
                sensors: [],
                sda_pin: undefined,
                scl_pin: undefined,
                led_pin: undefined,
                neopixel_pin: undefined,
                neopixel_power_pin: undefined,
                disable_watchdog: false,
                github_username: undefined,
                github_token: undefined,
                github_repository: undefined,
                github_ref: undefined,
                is_offline: undefined,
            };

            this.firmware = {
                url: undefined,
                size: undefined,
                sha256: undefined,
                is_valid_url: false,
                update_status: undefined,
            };

            this.replacementConfiguration = {
                config: '',
                isValidJson: false,
            };
        },

        async getClientConfiguration() {
            await this.sendCommand({ command: 'get_config' });
        },

        addSensor() {
            const emptySensorConfig = {
                type: '',
                enable_additional_data: true,
                topic: '',
            }

            if (!this.selectedClientConfig.sensors) {
                this.selectedClientConfig.sensors = [emptySensorConfig];
            } else {
                this.selectedClientConfig.sensors.push(emptySensorConfig);
            }
        },

        removeSensor(sensorIndex) {
            const newSensorsList = this.selectedClientConfig.sensors.filter((value, index) => index !== sensorIndex);

            this.selectedClientConfig.sensors = newSensorsList;
        },

        updateSensorConfig() {
            const sensors = this.selectedClientConfig.sensors.map(sensor => {
                return {
                    ...sensor,
                    i2c_address: sensor.i2c_address
                        ? parseInt(sensor.i2c_address)
                        : undefined,
                    rx_pin: sensor.rx_pin
                        ? parseInt(sensor.rx_pin)
                        : undefined,
                }
            });

            this.sendCommand({
                command: 'update_config',
                config: {
                    sensors,
                }
            });
        },

        async triggerSoftwareUpdate() {
            await this.sendCommand({command: 'update_code'});
        },

        async checkIfValidFirmwareUrl(event) {
            try {
                const url = new URL(event.target.value);

                if (url.hostname === 'micropython.org' && url.pathname.match(/^.*-OTA-.*\.app-bin$/)) {
                    this.firmware.is_valid_url = true;
                } else {
                    this.firmware.is_valid_url = false;
                }
            } catch (err) {
                this.firmware.is_valid_url = false;
            }
        },

        async triggerFirmwareUpdate() {
            try {
                this.firmware.update_in_progress = true;

                const response = await fetch('/api/admin/start-firmware-update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        url: this.firmware.url,
                    }),
                });

                if (response.status === 200) {
                    const json = await response.json();

                    this.firmware.sha256 = json.sha256;
                    this.firmware.size = json.size;

                    // Send the URL as the locally-saved one instead of downloading
                    // it afresh again from micropython.org
                    const { protocol, host } = new URL(window.location);

                    await this.sendCommand({
                        command: 'update_firmware',
                        firmware: {
                            url: `${protocol}//${host}/firmware/${json.filename}`,
                            size: this.firmware.size,
                            sha256: this.firmware.sha256,
                        }
                    });
                }
            } catch (err) {
                console.log(err)
            }
        },

        async isConfigurationValidJson(event) {
            try {
                const json = await JSON.parse(event.target.value);

                if (!json.client_id && !json.server && !json.port && !json.ssid && !json.wifi_pw) {
                    this.replacementConfiguration.isValidJson = false;

                    return;
                } else {
                    this.replacementConfiguration.isValidJson = true;
                }
            } catch (err) {
                this.replacementConfiguration.isValidJson = false;
            }
        },

        async replaceConfiguration() {
            await this.sendCommand({
                command: 'replace_config',
                config: JSON.parse(this.replacementConfiguration.config),
            });

            this.replacementConfiguration.config = '';
            this.replacementConfiguration.isValidJson = false;
        },

        async getSystemInfo() {
            await this.sendCommand({command: 'get_system_info'});
        },

        async clearLogs() {
            this.messages = [];
        },

        async restartBoard() {
            await this.sendCommand({command: 'restart'})
        },

        async updateConfig(configName) {
            shouldBeIntegers = ['sda_pin', 'scl_pin', 'led_pin', 'neopixel_pin', 'neopixel_power_pin'];

            payload = {
                command: 'update_config',
                config: {
                    [configName]: shouldBeIntegers.includes(configName) && this.selectedClientConfig[configName] !== ''
                        ? parseInt(this.selectedClientConfig[configName])
                        : this.selectedClientConfig[configName],
                }
            };

            await this.sendCommand(payload);
        },

        async sendCommand(payload) {
            const topic = `commands/${this.selectedClient}`;
            const json = JSON.stringify(payload);

            console.log(`Sending message ${json} to ${topic}`)

            try {
                await this.client.publishAsync(topic, JSON.stringify(payload), {qos: 1});
            } catch (err) {
                console.log(`Could not publish message to ${topic}`, err);
            }
        }
    }
}

Vue.createApp(Admin).mount('#admin');
