// 以下是常用的代码收集，没有任何技术含量，只是填坑的积累。

// 对 cookie 的添加/获取和删除
var cookie = {
  //写cookies
  setCookie: function (name, value) {
      var Days = 365;
      var exp = new Date();
      exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
      document.cookie =
          name + '=' + escape(value) + ';expires=' + exp.toGMTString();
  },

  //读取cookies
  getCookie: function (name) {
      var arr,
          reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
      if ((arr = document.cookie.match(reg))) return unescape(arr[2]);
      else return null;
  },

  //删除cookies， name可以为字符串('username')或数组(['username', 'password', ...])
  delCookie: function (name) {
      var delItem = function (item) {
          var exp = new Date();
          exp.setTime(exp.getTime() - 1);
          var cval = cookie.getCookie(item);
          if (cval !== null)
              document.cookie =
                  item + '=' + cval + ';expires=' + exp.toGMTString();
      };

      if (typeof name === 'string') {
          delItem(name);
      } else {
          for (var i = 0, len = name.length; i < len; i++) {
              delItem(name[i]);
          }
      }
  },
};

//格式化日期
Date.prototype.Format = function(formatStr) {
    var str = formatStr;
    var Week = ['日', '一', '二', '三', '四', '五', '六'];
    str = str.replace(/yyyy|YYYY/, this.getFullYear());
    str = str.replace(/yy|YY/, this.getFullYear().toString().substr(2));
    str = str.replace(/MM/, (this.getMonth() + 1) > 9 ? (this.getMonth() + 1).toString() : '0' + (this.getMonth() + 1));
    str = str.replace(/M/g, (this.getMonth() + 1));
    str = str.replace(/w|W/g, Week[this.getDay()]);
    str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
    str = str.replace(/d|D/g, this.getDate());
    str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
    str = str.replace(/h|H/g, this.getHours());
    str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
    str = str.replace(/m/g, this.getMinutes());
    str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
    str = str.replace(/s|S/g, this.getSeconds());
    return str
}

// 为 localStorage 添加过期时间
class LocalStore {
  prefix = '';

  // 初始化，并设置字段的前缀
  constructor({ prefix }) {
      this.prefix = prefix + '.';
  }

  // 设置字段，并设置过期时间
  setItem(key, value, day = 30) {
      if (window.localStorage) {
          const expire =
              new Date().getTime() + day * 24 * 60 * 60 * 1000;

          window.localStorage.setItem(
              this.prefix + key,
              JSON.stringify({
                  value,
                  expire,
              })
          );
      }
  }

  // 若存在且在有效期，则正常返回，否则为null
  getItem(key) {
      if (window.localStorage) {
          const result = window.localStorage.getItem(this.prefix + key);
          if (result) {
              try {
                  const { value, expire } = JSON.parse(result);

                  if (Date.now() <= expire) {
                      return value;
                  }

                  // 当过期的时候，自动删除
                  this.delItem(key);
                  return null;
              } catch (e) {
                  console.warn('LocalStore getItem error: ' + e);
              }
          }
          return null;
      }
  }

  // 删除数据
  delItem(key) {
      window.localStorage &&
          window.localStorage.removeItem(this.prefix + key);
  }

  // 删除已过期的key，返回已删除的key的数量
  cleanExceed() {
      let num = 0;
      if (window.localStorage) {
          const length = localStorage.length;
          const now = Date.now();
          let key = '';
          for (let i = 0; i < length; i++) {
              key = localStorage.key(i);
              if (key && key.indexOf(this.prefix) === 0) {
                  const result = window.localStorage.getItem(key);
                  if (result) {
                      try {
                          const { expire } = JSON.parse(result);
                          if (now > expire) {
                              this.delItem(key);
                              num++;
                          }
                      } catch (e) {
                          console.warn('LocalStore getItem error: ' + e);
                      }
                  }
              }
          }
      }
      return num;
  }
}

// 复制文本到剪切板
function copyToClipboard(data) {
    const _tempInput = document.createElement('input')
    _tempInput.value = data.value
    document.body.appendChild(_tempInput)
    _tempInput.select()
    document.execCommand('Copy')
    document.body.removeChild(_tempInput)
}

// 前端生成文件并下载
function createAndDownloadFile(fileName, content) {
    const aTag = document.createElement('a');
    const blob = new Blob([content]);
    aTag.download = `${fileName}.json`;
    aTag.href = URL.createObjectURL(blob);
    aTag.click();
    URL.revokeObjectURL(blob);
}

// 高亮文本
function highlight(text, words, tag='span') {
    let i, len = words.length, re;
    for (i = 0; i < len; i++) {
	re = new RegExp(words[i], 'g');
	if (re.test(text)) {
	    text = text.replace(re, '<'+ tag +' class="highlight">$&</'+ tag +'>');
	}
    }
    return text;
}

// 限制文本字数
function excerpt(str, nwords) {
    let words = str.split(' ');
    words.splice(nwords, words.length-1);
    return words.join(' ') +
	(words.length !== str.split(' ').length ? '…' : '');
}

// 防止被Iframe嵌套
if(top != self){
    location.href = "about:blank";
}

// 判断ios和安卓
var u = navigator.userAgent, app = navigator.appVersion;
var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //android终端或者uc浏览器
var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

// 判断微信客户端
function isWechat() {  
    var ua = navigator.userAgent.toLowerCase();
    return /micromessenger/i.test(ua) || /windows phone/i.test(ua);
}

// 清除空格
String.prototype.trim = function() {
    var reExtraSpace = /^\s*(.*?)\s+$/;
    return this.replace(reExtraSpace, "$1")
}

// 清除左空格/右空格
function ltrim(s){ return s.replace( /^(\s*|　*)/, ""); } 
function rtrim(s){ return s.replace( /(\s*|　*)$/, ""); }

// 判断是否为数字类型
function isDigit(value) {
    var patrn = /^[0-9]*$/;
    if (patrn.exec(value) == null || value == "") {
        return false
    } else {
        return true
    }
}

// 判断具体类型
function getType(a) {
    var typeArray = Object.prototype.toString.call(a).split(" ");
    return typeArray[1].slice(0, -1);
}


// 动态加载js或css文件
function delay_js(url) {
    var type = url.split(".")
      , file = type[type.length - 1];
    if (file == "css") {
      var obj = document.createElement("link")
        , lnk = "href"
        , tp = "text/css";
      obj.setAttribute("rel", "stylesheet");
    } else
      var obj = document.createElement("script")
        , lnk = "src"
        , tp = "text/javascript";
    obj.setAttribute(lnk, url);
    obj.setAttribute("type", tp);
    file == "css" ? document.getElementsByTagName("head")[0].appendChild(obj) : document.body.appendChild(obj);
    return obj;
  }

// 检验URL链接是否有效
function getUrlState(URL){ 
    var xmlhttp = new ActiveXObject("microsoft.xmlhttp"); 
    xmlhttp.Open("GET",URL, false);  
    try{  
        xmlhttp.Send(); 
    }catch(e){

    }finally{ 
        var result = xmlhttp.responseText;
        if(!result) return(false); 
        return xmlhttp.Status == 200;
    }
}

// 获取页面高度
function getPageHeight(){
    var g = document, a = g.body, f = g.documentElement, d = g.compatMode == "BackCompat"
                    ? a
                    : g.documentElement;
    return Math.max(f.scrollHeight, a.scrollHeight, d.clientHeight);
}

// 获取页面可视宽度
function getPageViewWidth(){
    var d = document, a = d.compatMode == "BackCompat" ? 
       				   d.body: d.documentElement;
    return a.clientWidth;
}

// 获取页面宽度
function getPageWidth(){
    var g = document, a = g.body, f = g.documentElement, d = g.compatMode == "BackCompat"?
    					  a: g.documentElement;
    return Math.max(f.scrollWidth, a.scrollWidth, d.clientWidth);
}

// 返回顶部的通用方法
// TODO

//判断手机横竖屏状态：
//移动端的浏览器一般都支持window.orientation这个参数，通过这个参数可以判断出手机是处在横屏还是竖屏状态。
window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function() {
    if (window.orientation === 180 || window.orientation === 0) { 
        alert('竖屏状态！');
    } 
    if (window.orientation === 90 || window.orientation === -90 ){ 
        alert('横屏状态！');
    }  
}, false); 


// 移动端滚动到顶部|元素
function scrollIntoView(el) {
    el.scrollIntoView();
}

// 键盘弹起事件
/**
 *
 * @param {fn} fn1  // 键盘弹出事件处理
 * @param {fn} fn2  // 键盘收起事件处理
 */
function handleKeyBoard(fn1, fn2) {
    if (isAndroid) {
        const innerHeight = window.innerHeight;
        window.addEventListener('resize', (event) => {
            const newInnerHeight = window.innerHeight;
            if (innerHeight > newInnerHeight) {
                // 键盘弹出事件处理
                fn1()
            } else {
                fn2()
            // 键盘收起事件处理
            }
        });
    } else if (isIOS) {
        document.body.addEventListener('onfocusin', (event) => {
            // 键盘收起事件处理
            fn1()
        });
        document.body.addEventListener('focusout', (event) => {
            // 键盘收起事件处理
            fn2()
        });
    }
}

// requestAnimationFrame兼容问题
if(!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        // Older versions Chrome/Webkit
        window.webkitRequestAnimationFrame ||
        // Firefox < 23
        window.mozRequestAnimationFrame ||
        // opera
        window.oRequestAnimationFrame ||
        // ie
        window.msRequestAnimationFrame ||
        function (callback) {
            return window.setTimeout(callback, 1000 / 60);
        };
    })()
}

// 平滑滚动到顶部
const scrollToTop = () => {
    const fromTopDistance = document.documentElement.scrollTop || document.body.scrollTop;
    if (fromTopDistance > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, fromTopDistance - fromTopDistance/ 8);
    }
}

// 快-慢 滚动到顶部
class ScrollTop {
    constructor() {
        this.oldSpeed = -100000;
        this.speed = 8
    }
    goTop(type) {
        // 重置oldspeed
        if(type === 'clear') return this.resetOldSpeed();
        // 获取scrollTop和speed
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        if(scrollTop === 0) return
        let ispeed = Math.floor(-scrollTop / this.speed);
        // 最低速度 5
        if(ispeed > -5) ispeed = -5;
        // 设置scrollTop
        document.documentElement.scrollTop = document.body.scrollTop = scrollTop + ispeed;
        // 滚动期间上划了屏幕:停止滑动
        if(this.oldSpeed > ispeed) return this.resetOldSpeed();
        // 上次算出来的ispeed
        this.oldSpeed = ispeed;
        // 递归调用
        if (scrollTop > 0) window.requestAnimationFrame(this.goTop.bind(this));
    }
    resetOldSpeed() {
        this.oldSpeed = -10000
    }
}


