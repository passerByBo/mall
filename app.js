//app.js
const CONFIG = require('config.js');
const WXAPI = require('apifm-wxapi')
App({
  onLaunch: function () {
    //小程序获取第三方平台自定义的数据字段的同步接口
    const subDomain = wx.getExtConfigSync().subDimain;
    const componentAppid = wx.getExtConfigSync().componentAppid;

    if(componentAppid){
      wx.setStorageSync('appid', wx.getAccountInfoSync().miniProgram.appId);
      wx.setStorageSync('componentAppid', componentAppid)
    }

    if(subDomain){
      WXAPI.init(subDomain)
    } else {
      WXAPI.init(CONFIG.subDomain)
    }

    const that = this;
    //检测小程序版本
    const updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重新应用？',
        success(res) {
          if (res.confirm) {
            //新版本已经下载好，调用applyUpdate应用新版本并重启
            updateManager.applyUpdate();
          }
        }
      });
    })

    /**
     * 除此加载判断网络情况
     * 无网络可以做取缓存或者其他的处理
     */

    wx.getNetworkType({
      success: (result) => {
        const { networkType } = result;
        if (networkType === 'none') {
          that.globalData.isConnected = false;
          wx.showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000
          })
        }
      },
    })

    /**
     * 监听网络状态变化
     */

    wx.onNetworkStatusChange((result) => {
      if (!result.isConnected) {
        that.globalData.isConnected = false;
        wx.showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000
        })
      } else {
        that.globalData.isConnected = true;
        wx.hideToast();
      }
    })

    WXAPI.queryConfigBatch('mallName,WITHDRAW_MIN,ALLOW_SELF_COLLECTION,order_hx_uids,subscribe_ids,share_profile,gooking_test').then(res => {
      if(res.code === 0){
        res.data.forEach(config => {
          wx.setStorageSync(config.key, config.value)
        })

        if (this.configLoadOK) {
          this.configLoadOK()
        }
      }
    })
  
  },
  onShow(e){

  },
  globalData: {
    isConnected: true,
  }
})