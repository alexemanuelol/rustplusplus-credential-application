const ElectronStore = new (require('electron-store'))();
const { v4: uuidv4 } = require('uuid');

const KEY_STEAM_ID = 'steam_id';
const KEY_RUSTPLUS_TOKEN = 'rustplus_token';
const KEY_EXPO_DEVICE_ID = 'expo_device_id';
const KEY_EXPIRE_DATE = 'expire_date';
const KEY_ISSUED_DATE = 'issued_date';
const KEY_AUTH_TOKEN = 'auth_token';

class ConfigDataStore {
    static getSteamId() {
        return ElectronStore.get(KEY_STEAM_ID);
    }

    static setSteamId(steamId) {
        ElectronStore.set(KEY_STEAM_ID, steamId);
    }

    static clearSteamId() {
        ElectronStore.delete(KEY_STEAM_ID);
    }

    static getRustPlusToken() {
        return ElectronStore.get(KEY_RUSTPLUS_TOKEN);
    }

    static setRustPlusToken(rustPlusToken) {
        ElectronStore.set(KEY_RUSTPLUS_TOKEN, rustPlusToken);
    }

    static clearRustPlusToken() {
        ElectronStore.delete(KEY_RUSTPLUS_TOKEN);
    }

    static getExpoDeviceId() {
        let expoDeviceId = ElectronStore.get(KEY_EXPO_DEVICE_ID);

        /* Generate an expo device id if not set */
        if (!expoDeviceId) {
            expoDeviceId = uuidv4();
            this.setExpoDeviceId(expoDeviceId);
        }

        return expoDeviceId;
    }

    static setExpoDeviceId(expoDeviceId) {
        ElectronStore.set(KEY_EXPO_DEVICE_ID, expoDeviceId);
    }

    static clearExpoDeviceId() {
        ElectronStore.delete(KEY_EXPO_DEVICE_ID);
    }

    static getExpireDate() {
        return ElectronStore.get(KEY_EXPIRE_DATE);
    }

    static setExpireDate(expireDate) {
        return ElectronStore.set(KEY_EXPIRE_DATE, expireDate);
    }

    static clearExpireDate() {
        return ElectronStore.delete(KEY_EXPIRE_DATE);
    }

    static getIssuedDate() {
        return ElectronStore.get(KEY_ISSUED_DATE);
    }

    static setIssuedDate(issuedDate) {
        return ElectronStore.set(KEY_ISSUED_DATE, issuedDate);
    }

    static clearIssuedDate() {
        return ElectronStore.delete(KEY_ISSUED_DATE);
    }

    static getAuthToken() {
        return ElectronStore.get(KEY_AUTH_TOKEN);
    }

    static setAuthToken(authToken) {
        return ElectronStore.set(KEY_AUTH_TOKEN, authToken);
    }

    static clearAuthToken() {
        return ElectronStore.delete(KEY_AUTH_TOKEN);
    }
}

module.exports = ConfigDataStore;