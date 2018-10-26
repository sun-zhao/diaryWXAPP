// pages/index/temp.js
const app = getApp()
const { setWatcher } = require("../../utils/watcher.js");
import { DrawKLine } from '../../utils/DrawKLine.js'
const { wxGet} = require('../../utils/common.js')
const descriptHeight=350
const abilityHeight=330
Page({
  data: {
    canvasWidth:null,
    canvasHeight:null,
    screenHeight:null,
    userInfo: {},
    hasUserInfo: false,
    canvasSaveimg:''
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '数据生成中...',
    })
    let canvasWidth, canvasHeight, screenHeight
    const totalHeight = abilityHeight + descriptHeight
    wx.getSystemInfo({
      success: function (res) {
        canvasWidth = res.windowWidth
        screenHeight = res.windowHeight 
        canvasHeight = res.windowHeight > totalHeight ? res.windowHeight : totalHeight
      },
    })
   
    this.setData({ canvasWidth, canvasHeight, screenHeight })
    setWatcher(this)
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    //this.draw()
  },
  watch: {
    'userInfo': {
      handler(value) {
        this.getImageInfo(value.avatarUrl)
      }
    }
  },
  getImageInfo(url) {//  图片缓存本地的方法
    const that = this
    if (url) {
      const p1 = new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: url,
          success: res => {
            resolve(res)
          },
          fail: error => {
            reject(error)
          }
        })
      })
      const p2 = new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: 'https://img.jinrongzhushou.com/common/hun_qrcode.jpg',
          success: (res) => {
            console.info('get qrcode success')
            resolve(res);
          },
          fail: err => {
            reject(err)
          }
        })
      })
      const userId = app.globalData.userId
      const p3 = new Promise((resolve,reject)=>{
        wxGet(`/user/report/${userId}`,null,({data})=>{
          resolve(data);
        },(error)=>{
          reject(error)
        })

      })

      Promise.all([p1,p2,p3]).then((result) => {
        const avatarResult = result[0]
        const qrcodeResult = result[1]
        const reportResult = result[2]
        //
        if (avatarResult.errMsg === 'getImageInfo:ok' && qrcodeResult.errMsg === 'getImageInfo:ok' && reportResult.errorCode >= 0 ) {
          
         that.draw({ avatar: avatarResult.path,
         qrCodeImg: qrcodeResult.path},reportResult.data)
        }
      }).catch((error) => {
        console.info(error)
      })
    }
  },
  draw({
    avatar ='../../img/scjg.png',
    rankImg = '../../img/feng.png',
    qrCodeImg = '../../img/scjg.png',
    point='23178208'
  } = {}, {
    couple= '左手',
    happy='',
    health='',
    positive='',
    experience='',
    house='',
    score= '',
    money='',
    car='',
    fund= '',
    comment= '',
    ability= '',
    job='',
    connections= ''}={}){
    let { canvasWidth, canvasHeight}=this.data
    const ctx = wx.createCanvasContext('share')
    let usedHeight = 15 //已使用的高度
    const padding = 20// 距左宽度
    const titleWidth = canvasWidth - padding * 2//标题宽度
    const rankWidth = 85//评级宽度
    const rankMargin = 25 //距离point宽度
    const pointFontSize = 25
    //draw bg
    ctx.drawImage('../../img/body-bg.jpg', 0, 0, canvasWidth, canvasHeight += 15)
    //draw title
    ctx.drawImage('../../img/scjg.png', padding, usedHeight, titleWidth, usedHeight += 50)
    //draw avatar & rank
    usedHeight += 30//头像圆形上方,圆点需要+半径
    ctx.save()
    ctx.beginPath()
    let _r = 32//头像圆半径
    let _d = _r * 2//头像尺寸
    const center = padding + _r
    ctx.arc(center, usedHeight + _r, _r, 0, 2 * Math.PI);
    ctx.clip()
    ctx.setStrokeStyle('#fff')
    ctx.stroke()
    ctx.drawImage(avatar, padding, usedHeight, _d, _d)
    ctx.restore()
    ctx.drawImage(rankImg, center + 22, usedHeight + _r - 30, rankWidth, 40)

    //point
    const starX = center + 22 + rankWidth + rankMargin
    const pointLength = canvasWidth - starX - 40
    ctx.save()
    ctx.beginPath()
    ctx.rect(starX, usedHeight + _r - 15, pointLength, _r + 15)
    ctx.setFontSize(pointFontSize)
    ctx.setFillStyle('#FFFFFF')
    ctx.setTextAlign('right')
    ctx.fillText(point, starX + pointLength - 5, usedHeight + _r + pointFontSize - 15)
    ctx.restore()
    ctx.setFontSize(14)
    ctx.setFillStyle('#FFFFFF')
    ctx.fillText('分', starX + pointLength, usedHeight + _r + 10)


    //draw prop
    usedHeight += 20 + _r * 2//头像直径+padding
    const itemPd = 10// 属性间距
    const itemH = 20 //属性高度
    const itemR = 10 //圆角半径
    const tripleW = (canvasWidth - padding * 2 - itemPd * 2) / 3
    //line 1
    this.roundRect(ctx, padding, usedHeight, tripleW, itemH, itemR, '金 钱', money)
    this.roundRect(ctx, padding + tripleW + itemPd, usedHeight, tripleW, itemH, itemR, '投资财富', fund)
    this.roundRect(ctx, padding + tripleW * 2 + itemPd * 2, usedHeight, tripleW, itemH, itemR, '能力才干', ability)

    //line 2
    usedHeight += itemH + 10
    this.roundRect(ctx, padding, usedHeight, tripleW, itemH, itemR, '快 乐', happy)
    this.roundRect(ctx, padding + tripleW + itemPd, usedHeight, tripleW, itemH, itemR, '健康', health )
    this.roundRect(ctx, padding + tripleW * 2 + itemPd * 2, usedHeight, tripleW, itemH, itemR, '人 脉', connections)

    //line 3  
    usedHeight += itemH + 10
    this.roundRect(ctx, padding, usedHeight, tripleW, itemH, itemR, '社会经验', experience)
    this.roundRect(ctx, padding + tripleW + itemPd, usedHeight, tripleW, itemH, itemR,'正 义', positive)

    const doubleW = (canvasWidth - padding * 2 - itemPd) / 2
    //line 4
    usedHeight += itemH + 10
    this.roundRect(ctx, padding, usedHeight, doubleW, itemH, itemR, '座 驾', car)
    this.roundRect(ctx, padding + doubleW + itemPd, usedHeight, doubleW, itemH, itemR, '房 产', house)

    //line 5
    usedHeight += itemH + 10
    this.roundRect(ctx, padding, usedHeight, doubleW, itemH, itemR, '伴 侣',couple)
    this.roundRect(ctx, padding + doubleW + itemPd, usedHeight, doubleW, itemH, itemR, '工 作', job)


    //description
    usedHeight += itemH + 10
    ctx.drawImage('../../img/survival-txt.png', padding, usedHeight, titleWidth, descriptHeight-100)
    usedHeight += 40

    ctx.setTextAlign('left')
    ctx.setFillStyle('#000')
    let str = '你在北京各种产业投资了0金钱，一旦钱包被偷了就倾家荡产了,你在北京各种产业投资了0金钱'
    for(let x=0;x<3;x++){
      const h = this.drawText(ctx, str, padding + 20, usedHeight, 10, titleWidth - 40)
      usedHeight+=h-10
    }
   
    
    //draw qrcode
    ctx.save()
    ctx.beginPath()
    let q_r = 45//二维码圆半径
    let q_d = q_r * 2//二维码尺寸
    const q_center = padding + q_r
    const bottom = 330 + 250+30
    
    ctx.arc(q_center, bottom+q_r, q_r, 0, 2 * Math.PI);
    ctx.clip()
    ctx.stroke()
    ctx.drawImage(qrCodeImg, padding, bottom , q_d, q_d)
    ctx.restore()

    ctx.setFontSize(16)

    ctx.setFillStyle('#FFFFFF')
    ctx.fillText('长按图片,扫码加入', padding + q_d + 15, bottom+45)
    ctx.fillText('马上开始鬼混吧!', padding + q_d + 15, bottom + 70)

    ctx.draw()

    const that=this
    setTimeout(()=>{
      wx.canvasToTempFilePath({
        canvasId: 'share',
        fileType: 'jpg',
        success: (res) => {
          that.setData({
            canvasSaveimg: res.tempFilePath
          })
        }, complete: function (err) {
          console.info(err)
          wx.hideLoading()
        }
      })
    },500)
   
  },
  drawText (ctx, str, x,initHeight, titleHeight, canvasWidth) {
    var lineWidth = 0;
    var lastSubStrIndex = 0; //每次开始截取的字符串的索引
    for (let i = 0; i < str.length; i++) {
      lineWidth += ctx.measureText(str[i]).width;
      if (lineWidth > canvasWidth) {
        ctx.fillText(str.substring(lastSubStrIndex, i), x, initHeight);//
        initHeight += 20;//20为字体的高度
        lineWidth = 0;
        lastSubStrIndex = i;
        titleHeight += 30;
      }
      if (i == str.length - 1) {//绘制剩余部分
        ctx.fillText(str.substring(lastSubStrIndex, i + 1), x, initHeight);
      }
    }
    titleHeight = titleHeight + 10;
    return titleHeight
  },
  roundRect(ctx, x, y, w, h, r,prop,point) {
     ctx.save()
     ctx.beginPath()
    ctx.setFillStyle('rgba(0, 0, 0, 0.4)')
     ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
     // border-top
     ctx.moveTo(x + r, y)
     ctx.lineTo(x + w - r, y)
     ctx.lineTo(x + w, y + r)
     // 右上角
     ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)
     // border-right
     ctx.lineTo(x + w, y + h - r)
     ctx.lineTo(x + w - r, y + h)
     // 右下角
     ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)
     // border-bottom
     ctx.lineTo(x + r, y + h)
     ctx.lineTo(x, y + h - r)
     // 左下角
     ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)
     // border-left
     ctx.lineTo(x, y + r)
     ctx.lineTo(x + r, y)
     // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
     ctx.fill()
     // ctx.stroke()
     ctx.closePath()
     // 剪切
     ctx.clip()
     ctx.restore()
     ctx.setFillStyle('#fff')
     ctx.setFontSize(12)
     ctx.setTextAlign('left')
     ctx.fillText(prop,x+10,y+14)
     ctx.setFillStyle('#f6de4b')
     ctx.setTextAlign('right')
     ctx.fillText(point, x +w-(r-5), y + 14)
     
  },
  onShareAppMessage: function () {

  },
  saveAsImg:function(){
    wx.canvasToTempFilePath({
      canvasId: 'share',
      fileType: 'jpg',
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            wx.hideLoading();
            wx.showToast({
              title: '保存成功',
            });
          },
          fail() {
            wx.hideLoading()
          }
        })
      }
    })
  }
})