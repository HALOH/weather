//index.js
//获取应用实例
const app = getApp()
const util = app.globalData.util
const api = app.globalData.api
const config = app.globalData.config

// 修复使用`async await`报错
const regeneratorRuntime = require('../../lib/runtime')

Page({
    data: {
        greetings: '', // 问候语
        geoDes: '定位中...', // 地理位置描述
        bgImgUrl: config.BG_IMG_BASE_URL + '/calm.jpg', // 背景图片地址
        nowWeather: { // 实时天气数据
            tmp: 'N/A', // 温度
            condTxt: '', // 天气状况
            windDir: '', // 风向
            windSc: '', // 风力
            windSpd: '', // 风速
            pres: '', // 大气压
            hum: '', // 湿度
            pcpn: '', // 降水量
            condIconUrl: `${config.COND_ICON_BASE_URL}/999.png`, // 天气图标
            loc: '' // 当地时间
        },
    },

    onShow() {
        this.init()
    },

    // 初始化
    init() {
        // this.showLoading()
        this.initGreetings()
        this.initWeatherInfo()
    },

    // 初始化问候语
    initGreetings() {
        this.setData({
            greetings: util.getGreetings()
        })
    },

    // 获取地理位置信息
    async getLocation() {
        await api.getLocation()
            .then((res) => {
                let { longitude, latitude } = res
                this.setData({
                    location: `${longitude},${latitude}`
                })

                // 逆地址解析 根据经纬度获取地址描述
                api.reverseGeocoder({
                    longitude,
                    latitude
                }).then((res) => {
                    let addressComponet = res.address_component
                    let geoDes = `${addressComponet.city}${addressComponet.district}${addressComponet.street_number}`
                    this.setData({
                        geoDes
                    })
                })
            })
            .catch((err) => {
                console.error(err)
            })
    },

    // 初始化天气信息
    async initWeatherInfo() {
        // 获取地址信息
        await this.getLocation()

        // 获取实时天气
        await this.getNowWeather()

        // // 获取逐日天气
        // await this.getDailyWeather()

        // // 获取逐三小时天气
        // await this.getHourlyWeather()

        // // 获取生活指数
        // await this.getLifestyle()

        // // 关闭加载框
        // await this.hideLoading()
    },

    // 获取实时天气
    getNowWeather() {
        return new Promise((resolve, reject) => {
            api.getNowWeather({
                location: this.data.location
            })
                .then((res) => {
                    console.log(res)
                    let data = res.HeWeather6[0]
                    this.setData({
                        nowWeather: {
                            parentCity: data.basic.parent_city,
                            location: data.basic.location,
                            tmp: data.now.tmp,
                            condTxt: data.now.cond_txt,
                            windDir: data.now.wind_dir,
                            windSc: data.now.wind_sc,
                            windSpd: data.now.wind_spd,
                            pres: data.now.pres,
                            hum: data.now.hum,
                            pcpn: data.now.pcpn,
                            condIconUrl: `${config.COND_ICON_BASE_URL}/${data.now.cond_code}.png`,
                            loc: data.update.loc.slice(5).replace(/-/, '/')
                        }
                    })
                    // this.initBgImg(data.now.cond_code)
                    resolve()
                })
                .catch((err) => {
                    console.error(err)
                    reject(err)
                })
        })
    },
})
