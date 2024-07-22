const PushReceiver = require('push-receiver-v2');

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
        this.config = {
            firebase: {
                apiKey: 'AIzaSyB5y2y-Tzqb4-I4Qnlsh_9naYv_TD8pCvY',
                appID: '1:976529667804:android:d6f1ddeb4403b338fea619',
                projectID: 'rust-companion-app'
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