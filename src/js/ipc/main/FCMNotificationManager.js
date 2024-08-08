const PushReceiver = require('push-receiver-v2');
require('dotenv').config();

/**
 * This class is responsible for registering a new android device with fcm
 * as well as being able to listen for notifications after registering.
 *
 * Events are received via ipc from the renderer process, executed here in the main
 * process, and results are then sent back to the renderer process via ipc.
 */
class FCMNotificationManager {
    constructor(ipcMain) {
        /* Global variables */
        this.ipcMain = ipcMain;
        /**
         * Firebase configuration used to register the device with FCM.
         * This configuration includes the API key, app ID, and project ID.
         */
        this.config = {
            firebase: {
                apiKey: process.env.FIREBASE_API_KEY,
                appID: process.env.FIREBASE_APP_ID,
                projectID: process.env.FIREBASE_PROJECT_ID
            }
        }
        /* Register IPC channel handlers */
        ipcMain.on('push-receiver.register', (event) => this.onRegister(event));
    }

    onRegisterSuccess(event, credentials) {
        event.sender.send('push-receiver.register.success', {
            'credentials': credentials,
        });
    }

    onRegisterError(event, error) {
        event.sender.send('push-receiver.register.error', {
            'error': error,
        });
    }

    /**
     * Register with FCM to obtain credentials
     * @param event
     * @param data
     */
    async onRegister(event, data) {
        try {
            /* Register with gcm/fcm */
            const credentials = await PushReceiver.register(this.config);

            /* Registering was successful */
            this.onRegisterSuccess(event, credentials);
        }
        catch (error) {
            /* Registering failed with error */
            this.onRegisterError(event, error);
        }
    }
}

module.exports = FCMNotificationManager;