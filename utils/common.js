const host = 'https://game.jinrongzhushou.com/v1'
exports.wxRunAsync= (execute) => {
  return new Promise((resolve, reject) => {
    execute(resolve, reject)
  })
}
exports.wxPost = (url, paramData, successCallback, failCallback, completeCallback) => {
  wx.request({
    url: host + url,
    method: 'POST',
    data: paramData,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success(res) {
      successCallback(res)
    },
    fail(res) {
      if (typeof failCallback === 'function') {
        failCallback(res)
      }
    },
    complete(res){
      if (typeof completeCallback==='function'){
        completeCallback(res)
      }
    }
  })
}

exports.wxGet = (url, paramData, successCallback, failCallback, completeCallback) => {
  wx.request({
    url: host + url,
    data: paramData,
    success(res) {
      successCallback(res)
    },
    fail(res) {
      if (typeof failCallback === 'function') {
        failCallback(res)
      }
    },
    complete(res) {
      if (typeof completeCallback === 'function') {
        completeCallback(res)
      }
    }
  })
}

exports.parseUserState = (data,that) =>{
  console.info(data)
  if (data.errorCode === 0) {
    for (var i = 0; i < data.attrList.length; i++) {
      data.attrList[i]['textArray'] = data.attrList[i]['text'].split('')
      data.attrList[i]['length'] = data.attrList[i]['text'].length
      data.userState[data.attrList[i]['value'] + 'Length'] = data.userState[data.attrList[i]['value']].length
      data.userState[data.attrList[i]['value'] + 'Color'] = '1'
      if (data.attrList[i]['value'] === 'money' || data.attrList[i]['value'] === 'profit') {
        data.userState[data.attrList[i]['value'] + 'Color'] = '2'
      }
      if (data.attrList[i]['value'] === 'happy') {
        data.userState[data.attrList[i]['value'] + 'Color'] = '3'
      }
    }
    that.setData({
      attrList: data.attrList,
      userState: data.userState
    })
  }
}
exports.showMaskNavigationBarColor=()=>{
  wx.setNavigationBarColor({
    frontColor: '#ffffff',
    backgroundColor: '#0e1934',
    animation: {
      duration: 200,
      timingFunc: 'easeIn'
    }
  })
}
exports.closeMaskNavigationBarColor = () => {
  wx.setNavigationBarColor({
    frontColor: '#ffffff',
    backgroundColor: '#2e55af',
    animation: {
      duration: 200,
      timingFunc: 'easeOut'
    }
  })
}

exports.isEnableBtn = (hour, limitCount) =>{
  return (hour == 0 || limitCount == 1) ? false : true
}