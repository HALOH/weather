const QQMapWX = require('./lib/qqmap-wx-jssdk.min')
const config = require('./utils/config')


// 和风天气公用请求参数
const commonParam = {
    key: config.weatherKey,
    location: '',
    lang: 'zh-cn',
    unit: 'm'
}

const hotcityParam = {
    key: config.weatherKey,
    group: 'cn',
    lang: 'zh-cn',
    number: 20
}

const searchcityParam = {
    key: config.weatherKey,
    location:''
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

// 逐三小时天气
const getHourlyWeather = (option) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: config.hourlyWeatherUrl,
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

//天气预报
const getDailyWeather = (option) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: config.dailyWeatherUrl,
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

// 生活指数
const getLifestyle = (option) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: config.lifestyleUrl,
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

// 城市搜索
const searchCity = (option) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: config.searchCity,
            method: 'GET',
            data: {
                ...searchcityParam,
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

// 获取热门城市列表
const getHotCityList = () => {
    // 从缓存取
    let CITY_LIST = wx.getStorageSync('CITY_LIST')
    if (CITY_LIST) {
        return Promise.resolve(CITY_LIST)
    }
    return new Promise((resolve, reject) => {
        wx.request({
            url: config.hotCityList,
            method: 'GET',
            data: {
                ...hotcityParam
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
    getNowWeather,
    getHourlyWeather,
    getDailyWeather,
    getLifestyle,
    getHotCityList,
    searchCity
}