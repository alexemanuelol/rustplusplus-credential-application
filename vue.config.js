module.exports = {
    pluginOptions: {
        electronBuilder: {
            preload: 'src/preload.js',
            builderOptions: {
                productName: "rustplusplus credential application",
                appId: 'com.alexemanuelol.electron.rustplusplus.credential.app',
                artifactName: 'rustplusplus-${version}-${os}-${arch}.${ext}',
                "mac": {
                    "icon": "./public/icon_rounded.png",
                },
                "win": {
                    "icon": "./public/icon_rounded.png",
                },
            },
            externals: [
                'push-receiver-v2',
            ],
        },
    },
}