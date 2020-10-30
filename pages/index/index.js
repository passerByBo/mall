//index.js
const WXAPI = require('apifm-wxapi');
//获取应用实例
const app = getApp()

Page({
  data: {
    inputVal: '',//搜索框内容
    goodsRecommend: [],//推荐商品
    bargainList: [],//砍价商品列表
    joinGroupList: [],//拼团商品列表

    loadingHidden: false, //loading
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],

    scrollTop: 0,
    loadingMoreHidden: true,

    cpipons: [],

    curPage: 1,
    pageSize: 20,
    cateScrollTop: 0
  },
  onLoad: function (e) {
    wx.showShareMenu({
      withShareTicket: true,
    })

    const that = this;

    //获取当前从分享页面带进来的参数
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene);
      if (scene) {
        wx.setStorageSync('refrrer', scene.substring(11))
      }
    }
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName'),
    })

    //初始化banner-main
    this.initBanners();
    this.categories();
    this.getGoodsRecommend();

    that.getNotice();

    this.spikeGoods();

    that.joinGroupGoods()
  },
  joinGroupGoods() {
    WXAPI.goods({
      pingtuan: true
    }).then(res => {
      if (res.code === 0) {
        this.setData({
          joinGroupList: res.data
        })
      }
    })
  },
  async categories() {
    const res = await WXAPI.goodsCategory();
    let categories = []
    if (res.code == 0) {
      const _categories = res.data.filter(ele => {
        return ele.level == 1;
      });

      categories = [..._categories];
    }
    this.setData({
      categories: categories,
      activeCategoryId: 0,
      curPage: 1
    });

    this.getGoodsList(0);
  },
  async getGoodsList(categoryId, append) {
    if (categoryId == 0) {
      categoryId = "";
    }
    wx.showLoading({
      mask: true,
    })
    const res = await WXAPI.goods({
      categoryId: categoryId,
      page: this.data.curPage,
      pageSize: this.data.pageSize
    })

    wx.hideLoading();
    if (res.code == 404 || res.code == 700) {
      let newData = {
        loadingMoreHidden: false
      }
      if (!append) {
        newData.goods = []
      }

      this.setData(newData);
      return;
    }

    let goods = [];
    if (append) {
      goods = [...this.data.goods]
    }
    goods = goods.concat(res.data);
    this.setData({ goods, loadingMoreHidden: true })
  },
  getNotice() {
    const that = this;
    WXAPI.noticeList({ pageSize: 5 }).then((res) => {
      if (res.code == 0) {
        this.setData({ noticeList: res.data })
      }
    })
  },
  async initBanners() {
    const _data = {};
    //获取头部轮播图
    const result = await WXAPI.banners({
      type: 'index'
    })

    if (result.code === 700) {
      wx.showModal({
        title: '提示',
        content: '请在后台添加 banner 轮播图片，自定义类型填写 index',
        showCancel: false
      })
    } else {
      _data.banners = result.data;
    }

    this.setData(_data)
  },
  tapBanner(e) {
    const { url } = e.currentTarget.dataset;
    if (url) {
      wx.navigateTo({
        url
      })
    }
  },
  bindInput(e) {
    this.setData({ inputVal: e.detail.value });
  },
  bindConfirm(e) {
    this.setData({ inputVal: e.detail.value });
    this.goSeach();
  },
  goSeach() {
    wx.navigateTo({
      url: '/page/goods/list?name=' + this.data.inputVal,
    })
  },
  async spikeGoods() {
    const res = await WXAPI.goods({
      miaosha: true
    })
    if (res.code == 0) {
      res.data.forEach(ele => {
        const _now = Date.now();
        if (ele.dateStart) {
          ele.dateStartInt = new Date(ele.dateStart.replace(/-/g, '/')).getTime() - _now
        }
        if (ele.dateEnd) {
          ele.dateEndInt = new Date(ele.dateEnd.replace(/-/g, '/')).getTime() - _now
        }
      })
      this.setData({
        spikeGoods: res.data
      });
    }
  },
  getGoodsRecommend() {
    WXAPI.goods({
      recommendStatus: 1
    }).then(res => {
      if (res.code === 0) {
        this.setData({
          goodsRecommend: res.data
        })
      }
    })
  },
  onPullDownRefresh() {
    //下拉刷新
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId)
    wx.stopPullDownRefresh()
  },
  onReachBottom() {
    this.setData({
      curPage: this.data.curPage + 1
    });
    this.getGoodsList(this.data.activeCategoryId, true)
  },
  getUserInfo: function (e) {
  },
  tabClick: function (e) {
    const appInstance = getApp();
    const categiryId=  e.currentTarget.dataset.id;
    appInstance.globalData.categoryId = categiryId;
    this.setData({activeCategoryId: categiryId});
    wx.switchTab({
      url: '/pages/category/category',
    })
  },
})
