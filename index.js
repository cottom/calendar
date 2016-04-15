/**
 * Created by jerry on 16/4/11.
 */
;(function () {
    'use strict';
    var _year = Util.queryDom("#year");
    var _month = Util.queryDom("#month");
    var _mainBody = Util.queryDom("#formBody");
    var _formHead = Util.queryDom("#formHead");
    var _dateStrDom = Util.queryDom("#dateStr");
    var _lunarDateDom = Util.queryDom("#lunarDateStr");
    var _todayDom = Util.queryDom("#today");
    var _termDom = Util.queryDom("#term");
    var _festivalDom = Util.queryDom("#festival");
    var _weekDayDom = Util.queryDom("#weekDay");

    //侧滑参数
    var slider = {};
    var chosenDate;//选择的日期
    var cacheTDDom = [];//缓存42个td DOM元素
    initial();


    ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////
    /**
     * 初始化函数
     */
    function initial() {
        initialLayout();
        Util.addEventHandler(_year, "change", changeHandler);
        Util.addEventHandler(_month, "change", changeHandler);
        Util.addEventHandler(_mainBody, "click", dayItemClick);
        Util.addEventHandler(_mainBody, "touchstart", touchstartHandler);
        Util.addEventHandler(_mainBody, "touchmove", touchmoveHandler);
        Util.addEventHandler(_mainBody, "touchend", touchendHandler);
        var dateStr = calendar.dateToString(new Date());
        var _dateArr = dateStr.split("-");
        _year.value = _dateArr[0];
        _month.value = _dateArr[1] - 0;
        changeHandler();
        //前进后退
        Util.addEventHandler(_formHead, "click", add_sub);
    }


    /**
     * 滑动开始事件
     * @param event
     */
    function touchstartHandler(event) {
        var touch = event.targetTouches[0];
        var _now = new Date();
        slider.startPos = {x: touch.pageX, y: touch.pageY, date: _now};
        slider.endPos = {x: touch.pageX, y: touch.pageY, date: _now};
        slider.isScrolling = true;//滑动标记
    }

    /**
     * 滑动移动事件
     * @param event
     */
    function touchmoveHandler(event) {
        event.preventDefault();
        var _now = new Date();
        var touch = event.targetTouches[0];
        if (slider.isScrolling) {
            slider.endPos = {x: touch.pageX, y: touch.pageY, date: _now};
        }
    }

    /**
     * 滑动结束事件
     * @param event
     */
    function touchendHandler(event) {
        if (slider.isScrolling) {
            var dx = slider.endPos.x - slider.startPos.x;
            var dy = slider.endPos.y - slider.startPos.y;
            var dDate = slider.endPos.date - slider.startPos.date;
            if (dDate < 500) { //500毫秒,避免长时间的滑动
                if (Math.abs(dx) > 50) {//触发滑动事件
                    event.preventDefault();//阻止点击事件

                    //webkit mobile BUG touch 事件时不会重绘已有dom的className
                    if (dx > 0) {
                        monthSub();
                    } else {
                        monthAdd();
                    }
                }
            }
        }
        slider.isScrolling = false;
    }


    /**
     * 每天的点击事件
     * @param event
     */
    function dayItemClick(event) {

        var target = Util.getEventTarget(event);
        if (!target) return;
        if (slider.isScrolling) return;
        while (!Util.isContainClassName(target, "dayItem") && target != document) {//找到该节点
            target = target.parentNode;
        }
        if (!Util.isContainClassName(target, "dayItem")) return;
        if (Util.isContainClassName(target, "choseDay")) return;


        clearChosenDay();
        var calData = target.calData;
        chosenDate = calData;

        if (calData.month == _month.value) {
            if (!calData.isToday) {
                Util.addClassName(target, "chosenDay");
            }
            renderOneday();
            return;
        } else if ((calData.month > _month.value && calData.year == _year.value) || calData.year > _year.value) {
            monthAdd();
        } else {
            monthSub();
        }
        renderOneday();
    }

    /**
     * 渲染每天的具体情况
     */
    function renderOneday() {
        clearDaySep();
        var _dateStr = chosenDate.year + "年" + chosenDate.month + "月" + chosenDate.day + "日";
        _dateStrDom.innerText = _dateStr;
        _weekDayDom.innerText = chosenDate.weekDay;
        _lunarDateDom.innerText = chosenDate.lunarMonthName + " " + chosenDate.lunarDayName;
        _todayDom.innerText = "今天是:" + calendar.dateToString(new Date());

        var lunarFestival = chosenDate.lunarFestival;
        var solarFestival = chosenDate.solarFestival;
        var term = chosenDate.term;
        if (term) {
            _termDom.innerText = term;
        }

        var festival = "";
        if (lunarFestival) {
            festival += lunarFestival;
        }
        if (solarFestival) {
            if (festival == "") {
                festival += solarFestival;
            } else {
                festival = festival + "/" + solarFestival;
            }
        }
        _festivalDom.innerText = festival;
    }

    /**
     * 获取数据进行渲染
     * @param event
     */
    function changeHandler() {
        var _yearVal = _year.value;
        var _monthVal = _month.value;
        var res = calendar.getMonthDays(_yearVal, _monthVal);
        render(res);
    }


    /**
     * 清除具体天详细情况的函数
     */
    function clearDaySep() {
        _dateStrDom.innerText = "";
        _lunarDateDom.innerText = "";
        _weekDayDom.innerText = "";
        _termDom.innerText = "";
        _festivalDom.innerText = "";
    }


    /**
     * 处理月份年份前进后退的函数,使用事件委托机制
     * @param event
     */
    function add_sub(event) {
        var target = Util.getEventTarget(event);

        switch (target.id) {
            case "year_sub":
                if (_year.value > 1900) {
                    _year.value = _year.value - 0 - 1;
                    changeHandler();
                }
                break;
            case "year_add":
                if (_year.value < 2100) {
                    _year.value = _year.value - 0 + 1;
                    changeHandler();
                }
                break;

            case "month_sub":
                monthSub();
                break;
            case  "month_add":
                monthAdd();
                break;
            default:
                break;
        }
    }

    /**
     * 月份增加
     */
    function monthAdd() {
        if (!(_month.value == 12 && _year.value == 2100)) {
            if (_month.value == 12) {
                _year.value = _year.value - 0 + 1;
                _month.value = 1;
            } else {
                _month.value = _month.value - 0 + 1;
            }
            changeHandler();//重新渲染
        }
    }

    /**
     * 月份减小
     */
    function monthSub() {
        if (!(_month.value == 1 && _year.value == 1900)) {

            if (_month.value == 1) {
                _year.value = _year.value - 0 - 1;
                _month.value = 12;
            } else {
                _month.value = _month.value - 0 - 1;
            }
            changeHandler();//重新渲染
        }
    }

    /**
     * 初始化表格布局
     */
    function initialLayout() {
        var TRDOM;
        var TDDOM;
        for (var i = 0; i < 42; i++) {
            if (i % 7 == 0) {//当前节点是新的一行
                TRDOM = document.createElement("tr");
                Util.addClassName(TRDOM, "trItem");
            }
            TDDOM = document.createElement("td");
            Util.addClassName(TDDOM, "dayItem");
            if (i % 7 == 0 || (i + 1) % 7 == 0) Util.addClassName(TDDOM, "weekDays");//周末
            TRDOM.appendChild(TDDOM);
            cacheTDDom.push(TDDOM);//添加到缓存中
            if ((i + 1) % 7 == 0) {
                _mainBody.appendChild(TRDOM);
            }
        }
        var tmpOption = [];
        for (var yearOption = 1900; yearOption <= 2100; yearOption++) {
            var str = "<option value='" + yearOption + "'>" + yearOption + "</option>";
            tmpOption.push(str);

        }
        _year.innerHTML = tmpOption.join("");

        var tmpOption = [];
        for (var monthOption = 1; monthOption <= 12; monthOption++) {
            var str = "<option value='" + monthOption + "'>" + monthOption + "</option>";
            tmpOption.push(str);
        }
        _month.innerHTML = tmpOption.join("");
    }

    /**
     * 初始化样式
     */
    function clearStyle() {
        for (var i = 0; i < 42; i++) {
            Util.removeClassName(cacheTDDom[i], "crossMonth");
            Util.removeClassName(cacheTDDom[i], "today");
            Util.removeClassName(cacheTDDom[i], "chosenDay")
        }
    }

    /**
     * 点击事件后初始化选中天
     */
    function clearChosenDay() {
        for (var i = 0; i < 42; i++) {
            Util.removeClassName(cacheTDDom[i], "chosenDay");
        }
    }

    /**
     * 渲染DOM中的数据
     * @param res数据
     */
    function render(res) {
        clearStyle();
        clearChosenDay();

        var currentMonth = res.currentMonth;
        var data = res.data;
        for (var i = 0; i < data.length; i++) {
            var cal = data[i];
            var calDOM = cacheTDDom[i];
            calDOM.calData = cal;//DOM节点反向关联数据
            if (cal.month != currentMonth) {
                Util.addClassName(calDOM, "crossMonth");
            }
            if (cal.isToday) {
                if (!chosenDate) chosenDate = cal;
                renderOneday();
                Util.addClassName(calDOM, "today");//今天的

            } else {
                if (chosenDate && chosenDate.dateStr == cal.dateStr) {
                    Util.addClassName(calDOM, "chosenDay");
                }
            }
            var _className = "lunar";
            var text = cal.lunarDayName;
            if (cal.lunarFestival) {
                text = cal.lunarFestival;
                _className = "festival";
            } else if (cal.solarFestival) {
                text = cal.solarFestival;
                _className = "festival";
            } else if (cal.term) {
                text = cal.term;
                _className = "term"
            }
            if (!text) text = cal.lunarDayName;
            if (!text) text = "";
            var dom_str1 = "<div class='day'>" + cal.day + "</div>";
            var dom_str2 = "<div class='" + _className + " down_line'>" + text + "</div>";
            calDOM.innerHTML = dom_str1 + dom_str2;
        }
    }


})();