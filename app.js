//app.js
const util = require('./utils/util')
const api = require('./api')
const loading = require('./utils/loading')
const config = require('./utils/config')

App({
    onLaunch: function () {
        
    },
    globalData: {
        util,
        api,
        config,
        loading
    }
})