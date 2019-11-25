

export default {
	data: {
	},
	methods: {
		// 获取用户信息
		getUserInfo: function(e) {
			wx.getUserInfo({
				success: res => {
					this.userInfo = this.$app.$options.globalData.userInfo = e.$wx.detail.userInfo;
				}
			})
		},
		// // 获取失败的去引导用户授权
		// wx.authorize({
		// 	scope: 'scope.userLocation',
		// 	success: (res) => {
		// 	  wx.getLocation({
		// 		type: "gcj02",
		// 		success: res => {
		// 		  this.onLocateMeSuccess(res)
		// 		},
		// 		fail: res => {
		// 		  this.onLocateMeFail()
		// 		}
		// 	  })
		// 	},
		// 	fail: res => {
		// 	  this.onLocateMeFail()
		// 	}
		// })
		// 获取手机号
		getPhoneNumber(e) {
			wx.checkSession({
				success: res => {
					getPhoneNumber.fetch({
						code: res.code,
						iv: e,
						encryptedData: e
					}).then(result => {
						
					})
				}, fail: () => {
					wx.login({
						success: res => {
							getPhoneNumber.fetch({
								code: res.code,
								iv: e,
								encryptedData: e
							}).then(result => {
								
							})
						}
					})
				}
			})
			
		}
	},
	created() {

	}
}
