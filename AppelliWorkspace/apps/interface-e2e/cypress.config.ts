const { nxE2EPreset } = require('@nx/cypress/plugins/cypress-preset');
const { defineConfig } = require('cypress');
module.exports = defineConfig({
    e2e: {
        ...nxE2EPreset(__filename, {
            "cypressDir": "src",
            "bundler": "vite",
            "webServerCommands": {
                "default": "npx nx run @appelli-workspace/interface:dev",
                "production": "npx nx run @appelli-workspace/interface:preview"
            },
            "ciWebServerCommand": "npx nx run @appelli-workspace/interface:preview",
            "ciBaseUrl": "http://localhost:4300"
        }),
        baseUrl: 'http://localhost:4200'
    }
});