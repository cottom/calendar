//通用工具方法
;(function () {
    var Util = (function () {
        //事件处理相关
        function addEventHandler(target, type, handler) {
            if (target.addEventListener) {
                target.addEventListener(type, handler)
            } else if (target.attachEvent) {
                target.attachEvent("on" + type, handler);
            } else {
                target["on" + type] = handler;
            }
        }

        function removeEventHandler(target, type, handler) {
            if (target.removeEventListener) {
                target.removeEventListener(type, handler);
            } else if (target.detachEvent) {
                target.detachEvent("on" + type, handler);
            } else {
                target["on" + type] = null;
            }
        }

        function queryDom(selector, element) {
            var doc = element || document;//默认document
            var isSupport = false;
            if (doc.querySelector) {
                isSupport = true;
            }

            if (selector.indexOf("#") != -1) {
                if (isSupport) return doc.querySelector(selector);
                return doc.getElementById(selector.slice(1));
            }
            if (selector.indexOf(".") !=-1) {
                if (isSupport) return doc.querySelectorAll(selector);
                if (doc.getElementsByClassName) return doc.getElementsByClassName(selector.slice(1));
                //IE8 以下不支持document.getElementsByClassName
                var children = doc.getElementsByTagName("*");//通配
                var _elements = [];
                var _className = selector.slice(1);
                //IE没有 foreach
                for (var i = 0, len = children.length; i < len; i++) {
                    var child = children[i];
                    var classNames = child.className.split(" ");
                    for (var j = 0, _len = classNames.length; j < _len; j++) {
                        if (classNames[j] == _className) {
                            _elements.push(child);//添加到结果集
                            break;
                        }
                    }
                }
                return _elements;
            }

            if (isSupport) return doc.querySelectorAll(selector);
            return doc.getElementsByTagName(selector);
        }

        function addClassName(target,className) {
            target.className +=" "+className;
        }

        function removeClassName(target, className) {
            target.className = target.className.replace(new RegExp(className,"g"),"");

            var _classNames = target.className.split(" ");
            var tmpClassName = "";
            for(var i =0;i<_classNames.length;i++){
                if(_classNames[i]==""||_classNames[i]===className){
                    continue;
                }

                tmpClassName+=(" "+_classNames[i]);
            }
            target.className = tmpClassName;

        }
        
        function getEventTarget(event) {
            if(!event) return;
            if(event.target) return event.target;
            if(event.srcElement) return event.srcElement;
        }

        function isContainClassName(element,className) {
            return new RegExp(className).test(element.className);
        }

        return {
            isContainClassName:isContainClassName,//是否包含类名
            getEventTarget:getEventTarget,//获取事件对象
            addClassName:addClassName,//添加类名
            removeClassName:removeClassName,//去除类名
            addEventHandler: addEventHandler,//添加事件监听
            removeEventHandler: removeEventHandler,//去除事件监听
            queryDom: queryDom//DOM 搜索
        };

    })();


    //对外导出
    window.Util = Util;

})();