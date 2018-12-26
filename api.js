const QQMapWX = require('./lib/qqmap-wx-jssdk.min')
const config = require('./utils/config')


// 和风天气公用请求参数
const commonParam = {
    key: config.weatherKey,
    location: 'beijing',
    lang: 'zh-cn',
    unit: 'm'
}

// 实例化地图
const qqMapWX = new QQMapWX({
    key: config.qqMapKey
});

// 获取地理位置经纬度
const getLocation = () => {
    return new Promise((resolve, reject) => {
        wx.getLocation({
            type: 'gcj02',
            success(res) {
                resolve(res)
            },
            fail(err) {
                reject(err)
            }
        })
    })
}

// 根据位置经纬度查询位置描述
const reverseGeocoder = (option) => {
    return new Promise((resolve, reject) => {
        qqMapWX.reverseGeocoder({
            location: {
                latitude: option.latitude,
                longitude: option.longitude
            },
            success(res) {
                resolve(res.result)
            },
            fail(err) {
                reject(err)
            }
        })
    })
}

// 获取实时天气
const getNowWeather = (option) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: config.nowWeatherUrl,
            method: 'GET',
            data: {
                ...commonParam,
                ...option
            },
            success(res) {
                resolve(res.data)
            },
            fail(err) {
                reject(err)
            }
        })
    })
}

module.exports = {
    getLocation,
    reverseGeocoder,
    getNowWeather
}