// pages/category/category.js
const WXAPI = require('apifm-wxapi');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true
    })
   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('on show');
    // const appInstance = getApp();
    // const _categoryId = appInstance.globalData.categoryId;
    // if (_categoryId) {
    //   this, data.categorySelected.id = _categoryId;
    //   this.categories();
    // } else {
    //   this, data.categorySelected.id = null;
    // }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  async categories() {
    wx.showLoading({
      title: '加载中',
    });
    const res = await WXAPI.goodsCategory();
    wx.hideLoading();

    console.log(res);
    let categories = [], categoryName = '', categoryId = '';
    if (res.code === 0) {
      if (this.data.categorySelect.id) {
        const _curCategory = res.data.find(ele => {
          return ele.id = this.data.categorySelected.id;
        })
        categoryName = _curCategory.name;
        categoryId = _curCategory.id;
      }
    }

  }
})