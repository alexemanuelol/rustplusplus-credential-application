<template>
    <div id="app">
        <!-- Steam is Connected -->
        <template v-if="isRustPlusConnected">
            <div class="min-h-screen bg-gray-200 py-6 flex flex-col justify-center sm:py-12">
                <div class="sm:max-w-xl sm:mx-auto mb-4">
                    <div class="px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-16">
                        <div class="max-w-md mx-auto">
                            <div class="flex mb-4">
                                <img class="mx-auto" src="rustplusplus.png" />
                            </div>
                            <div class="flex flex-col">
                                <span class="mx-auto text-xl font-bold">rustplusplus credential application</span>
                            </div>
                            <div class="divide-y divide-gray-200">
                                <div class="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                    <p>Copy the Slash Command below and run it in any Discord Text Channel of the
                                        Discord Server in
                                        question.</p>
                                    <div class="relative w-full h-64">
                                        <textarea v-if="!isLoading" ref="textareaCopy"
                                            v-on:focus="$event.target.select()" :value="slashCommand" readonly
                                            class="w-full h-full inline-flex items-center border text-sm font-medium rounded-md shadow-sm"></textarea>
                                        <div v-else class="w-full h-full flex items-center justify-center">
                                            <svg class="animate-spin h-10 w-10 text-gray-600"
                                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    stroke-width="4">
                                                </circle>
                                                <path class="opacity-75" fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z">
                                                </path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button @click="copySlashCommand" type="button"
                                class="w-full inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none">
                                <span class="flex mx-auto">
                                    <span>Copy</span>
                                </span>
                            </button>
                            <button @click="isShowingLogoutModal = true" type="button"
                                class="w-full inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none">
                                <span class="flex mx-auto">
                                    <span>Logout</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Steam not Connected -->
        <ConnectRustPlus v-else @rustplus-connected="onRustPlusConnected($event)" />

        <!-- Modals -->
        <LogoutModal @close="isShowingLogoutModal = false" @logout="logout" :isShowing="isShowingLogoutModal" />
    </div>
</template>

<script>
    import LogoutModal from "@/components/modals/LogoutModal";
    import ConnectRustPlus from '@/components/ConnectRustPlus.vue'
    import { jwtDecode } from 'jwt-decode';

    export default {
        name: 'App',
        components: {
            LogoutModal,
            ConnectRustPlus,
        },
        data: function () {
            return {
                appversion: window.appversion,

                slashCommand: null,

                steamId: null,
                rustplusToken: null,

                expireDate: null,
                issuedDate: null,

                fcmNotificationReceiver: null,
                expoPushTokenReceiver: null,
                rustCompanionReceiver: null,

                isShowingLogoutModal: false,
                isLoading: false,
                saveNextData: false,
            };
        },
        computed: {
            isRustPlusConnected: function () {
                return this.steamId && this.rustplusToken;
            }
        },
        mounted() {
            /* Load rust+ info from store */
            this.steamId = window.DataStore.Config.getSteamId();
            this.rustplusToken = window.DataStore.Config.getRustPlusToken();
            this.expireDate = window.DataStore.Config.getExpireDate();
            this.issuedDate = window.DataStore.Config.getIssuedDate();

            /* Setup fcm, expo and rust companion receivers */
            this.fcmNotificationReceiver = new window.FCMNotificationReceiver(window.ipcRenderer);
            this.expoPushTokenReceiver = new window.ExpoPushTokenReceiver(window.ipcRenderer);
            this.rustCompanionReceiver = new window.RustCompanionReceiver(window.ipcRenderer);

            /* Setup fcm listeners */
            this.fcmNotificationReceiver.on('register.success', this.onFCMRegisterSuccess);
            this.fcmNotificationReceiver.on('register.error', this.onFCMRegisterError);

            /* Setup expo listeners */
            this.expoPushTokenReceiver.on('register.success', this.onExpoRegisterSuccess);
            this.expoPushTokenReceiver.on('register.error', this.onExpoRegisterError);

            /* Setup rust companion listeners */
            this.rustCompanionReceiver.on('register.success', this.onRustCompanionRegisterSuccess);
            this.rustCompanionReceiver.on('register.error', this.onRustCompanionRegisterError);

            /* Setup credentials */
            this.setupCredentials();
        },
        methods: {
            onFCMRegisterSuccess(data) {
                this.saveNextData = true;

                /* Update slashCommand variable */
                this.slashCommand = this.formatSlashCommand(data.credentials);

                /* Save fcm credentials to store */
                window.DataStore.FCM.setCredentials(data.credentials);

                /* Configure expo data */
                this.setupExpo();
            },

            onFCMRegisterError(data) {
                /* Do nothing */
                this.isLoading = false;
            },

            onExpoRegisterSuccess(data) {
                /* Register with rust companion api if logged into steam */
                if (this.isRustPlusConnected) {
                    /**
                     * The Rust Companion API will update the expo token if an existing registration exists for a deviceId.
                     * Rust+ uses the device name as the deviceId, so if a user has two devices with same name, it won't
                     * work. So, we will use a unique deviceId per installation so notifications will work across multiple
                     * installs.
                     */
                    let expoDeviceId = window.DataStore.Config.getExpoDeviceId();
                    let deviceId = 'rustplusplus-credential-application:' + expoDeviceId;
                    let rustplusToken = window.DataStore.Config.getRustPlusToken();

                    this.rustCompanionReceiver.register(deviceId, rustplusToken, data.expoPushToken);
                }
            },

            onExpoRegisterError(data) {
                /* Do nothing */
            },

            onRustCompanionRegisterSuccess(data) {
                if (this.saveNextData) {
                    const decoded = jwtDecode(data.token, { header: true });

                    window.DataStore.Config.setIssuedDate(decoded.iss);
                    window.DataStore.Config.setExpireDate(decoded.exp);

                    this.issuedDate = decoded.iss;
                    this.expireDate = decoded.exp;

                    this.saveNextData = false;
                }
                else {
                    this.issuedDate = window.DataStore.Config.getIssuedDate();
                    this.expireDate = window.DataStore.Config.getExpireDate();
                }

                let credentials = window.DataStore.FCM.getCredentials();
                this.slashCommand = this.formatSlashCommand(credentials);
                this.isLoading = false;
            },

            onRustCompanionRegisterError(data) {
                /* Check if rustplus token needs to be refreshed */
                if (data.response_code === 403) {
                    /* Remove cached rustplus token */
                    window.DataStore.Config.clearRustPlusToken();

                    /* Tell user their rustplus token has expired */
                    alert("Your RustPlus token has expired. Please connect with RustPlus again.");

                    /* Reload window */
                    window.location.reload();
                }
            },

            setupCredentials() {
                /* Check for existing fcm credentials */
                let credentials = window.DataStore.FCM.getCredentials();
                if (credentials) {
                    /* Populate slashCommand with the Discord Slash Command */
                    this.slashCommand = this.formatSlashCommand(credentials);

                    /* Clear saved persistent ids */
                    window.DataStore.FCM.clearPersistentIds();

                    /* Configure expo data */
                    this.setupExpo();
                } else {
                    /* Register for a new set of fcm credentials */
                    this.isLoading = true;
                    this.fcmNotificationReceiver.register();
                }
            },

            setupExpo() {
                var deviceId = window.DataStore.Config.getExpoDeviceId();
                var experienceId = '@facepunch/RustCompanion';
                var appId = 'com.facepunch.rust.companion';
                var fcmToken = window.DataStore.FCM.getCredentials().fcm.token;

                this.expoPushTokenReceiver.register(deviceId, experienceId, appId, fcmToken);
            },

            logout() {
                /* Close logout modal */
                this.isShowingLogoutModal = false;
                this.saveNextData = true;

                /* Forget steam account */
                window.DataStore.Config.clearSteamId();
                window.DataStore.Config.clearRustPlusToken();
                window.DataStore.Config.clearExpireDate();
                window.DataStore.Config.clearIssuedDate();

                /* Clear in memory state, which will force user to connect steam */
                this.steamId = null;
                this.rustplusToken = null;
                this.expireDate = null;
                this.issuedDate = null;

                /* Clear FCM Credentials */
                window.DataStore.FCM.clearCredentials();
                this.slashCommand = null;
            },

            onRustPlusConnected(event) {
                /* Save rust+ info to store */
                window.DataStore.Config.setSteamId(event.steamId);
                window.DataStore.Config.setRustPlusToken(event.token);

                /* Update steam id and token in memory */
                this.steamId = event.steamId;
                this.rustplusToken = event.token;

                /* Setup credentials */
                this.setupCredentials();
            },

            formatSlashCommand(credentials) {
                if (!credentials) return false;

                const issuedDate = window.DataStore.Config.getIssuedDate();
                const expireDate = window.DataStore.Config.getExpireDate();

                return '/credentials add ' +
                    `keys_private_key:${credentials.keys.privateKey} ` +
                    `keys_public_key:${credentials.keys.publicKey} ` +
                    `keys_auth_secret:${credentials.keys.authSecret} ` +
                    `fcm_name:${credentials.fcm.name} ` +
                    `fcm_token:${credentials.fcm.token} ` +
                    `fcm_web_endpoint:${credentials.fcm.web.endpoint} ` +
                    `fcm_web_p256dh:${credentials.fcm.web.p256dh} ` +
                    `fcm_web_auth:${credentials.fcm.web.auth} ` +
                    `gcm_token:${credentials.gcm.token} ` +
                    `gcm_android_id:${credentials.gcm.androidId} ` +
                    `gcm_security_token:${credentials.gcm.securityToken} ` +
                    `gcm_app_id:${credentials.gcm.appId} ` +
                    `steam_id:${this.steamId} ` +
                    `issued_date:${issuedDate} ` +
                    `expire_date:${expireDate}`;
            },

            copySlashCommand() {
                this.$refs.textareaCopy.focus();
                document.execCommand('copy');
            }
        }
    }
</script>

<style>
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }
</style>