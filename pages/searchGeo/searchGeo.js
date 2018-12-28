const app = getApp()
const config = app.globalData.config
const api = app.globalData.api
const util = app.globalData.util
const loading = app.globalData.loading
const regeneratorRuntime = require('../../lib/runtime')

Page({
    /**
     * 页面的初始数据
     */
    data: {
        initValue: '', // 搜索框初始值
        cityList: [], // 城市列表
        suggList: [], // 搜索提示列表
        isShowSugg: false, // 是否显示搜索遮罩
        searchCls: 'no-sugg', // 没有提示的样式
        title: null
    },

    // 加载提示
    ...loading,

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        this.init()
    },

    // 初始化
    async init() {
        await this.showLoading()
        await this.getHotCityList()
        await this.hideLoading()
    },

    // 获取热门城市列表
    getHotCityList() {
        return new Promise((resolve, reject) => {
            api.getHotCityList({}).then((res) => {
                console.log(res)
                let data = res.HeWeather6[0]['basic']
                this.setData({
                    cityList: data
                })
                resolve()
            })
            .catch((err) => {
                console.error(err)
                reject(err)
            })
        })
    },

    // 取消
    cancelSearch() {
        this.setData({
            initValue: '',
            isShowSugg: false,
            searchCls: 'no-sugg',
            suggList: []
        })
    },

    // 搜索输入框聚焦
    focus() {
        this.setData({
            isShowSugg: true
        })
    },

    // 输入搜索关键字
    input: util.throttle(function () {
        let val = arguments[0].detail.value
        if (val === '') {
            this.setData({
                suggList: []
            })
            this.changeSearchCls()
            return false
        }

        api.searchCity({
            location: val
        })
        .then((res) => {
            this.setData({
                suggList: res.HeWeather6[0]['basic']
            })
            this.changeSearchCls()
        })
        .catch((err) => {
            console.error(err)
        })
    }, 500),

    // 改变提示样式
    changeSearchCls() {
        this.setData({
            searchCls: this.data.suggList.length ? 'has-sugg' : 'no-sugg'
        })
    },

    // 点击提示单元项，缓存选择的经纬度
    tapSuggItem(event) {
        wx.setStorageSync(
            'POSITION',
            JSON.stringify({
                title: event.currentTarget.dataset.item.location,
                longitude: event.currentTarget.dataset.item.lon,
                latitude: event.currentTarget.dataset.item.lat
            })
        )
        this.navigateToIndex()
    },

    // 跳转到首页
    navigateToIndex() {
        wx.navigateBack({
            url: '/pages/index/index'
        })
    },


    // 获取当前定位
    tapSetCurPos() {
        wx.removeStorageSync('POSITION')
        this.navigateToIndex()
    },

    // 点击城市项
    tapCityItem(event) {
        wx.setStorageSync(
            'POSITION',
            JSON.stringify({
                title: event.currentTarget.dataset.item.location,
                longitude: event.currentTarget.dataset.item.lon,
                latitude: event.currentTarget.dataset.item.lat
            })
        )
        this.navigateToIndex()
    }
})