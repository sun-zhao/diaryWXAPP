import job from './job.js'
import plan from './plan.js'
import car from './car.js'
import house from './house.js'
import couple from './couple.js'
import clothes from './clothes.js'
import luxury from './luxury.js'
import luck from './luck.js'
import event from './event.js'
import fund from './fund.js'

const { wxGet, parseUserState, showMaskNavigationBarColor,closeMaskNavigationBarColor } = require('../utils/common.js')

const commonData = {
  nightClass:'',
  nightText:'',
  submitFlag: false,
  maskShow: false,
  dialogShow:false,
  dialogResult:'',
  dialogBtn:'确 定',
  tipShow: false,
  tipItems: [],
  findEventId:'',
  findEventType:'',
  hangOn:false
}
function storeMixin(options) {
  let result = {
    data: commonData,
    watch:{
      'maskShow':function(n,o){
        const that=this
        if (!n) { //show event 
          setTimeout(() => {
            const userId = this.data.userData.userId
            if (!that.data.maskShow && userId) {
              const { id: findEventId, category } = this.getEventStack().pop() || {}
              const stack = that.getEventStack()
              if (findEventId && category === 'plan') {
                that.setData({ hangOn: true })
                wxGet('/user/plan/findEvent',
                  { userId, findEventId },
                  ({ data }) => {
                    const eventId = data['eventId']
                    if (data.errorCode >= 0) {
                      wxGet('/userEvent/load',
                        { userId, eventId },
                        ({ data }) => {
                          if (data.errorCode >= 0) {
                            if (!that.data.maskShow) {//请求结束再次判断时候有其他弹出
                              that.showEvent(data)
                              if (Math.ceil(Math.random() * 100) < stack.continueOdds()) {
                                stack.push({ category: 'random-serial' })
                              }
                            }
                          }
                        }, null, () => {//load complete callback
                          that.setData({ hangOn: false })
                        })
                    }
                  }, null, () => {//findEvent complete callback
                    that.setData({ hangOn: false })
                  })
              } else if (category && category !== 'plan') {
                wxGet('/userEvent/findEvent',
                  { userId },
                  ({ data }) => {
                    const eventId = data['eventId']
                    if (data.errorCode >= 0) {
                      that.setData({ hangOn: true })
                      wxGet('/userEvent/load',
                        { userId, eventId },
                        ({ data }) => {
                          if (data.errorCode >= 0) {
                            if (!that.data.maskShow) {//请求结束再次判断时候有其他弹出
                              that.showEvent(data)
                              const randomPoint = Math.ceil(Math.random() * 100)
                              if (randomPoint < stack.continueOdds()) {
                                stack.push({ category: 'random-serial' })
                              }
                            }
                          }
                        }, null, () => {//load fail callback
                          that.setData({ hangOn: false })
                        })
                    }
                  }, null, () => {//findEvent fail callback
                    that.setData({ hangOn: false })
                  })
              }
            }
          }, 1500)
        }
      },
      'hangOn':function(n,o){
        if(n){
          const that=this
          setTimeout(()=>{
            that.setData({
              hangOn:false
            })
          },1500)
        }
      }
    },
    closeTip: function () {
      const that = this
      closeMaskNavigationBarColor()
      that.voiceContext().playClick()
      that.setData({ tipShow: false, maskShow: false })
    },
    actionTip: function () {
      const that = this
      showMaskNavigationBarColor()
      that.voiceContext().playClick()
      that.setData({tipShow:true,maskShow:true})
    },
    resultVoice: function (data,luckWin){
      const that = this
      if (data){
        if (data.errorCode == 0) {
          if (luckWin){
            that.voiceContext().playWin()
          }else{
            that.voiceContext().playResult()
          }
        } else if (data.errorCode == 1) {
          that.voiceContext().playFail()
        }
      }
    },
    dialogOK:function(){
      const that=this
      that.voiceContext().playClick()
      wxGet('/user/refresh/' + that.data.userData.userId,
        false,
        ({ data }) => {
          parseUserState(data, that)
          closeMaskNavigationBarColor()
          that.setData({maskShow:false,dialogShow:false})
          // const eventType = that.data.findEventType 
          // if (eventType){
          //   wxGet(`/user/${eventType}/findEvent`,
          //     {
          //       userId: that.data.userData.userId,
          //       findEventId: that.data.findEventId,
          //     },
          //     ({ data }) => {
          //       console.info(data)
          //     })
          // }
         
        })
    },
    blackScreen:function(showClass,text,blackCallback,doneCallback){
      const that = this
      const times=showClass==='show'?1000:0
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#000',
        animation: {
          duration: times,
          timingFunc: 'easeIn'
        }
      })
      that.setData({ nightClass: showClass })
      setTimeout(function () {
        that.setData({ nightText: text })
        if (blackCallback) {
          blackCallback()
        }
      }, 1200)
      setTimeout(function () {
        that.setData({ nightClass: 'show hide', nightText: '' })
        wx.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: '#2e55af',
          animation: {
            duration: 1000,
            timingFunc: 'easeIn'
          }
        })
      }, 2500)
      setTimeout(function () {
        that.setData({ nightClass: '' })
        if (doneCallback){
          doneCallback()
        }
      }, 3500)
    }
  }
  for (let k in options) {
    let value = options[k];
    if (value.data) {
      //result.data[k] = value.data
      Object.assign(result.data, value.data)
      delete value.data
    }
    if(value.watch){
      Object.assign(result.watch, value.watch)
      delete value.watch
    }
    Object.assign(result, value)
  }
  return result;
}

export default storeMixin({ job, plan, car, house, couple, clothes, luxury, luck, event, fund})