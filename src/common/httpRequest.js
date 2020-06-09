import store from '@/store';
import { url } from './url';

let API_URL = '';
 

const codeMessage = {
  400: '发出的请求有错误，请求的格式不正确。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
};

let loginInfo = wx.getStorageSync('loginInfo') || {},
    httpUrl_list = Object.create({}),
    cacheQueue = {
        isTokening: false,
        queueList: [],
        pushQueue(opts) {
            this.queueList.push(opts)
        },
        execQueue() {
            this.queueList.forEach((item, index) => {
                item.header['Authorization'] = `Bearer ${loginInfo.accessToken}`;
                item.header['userId'] = loginInfo.userId || '';
                wx.request(item);
                // 执行完任务后 清空队列
                if (index === this.queueList.length - 1) {
                    this.queueList.length = 0
                }
            })
        }
    };

store.state.userId = loginInfo && loginInfo.userId || '0';

function getToken () {
    return new Promise((resolve, reject) => {
        wx.login({
            success: res => {
                wx.request({
                    header: {
                        'content-type': 'application/json'
                    },
                    url: API_URL + url.http_identity.api,
                    method: 'POST',
                    data: {
                        grantType: 8,
                        wxCode: res.code,
                        clientId: 'applet_minicxt',
                        refreshToken: loginInfo.refreshToken ? loginInfo.refreshToken : ''
                    },
                    success: ress => {
                        wx.setStorageSync('loginInfo', ress.data.data || {});
                        loginInfo = ress.data.data || {};
                        store.state.userId = ress.data.data && ress.data.data.userId || '0';
                        resolve(ress)
                    },
                    fail: error => {
                        wx.showToast({
                            title: error.data.message,
                            icon: 'none'
                        })
                        reject(error)
                    }
                })
            }
        });
    })
}

function checkStatus (res, opts) {
  if (res.statusCode >= 200 && res.statusCode < 300) {
    return res;
  }

  const { data: { message }, statusCode } = res;
  const errorText = message || codeMessage[statusCode];

  switch (res.statusCode) {
    case 401:
        (async() => {
            try {
                cacheQueue.pushQueue(opts);
                if (cacheQueue.isTokening === false) {
                    cacheQueue.isTokening = true
                    const result = await getToken();
                    cacheQueue.isTokening = false;
                    if (result.data.result) {
                        cacheQueue.execQueue()
                    } else {
                        wx.showToast({
                            title: result.data.message,
                            icon: 'none'
                        })
                        cacheQueue.queueList.length = 0
                    }
                }
            } catch (error) {
                console.log(error)
            }
        })()
        break;
    case 400:
    case 403:
    case 404:
        wx.showToast({
            title: errorText,
            icon: 'none',
        });
        break;
    case 500:
    case 501:
    case 502:
    case 503:
    case 504:
      wx.showToast({
        title: '服务器出了点小差！',
        icon: 'none',
      });
  }

  const error = new Error(errorText);
  error.response = res;
  throw error;
}

class Http {
    constructor(url) {
        this.url = API_URL + url;
    }
    request (method, options, isShowLoading = false, isResult = true) {
        return new Promise(async (resolve, reject) => {
            if (isShowLoading) wx.showLoading();
            const opts = {
                header: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': loginInfo.accessToken ? `Bearer ${loginInfo.accessToken}` : '',
                    'userId': loginInfo.userId ? loginInfo.userId : '',
                    'clientId': 'applet_minicxt',
                },  
                url: `${ method == 'POST' ? this.url : `${this.url}${options ? `?${options}` : ''}` }`,
                method: method,
                data: method == 'POST' ? options : '',
                success: res => {
                    try {
                        checkStatus(res, opts);
                    } catch (e) {
                        // 无感登陆
                        if (res.statusCode == 401) {
                            return false
                        }
                    }
                    try {
                        if (res.data.result == false && isResult) {
                            throw new Error(res.data.message)
                        }
                        resolve(res);
                    } catch (e) {
                        wx.showToast({
                            title: e.message,
                            icon: 'none'
                        })
                    }
                },
                fail: res => {
                    reject(res)
                    wx.showToast({
                        title: res.errMsg,
                        icon: 'none'
                    })
                },
                complete: () => {
                    if(isShowLoading) wx.hideLoading();
                }
            };
            if (!loginInfo.accessToken) {
                try {
                    cacheQueue.pushQueue(opts);
                    if (cacheQueue.isTokening === false) {
                        cacheQueue.isTokening = true
                        const result = await getToken();
                        cacheQueue.isTokening = false;
                        if (result.data.result) {
                            cacheQueue.execQueue()
                        } else {
                            wx.showToast({
                                title: result.data.message,
                                icon: 'none'
                            })
                            cacheQueue.queueList.length = 0
                        }
                    }
                } catch (error) {
                    console.log(error)
                }
            } else {
                wx.request(opts);
            }
        });
    }

    uploadTask(options) {
        return new Promise((resolve, reject) => {
            const uploadTask = wx.uploadFile({
                url: this.url, 
                filePath: options[0],
                headers: {
                    'content-type': 'application/json',
                },
                name: 'file',
                success: res => {
                    const data = JSON.parse(res.data);
                    if(!data.result) {
                        wx.showToast({
                            title: data.message,
                            icon: 'none',
                        })
                    }
                    resolve(data);
                }
            })
            uploadTask.onProgressUpdate((res) => {
                wx.showLoading({
                    title: `上传中 ${res.progress}%`,
                })
                if(res.progress == 100) {
                    wx.showToast({
                        title: '上传成功',
                        icon: 'success',
                        duration: 2000
                    })
                    wx.hideLoading()
                }
            })
        })
    }
}

class GET extends Http {
    constructor(url) {
        super(url)
    }
    fetch(options, isShowLoading, isResult) {
        return this.request('GET', options, isShowLoading, isResult)
    }
}

class POST extends Http {
    constructor(url) {
        super(url)
    }
    fetch(options, isShowLoading, isResult) {
        return this.request('POST', options, isShowLoading, isResult)
    }
}

// export const http = new Http();
// export default http.request;

for (let key in url) {
    let temp = url[key].method;
    switch (temp) {
        case ('GET'):
            httpUrl_list[key] = new GET(url[key].api);
            break;
        case ('POST'):
            httpUrl_list[key] = new POST(url[key].api);
            break;
        case ('Http'):
            httpUrl_list[key] = new Http(url[key].api);
            break;
    }
}

exports = module.exports = httpUrl_list;