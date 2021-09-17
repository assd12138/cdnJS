const app = new Vue({
    el: "#app",
    data: {
      // 为了防止太卡，只取列表中40个基金
      length: 40,
      // 滑动加载的阈值点
      limit: 0.5,
      jjList: {},
      observer: {
        mo: null,
        io: null
      }
    },
    mounted() {
      this.initJjList();
    },
    methods: {
      /**
       * @function initJjList
       * @return {void}
       * @description 初始化基金列表
       */
      initJjList() {
        const url = "https://fund.eastmoney.com/js/fundcode_search.js";
        const cb = () => {
          let item, key;
          for (let i = 0; i < this.length; i++) {
            item = r[i];
            key = item[0];
            this.$set(this.jjList, key, {});
            this.$set(this.jjList[key], "name", item[2]);
            this.$set(this.jjList[key], "dwjzEcharts", null);
            this.$set(this.jjList[key], "ljsylEcharts", null);
          }
          this.$nextTick((_) => {
            this.initEcharts();
            this.initMutationObserver();
            this.initIntersectionObserver();
          });
        };
        this.jsonp(url, cb);
      },
      /**
       * @function attributeChanged
       * @param {Object} records dom观察的回调，被修改的dom信息
       * @return {void}
       * @description 被修改属性后调用来进行加载
       */
      attributeChanged(records) {
        let el, code;
        records.forEach((record) => {
          // 如果code发生变化，则此时动态加载其对应的echarts图表
          if (record.attributeName === "code") {
            el = record.target;
            code = el.getAttribute("code");
            this.updateCharts(this.jjList[code], code);
          }
        });
      },
      /**
       * @function initMutationObserver
       * @return {void}
       * @description 初始化dom观察
       */
      initMutationObserver() {
        const config = {
          attributes: true
        };
        this.mo = new MutationObserver(this.attributeChanged);
        const els = document.querySelectorAll(".row");
        els.forEach((el) => {
          this.mo.observe(el, config);
        });
      },
      /**
       * @function changeAttribute
       * @param {Object} els 交错观察的回调，交错状态到达阈值的元素
       * @return {void}
       * @description 修改其属性值
       */
      changeAttribute(els) {
        let dom;
        let shouldLoad;
        els.forEach((el) => {
          dom = el.target;
          shouldLoad =
            el.intersectionRatio > this.limit && dom.hasAttribute("lazy-code");
          // 到了要展示的阈值,并且尚未进行过展示
          if (shouldLoad) {
            dom.setAttribute("code", dom.getAttribute("lazy-code"));
            dom.removeAttribute("lazy-code");
          }
        });
      },
      /**
       * @function initIntersectionObserver
       * @return {void}
       * @description 初始化交错观察
       */
      initIntersectionObserver() {
        const config = {
          root: document.querySelector("#root"),
          threshold: [this.limit] // 若划过阈值点，再行加载
        };
        this.io = new IntersectionObserver(this.changeAttribute, config);
        const els = document.querySelectorAll(".row");
        els.forEach((el) => {
          this.io.observe(el);
        });
      },
      /**
       * @function updateCharts
       * @param {Object} item 基金
       * @param {String} code 基金编号
       * @return {void}
       * @description 加载某个基金的图表
       */
      updateCharts(item, code) {
        // 显示加载框
        item.dwjzEcharts.showLoading();
        item.ljsylEcharts.showLoading();
        this.getFoundData(code).then((data) => {
          item.dwjzEcharts.setOption({
            dataset: [{ source: data.source1 }],
            title: {
              text: data.name
            }
          });
          item.ljsylEcharts.setOption({
            dataset: [{ source: data.source2 }, { source: data.source3 }]
          });
          // 隐藏加载框
          item.dwjzEcharts.hideLoading();
          item.ljsylEcharts.hideLoading();
        });
      },
      /**
       * @function initEcharts
       * @return {void}
       * @description 初始化所有的echarts表格
       */
      initEcharts() {
        for (let jjKey in this.jjList) {
          let jj = this.jjList[jjKey];
          jj.dwjzEcharts = echarts.init(
            document.querySelector(`[lazy-code="${jjKey}"] .card-dwjz`)
          );
          jj.ljsylEcharts = echarts.init(
            document.querySelector(`[lazy-code="${jjKey}"] .card-ljsyl`)
          );
          jj.dwjzEcharts.setOption(option1);
          jj.ljsylEcharts.setOption(option2);
        }
      },
      /**
       * @function dateFormat
       * @param {String} fmt 格式化字符串
       * @param {Date} date 日期
       * @returns {String} 格式化完成后的字符串
       * @description 将传入的字符串进行格式化
       */
      dateFormat(fmt, date) {
        let ret;
        const opt = {
          "Y+": date.getFullYear().toString(), // 年
          "m+": (date.getMonth() + 1).toString(), // 月
          "d+": date.getDate().toString(), // 日
          "H+": date.getHours().toString(), // 时
          "M+": date.getMinutes().toString(), // 分
          "S+": date.getSeconds().toString() // 秒
          // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (const k in opt) {
          ret = new RegExp("(" + k + ")").exec(fmt);
          if (ret) {
            fmt = fmt.replace(
              ret[1],
              ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
            );
          }
        }
        return fmt;
      },
      /**
       * @function getFoundData
       * @param {String} code 基金编码
       * @return {Promise} 基金数据
       * @description 获取基金数据
       */
      getFoundData(code) {
        return new Promise((resolve) => {
          const url = `https://fund.eastmoney.com/pingzhongdata/${code}.js`;
          this.jsonp(url, this.loaded(resolve));
        });
      },
      /**
       * @function loaded
       * @param {Function} resolve onfullfilled解析
       * @returns {Function} load处理函数
       * @description 加载完成后处理的函数
       */
      loaded(resolve) {
        return () => {
          let sources = {};
          // 求出数据
          sources.source1 = [];
          sources.source2 = [];
          sources.source3 = [];
          // 单位净值走势
          Data_netWorthTrend.map((e) => {
            const date = new Date(e.x);
            const dayData = [];
            dayData.push(this.dateFormat("YYYY/mm/dd", date));
            dayData.push(e.y);
            sources.source1.push(dayData);
          });
          // 累积收益率走势-同类平均
          Data_grandTotal[1].data.map((e) => {
            const date = new Date(e[0]);
            const dayData = [];
            dayData.push(this.dateFormat("YYYY/mm/dd", date));
            dayData.push(e[1]);
            sources.source2.push(dayData);
          });
          // 累积收益率走势-本基金
          Data_grandTotal[0].data.map((e) => {
            const date = new Date(e[0]);
            const dayData = [];
            dayData.push(this.dateFormat("YYYY/mm/dd", date));
            dayData.push(e[1]);
            sources.source3.push(dayData);
          });
          sources.name = Data_grandTotal[0].name;
          resolve(sources);
        };
      },
      /**
       * @function jsonp
       * @param {String} url 请求地址
       * @param {Function} onload 加载完成后触发的函数
       * @return {void}
       * @description 自定义请求
       */
      jsonp(url, onload) {
        const script = document.createElement("script");
        script.src = url;
        script.onload = onload;
        document.querySelector("head").appendChild(script);
      }
    }
  });
  