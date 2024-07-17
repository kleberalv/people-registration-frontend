const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  devServer: {
    port: 3000
  },
  publicPath: process.env.VUE_APP_BASE_URL
})
