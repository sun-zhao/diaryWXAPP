const { wxPost, isEnableBtn, showMaskNavigationBarColor, closeMaskNavigationBarColor } = require('../utils/common.js')
export default {
  data: {
    myLuxuryShow: false,
    luxuryShow: false,
    luxuryItems: []
  },
  actionLuxury: function () {
    showMaskNavigationBarColor()
    this.setData({ luxuryShow: true, maskShow: true })
    this.voiceContext().playClick()
  },
  closeLuxury: function () {
    closeMaskNavigationBarColor()
    this.setData({ luxuryShow: false, maskShow: false })
    this.voiceContext().playClick()
  },
  showMyLuxury: function () {
    showMaskNavigationBarColor()
    this.setData({ myLuxuryShow: true, maskShow: true })
    this.voiceContext().playClick()
  },
  closeMyLuxury: function () {
    closeMaskNavigationBarColor()
    this.setData({ myLuxuryShow: false, maskShow: false })
    this.voiceContext().playClick()
  },
  buyLuxury: function (e) {
    console.info(this.data.submitFlag)
    const that = this
    if (that.data.userState.luxuryLimit == 1 && that.data.submitFlag) {
      return false
    } else {
      that.voiceContext().playClick()
      that.setData({ submitFlag: true })
      let luxuryId = e.currentTarget.dataset.id
      if (luxuryId) {
        wxPost(
          '/user/buyLuxury',
          {
            userId: that.data.userData.userId,
            luxuryId: luxuryId
          },
          ({ data }) => {
            if (data.errorCode >= 0) {
              that.setData({ submitFlag: false, luxuryShow: false, dialogShow: true, dialogResult: data.resultArray })
              that.resultVoice(data)
            }
          }
        )
      }
    }
  },
  sellLuxury: function (e) {
    const that = this
    if (that.data.userState.luxuryLimit == 1 && that.data.submitFlag) {
      return false
    } else {
      that.voiceContext().playClick()
      that.setData({ submitFlag: true })
      let luxuryId = e.currentTarget.dataset.id
      if (luxuryId) {
        wxPost(
          '/user/sellLuxury',
          {
            userId: that.data.userData.userId,
            luxuryId: luxuryId
          },
          ({ data }) => {
            if (data.errorCode >= 0) {
              that.setData({ submitFlag: false, myLuxuryShow: false, luxuryShow: false, dialogShow: true, dialogResult: data.resultArray })
              that.resultVoice(data)
            }
          }
        )
      }
    }
  }
}