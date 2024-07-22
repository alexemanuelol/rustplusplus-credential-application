const Events = require('events');

/**
 * This class is responsible for communicating with the FCMNotificationManager running
 * in the main process.
 *
 * Events are sent from here in the renderer process via ipc to the main process,
 * and results are then sent back to the renderer process via ipc.
 */
class FCMNotificationReceiver extends Events.EventEmitter {
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
     * Ask the main process to register a new Android device
     * to receive FCM notifications using the provided Firebase configuration.
     *
     * This function sends an 'push-receiver.register' event to the main process.
     *
     * The main process should handle this event and use the Firebase configuration
     * to register the device for FCM notifications.
     *
     * Events Emitted:
     * - 'push-receiver.register.success': Emitted by the main process when registration is successful.
     * - 'push-receiver.register.error': Emitted by the main process when registration fails.
     */
    register() {
        ipcRenderer.send('push-receiver.register');
    }
}

module.exports = FCMNotificationReceiver;