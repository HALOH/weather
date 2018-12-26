//app.js
const util = require('./utils/util')
const api = require('./api')
const config = require('./utils/config')

App({
    onLaunch: function () {
        
    },
    globalData: {
        util,
        api,
        config
    }
})