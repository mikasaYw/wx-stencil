// import eventHub from '@/common/eventHub';
import {url} from './url';
const API_URL = 'https://cxtapi.easypass.cn/api/' //

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  202: '一个请求已经进入后台排队（异步任务）。',
  400: '发出的请求有错误，请求的格式不正确。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

function checkStatus (res) { 
  if (res.statusCode >= 200 && res.statusCode < 300) {
    return res;
  }

  const { data: { message }, statusCode } = res;
  const errorText = message || codeMessage[statusCode];

  switch (res.statusCode) {
    case 400:
    case 403:
    case 404:
    case 422:
    case 429:
      wx.showToast({
        title: errorText,
        icon: 'none',
      });
      break;
    case 500:
    case 501:
    case 503:
      wx.showToast({
        title: '服务器出了点小问题！',
        icon: 'none',
      });
  }

  const error = new Error(errorText);
  error.response = res;

//   eventHub.$emit('http-error', error);

  throw error;
}

class Http {
    constructor(url) {
        this.url = API_URL + url
    }
    async request (method, options = {}) {
        return new Promise((resolve, reject) => {
            let header = {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            };
            // wx.showLoading()
            const opts = {
                header: header,
                url: `${this.url}`,
                method: method,
                data: options,
                success: res => {
                    try {
                        checkStatus(res);
                    } catch (e) {
                        reject(e);
                    }
                    resolve(res);
                },
                fail: res => {
                    reject(res);
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                },
                complete: res => {
                    // wx.hideLoading()
                }
            };
            wx.request(opts);
        });
    }
}

class GET extends Http {
    constructor(url) {
        super(url)
    }
    
    fetch(options) {
        return this.request('GET', options)
    }
}

class POST extends Http {
    constructor(url) {
        super(url)
    }
    
    fetch(options) {
        return this.request('POST', options)
    }
}

// export const http = new Http();
// export default http.request;

// api
// const carSourceDetail = new POST(url.carSourceDetail)
const carSourceDetail = new GET(url.carSourceDetail);

const reqCommentList = new GET(url.reqCommentList);
const reqLikeList = new GET(url.reqLikeList);
const reqMomentDetail = new GET(url.reqMomentDetail);
const reqRecommendList = new GET(url.reqRecommendList);
const reqMasterBrands = new GET(url.reqMasterBrands);

export {
    carSourceDetail,
    reqCommentList,
    reqLikeList,
    reqMomentDetail,
    reqRecommendList,
    reqMasterBrands,
}