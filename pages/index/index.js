//index.js
//获取应用实例
const app = getApp()
const util = app.globalData.util
const api = app.globalData.api
const config = app.globalData.config
const loading = app.globalData.loading

// 修复使用`async await`报错
const regeneratorRuntime = require('../../lib/runtime')

Page({
    data: {
        greetings: '', // 问候语
        geoDes: '定位中...', // 地理位置描述
        location: '', // 地理坐标
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
        hourlyWeather: [], // 逐三小时天气数据
        days: ['今天', '明天', '后天'],
        dailyWeather: [], // 逐日天气数据
        lifestyle: [] // 生活指数
    },

    // 加载提示
    ...loading,

    onShow() {
        this.init()
    },

    // 初始化
    init() {
        this.showLoading()
        this.initGreetings()
        this.initWeatherInfo()
    },

    // 初始化问候语
    initGreetings() {
        this.setData({
            greetings: util.getGreetings()
        })
    },

    // 下拉刷新
    onPullDownRefresh() {
        this.init()
        wx.stopPullDownRefresh()
    },

    // 跳到搜索页
    toSearchPage() {
        wx.navigateTo({
            url: '/pages/searchGeo/searchGeo'
        })
    },

    // 获取地理位置信息
    async getLocation() {

        let position = wx.getStorageSync('POSITION')
        position = position ? JSON.parse(position) : position

        if (position) {
            this.setData({
                location: `${position.longitude},${position.latitude}`,
                geoDes: position.title
            })
            return;
        }

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

        // // 获取逐三小时天气
        await this.getHourlyWeather()

        // 获取逐日天气
        await this.getDailyWeather()

        // 获取生活指数
        await this.getLifestyle()

        // 关闭加载框
        await this.hideLoading()
    },

    // 获取实时天气
    getNowWeather() {
        return new Promise((resolve, reject) => {
            api.getNowWeather({
                location: this.data.location
            })
            .then((res) => {
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
                this.initBgImg(data.now.cond_code)
                resolve()
            })
            .catch((err) => {
                console.error(err)
                reject(err)
            })
        })
    },

    // 初始化背景（导航和内容）
    initBgImg(code) {
        let cur = config.bgImgList.find((item) => {
            return item.codes.includes(parseInt(code))
        })
        let url = config.BG_IMG_BASE_URL + (cur ? `/${cur.name}` : '/calm') + '.jpg'

        this.setData({
            bgImgUrl: url
        })

        wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: cur.color,
            animation: {
                duration: 400,
                timingFunc: 'easeIn'
            }
        })
    },

    // 获取逐三小时天气
    getHourlyWeather() {
        return new Promise((resolve, reject) => {
            console.log(this.data.location)
            api.getHourlyWeather({
                location: this.data.location
            })
            .then((res) => {
                let data = res.HeWeather6[0].hourly
                console.log(res)
                let formatData = data.reduce((pre, cur) => {
                    pre.push({
                        date: cur.time.split(' ')[1],
                        condIconUrl: `${config.COND_ICON_BASE_URL}/${cur.cond_code}.png`, // 天气图标
                        condTxt: cur.cond_txt, // 天气状况描述
                        tmp: cur.tmp, // 气温
                        windDir: cur.wind_dir, // 风向
                        windSc: cur.wind_sc, // 风力
                        windSpd: cur.wind_spd, // 风速
                        pres: cur.pres // 大气压
                    })
                    return pre
                }, [])

                let gap = 4
                let trip = Math.ceil(formatData.length / gap)
                let hourlyWeather = []
                for (let i = 0; i < trip; i++) {
                    hourlyWeather.push(formatData.slice(i * gap, (i + 1) * gap))
                }

                this.setData({
                    hourlyWeather
                })
                resolve()
            })
            .catch((err) => {
                console.error(err)
                reject(err)
            })
        })
    },

    // 获取逐日天气
    getDailyWeather() {
        return new Promise((resolve, reject) => {
            api.getDailyWeather({
                location: this.data.location
            })
                .then((res) => {
                    let data = res.HeWeather6[0].daily_forecast
                    let dailyWeather = data.reduce((pre, cur) => {
                        pre.push({
                            date: cur.date.slice(5).replace(/-/, '/'),
                            condDIconUrl: `${config.COND_ICON_BASE_URL}/${cur.cond_code_d}.png`, //白天天气状况图标
                            condNIconUrl: `${config.COND_ICON_BASE_URL}/${cur.cond_code_n}.png`, //晚间天气状况图标
                            condTxtD: cur.cond_txt_d, // 白天天气状况描述
                            condTxtN: cur.cond_txt_n, // 晚间天气状况描述
                            sr: cur.sr, // 日出时间
                            ss: cur.ss, // 日落时间
                            tmpMax: cur.tmp_max, // 最高温度
                            tmpMin: cur.tmp_min, // 最低气温
                            windDir: cur.wind_dir, // 风向
                            windSc: cur.wind_sc, // 风力
                            windSpd: cur.wind_spd, // 风速
                            pres: cur.pres, // 大气压
                            vis: cur.vis // 能见度
                        })

                        return pre
                    }, [])
                    this.setData({
                        dailyWeather
                    })
                    resolve()
                })
                .catch((err) => {
                    console.error(err)
                    reject(err)
                })
        })
    },

    // 获取生活指数
    getLifestyle() {
        return new Promise((resolve, reject) => {
            api.getLifestyle({
                location: this.data.location
            })
                .then((res) => {
                    let data = res.HeWeather6[0].lifestyle
                    const lifestyleImgList = config.lifestyleImgList
                    let lifestyle = data.reduce((pre, cur) => {
                        pre.push({
                            brf: cur.brf,
                            txt: cur.txt,
                            iconUrl: lifestyleImgList[cur.type].src,
                            iconTxt: lifestyleImgList[cur.type].txt
                        })
                        return pre
                    }, [])
                    this.setData({
                        lifestyle
                    })
                    resolve()
                })
                .catch((err) => {
                    console.error(err)
                    reject(err)
                })
        })
    }
})
