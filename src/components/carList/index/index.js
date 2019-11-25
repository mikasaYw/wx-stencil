import eventHub from '../../../common/eventHub';
Component({
  externalClasses: ['i-class'],
  properties: {
    height: {
      type: String,
      value: '300'
    },
    // itemHeight: {
    //   type: Number,
    //   value: 21
    // }
  },
  relations: {
    '../index-item/index': {
      type: 'child',
      linked() {
        this._updateDataChange();
      },
      linkChanged() {
        this._updateDataChange();
      },
      unlinked() {
        this._updateDataChange();
      }
    }
  },
  data: {
    scrollTop: 0,
    fixedData: [],
    current: 0,
    timer: null,
    itemLineH: 0,
    currentName: '',
    isTouches: false,
    isRelative: false,
    contentTop: 0,
    windowH: 0,
    slotH: 0,
  },
  methods: {
    loop() {},
    _updateDataChange() {
      const indexItems = this.getRelationNodes('../index-item/index');
      const len = indexItems.length;
      const fixedData = this.data.fixedData;
      /*
       * 使用函数节流限制重复去设置数组内容进而限制多次重复渲染
       * 暂时没有研究微信在渲染的时候是否会进行函数节流
       */
      if (len > 0) {

        if (this.data.timer) {
          clearTimeout(this.data.timer)
          this.setData({
            timer: null
          })
        }

        this.data.timer = setTimeout(() => {
          const data = [];
          indexItems.forEach((item) => {
            if (item.data.name && fixedData.indexOf(item.data.name) === -1) {
              data.push(item.data.name);
              item.updateDataChange();
            }
          })

          this.setData({
            fixedData: data,
            itemLineH: parseInt((this.data.windowH - 2*40) / indexItems.length)
          })
          //组件加载完成之后重新设置顶部高度
          // this.setTouchStartVal();
        }, 0);

        this.setData({
          timer: this.data.timer
        })

      }
    },
    handlerScroll(event) {
      const detail = event.detail;
      const scrollTop = detail.scrollTop < this.data.scrollTop ? this.data.scrollTop : detail.scrollTop;
      // 设置下次滚动前的高度 防止点击最后一个元素后上弹
      this.data.scrollTop = detail.scrollTop;

      const indexItems = this.getRelationNodes('../index-item/index');
      if (this.data.isRelative) {
        this.setData({
          contentTop: scrollTop
        })
      }
      indexItems.forEach((item, index) => {
        let data = item.data;
        let offset = data.top + data.height;
        if (scrollTop < offset && scrollTop >= data.top) {
          this.setData({
            current: index,
            currentName: data.currentName,
          })
        }
      })
    },
    getCurrentItem(index) {
      const indexItems = this.getRelationNodes('../index-item/index');
      let result = {};
      const item = indexItems[index]
      if (item) {
        result = item.data;
        result.total = indexItems.length;
        return result;
      }
    },
    triggerCallback(options) {
      this.triggerEvent('change', options)
    },
    handlerFixedTap(event) {
      const eindex = event.currentTarget.dataset.index;
      const item = this.getCurrentItem(eindex);
      this.setData({
        scrollTop: item.top,
        currentName: item.currentName,
        isTouches: true
      })
      this.triggerCallback({
        index: eindex,
        current: item.currentName
      })
    },
    handlerTouchMove(event) {
      const data = this.data;
      // 每块字母的高度

      const touches = event.touches[0] || {};
      const pageY = touches.pageY;
      const rest = pageY - 40;
      let index = parseInt(rest / data.itemLineH);
      const movePosition = this.getCurrentItem(index);

      /*
       * 当touch选中的元素和当前currentName不相等的时候才震动一下
       * 微信震动事件
       */
      if (!movePosition) {
        return
      }
      if (movePosition.name !== this.data.currentName) {
        wx.vibrateShort();
      }

      this.setData({
        scrollTop: movePosition.top,
        currentName: movePosition.name,
        isTouches: true
      })

      this.triggerCallback({
        index: index,
        current: movePosition.name
      })
    },
    handlerTouchEnd() {
      setTimeout(() => {
        this.setData({
          isTouches: false
        })
      }, 200);
    },
  },
  lifetimes: {
    // 在组件实例进入页面节点树时执行
    ready() {
      eventHub.$on('scrollToTop', () => {
        setTimeout(() => {
          this.setData({
            scrollTop: 0
          })
        });
      })
      // 获取内容高度
      wx.getSystemInfo({
        success: res => {
          this.setData({
            windowH: res.windowHeight,
          })
        }
      }) 
      // 顶部还有其他slot
      const pages = getCurrentPages();
      if (pages[0].route === 'pages/chooseCar/index') {
        wx.createSelectorQuery().select('.slot').boundingClientRect(rect => {
          this.setData({
            isRelative: true,
            slotH: rect.height
          })
        }).exec();
      }
    },
  },
})