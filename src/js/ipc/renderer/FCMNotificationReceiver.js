const { EventEmitter } = require('events');

/**
 * This class is responsible for communicating with the FCMNotificationManager running
 * in the main process.
 *
 * Events are sent from here in the renderer process via ipc to the main process,
 * and results are then sent back to the renderer process via ipc.
 */
class FCMNotificationReceiver extends EventEmitter {
    constructor(ipcRenderer) {
        super();

        /* Global variables */
        this.ipcRenderer = ipcRenderer;

        /* Register ipc channel handlers */
        ipcRenderer.on('push-receiver.register.success', (event, data) => this.onRegisterSuccess(event, data));
        ipcRenderer.on('push-receiver.register.error', (event, data) => this.onRegisterError(event, data));
    }

    onRegisterSuccess(event, data) {
        this.emit('register.success', data);
    }

    onRegisterError(event, data) {
        this.emit('register.error', data);
    }

    /**
     * Ask the main process to register a new android device to receive fcm notifications.
     *
     * Events Emitted:
     * - register.success
     * - register.error
     */
    register() {
        ipcRenderer.send('push-receiver.register', {
            apiKey: "AIzaSyB5y2y-Tzqb4-I4Qnlsh_9naYv_TD8pCvY",
            projectId: "rust-companion-app",
            gcmSenderId: "976529667804",
            gmsAppId: "1:976529667804:android:d6f1ddeb4403b338fea619",
            androidPackageName: "com.facepunch.rust.companion",
            androidPackageCert: "E28D05345FB78A7A1A63D70F4A302DBF426CA5AD",
        });
    }
}

module.exports = FCMNotificationReceiver;