/**
 * Created by jerry on 16/4/11.
 */

;(function () {
    'use strict';

    var ONE_DAY = 86400000;//一天的时间间隔
    var dateCache = {};//存储计算过的日期,键 "yyyy-mm-dd" 值:完整对象{}

    var termCache = {};//节气缓存

    /**
     * 农历1900-2100的润大小信息表
     * @Array Of Property
     * @return Hex
     */
    var lunarInfo = [0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,//1900-1909
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,//1910-1919
        0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,//1920-1929
        0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,//1930-1939
        0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,//1940-1949
        0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,//1950-1959
        0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,//1960-1969
        0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,//1970-1979
        0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,//1980-1989
        0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,//1990-1999
        0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,//2000-2009
        0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,//2010-2019
        0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,//2020-2029
        0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,//2030-2039
        0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,//2040-2049
        0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,//2050-2059
        0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,//2060-2069
        0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,//2070-2079
        0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,//2080-2089
        0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,//2090-2099
        0x0d520];//2100

    var Animals = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
    /**
     * 字典对象 公历节假日
     */
    var solarFestival = {
        '0101': '元旦节',
        '0202': '世界湿地日',
        '0210': '国际气象节',
        '0214': '情人节',
        '0308': '妇女节',
        '0312': '植树节',
        '0314': '国际警察日',
        '0315': '消费者权益日',
        '0317': '国际航海日',
        '0321': '世界森林日',
        '0322': '世界水日',
        '0323': '世界气象日',
        '0401': '愚人节',
        '0407': '世界卫生日',
        '0422': '世界地球日',
        '0423': '世界图书和版权日',
        '0501': '劳动节',
        '0504': '青年节',
        '0508': '世界红十字日',
        '0517': '世界电信日',
        '0523': '国际牛奶日',
        '0531': '世界无烟日',
        '0601': '国际儿童节',
        '0605': '世界环境日',
        '0606': '全国爱眼日',
        '0701': '中共诞辰',
        '0707': '抗日战争纪念日',
        '0801': '建军节',
        '0815': '抗日战争胜利纪念',
        '0908': '国际扫盲日',
        '0910': '教师节',
        '0914': '世界清洁地球日',
        '0918': '九一八事变纪念日',
        '0920': '国际爱牙日',
        '1001': '国庆节',
        '1006': '老人节',
        '1010': '辛亥革命纪念日',
        '1015': '国际盲人节',
        '1016': '世界粮食日',
        '1017': '世界消除贫困日',
        '1022': '世界传统医药日',
        '1024': '联合国日',
        '1110': '世界青年节',
        '1114': '世界糖尿病日',
        '1117': '国际大学生节',
        '1201': '世界艾滋病日',
        '1203': '世界残疾人日',
        '1209': '世界足球日',
        '1210': '世界人权日',
        '1212': '西安事变纪念日',
        '1213': '南京大屠杀',
        '1220': '澳门回归纪念',
        '1224': '平安夜',
        '1225': '圣诞节'
    };

    /**
     * 字典对象农历节日
     * */
    var lunarFestival = {
        '0101': '春节',
        '0115': '元宵节',
        '0202': '龙抬头节',
        '0505': '端午节',
        '0707': '七夕情人节',
        '0715': '中元节',
        '0815': '中秋节',
        '0909': '重阳节',
        '1015': '下元节',
        '1208': '腊八节',
        '1223': '小年',
        '0100': '除夕'
    };


    var solarTerm = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至']; //二十四节气
    var week = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    /**
     * * 二十四节气数据，节气点时间（单位是分钟）
     * 从0小寒起算
     */
    var termInfo = [0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758];
    var luMonth = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
    var luDay = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十', '卅一'];

    /**
     * 判断y年的农历中个月是闰月,不是闰月返回0
     * @param year 农历年
     * @returns {number}
     */
    function getLeapMonth(year) {
        return (lunarInfo[year - 1900] & 0xf);
    }

    /**
     * 返回农历y年闰月的天数 若该年没有闰月则返回0
     * @param year 农历年
     * @return Number (0、29、30)
     *
     */
    function leapDays(year) {
        if (getLeapMonth(year)) {
            return ((lunarInfo[year - 1900] & 0x10000) ? 30 : 29);
        }
        else {
            return 0
        }
    }

    /**
     * 返回农历y年m月（非闰月）的总天数，计算m为闰月时的天数请使用leapDays方法
     * @param year 农历年
     * @param month 农历月
     * @return Number
     */
    function getLunarMonthDays(year, month) {
        return ((lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29);
    }


    /**
     * 返回农历y年一整年的总天数
     * @param year 农历年
     * @return Number
     */
    function getLunarYearDays(year) {
        var i, sum = 348;
        for (i = 0x8000; i > 0x8; i >>= 1)sum += (lunarInfo[year - 1900] & i) ? 1 : 0;
        return (sum + leapDays(year));
    }


    /**
     * 某年的第n个节气为几日
     * 31556925974.7为地球公转周期，是毫秒
     * 1900年的正小寒点1890年为基准点
     * @param {Number} year 公历年
     * @param {Number} n 第几个节气，从0小寒起算  取值0-23
     * 由于农历24节气交节时刻采用近似算法，可能存在少量误差(30分钟内)
     * @returns {number}
     */

    function getTerm(year, n) {
        var offDate = new Date(( 31556925974.7 * (year - 1890) + termInfo[n] * 60000  ) + Date.UTC(1890, 0, 5, 16, 2, 31));
        return (offDate.getUTCDate())
    }


    /**
     * 获取公历年一年的二十四节气
     * 返回key:日期，value:节气中文名
     */
    function getYearTerm(year) {
        var res = termCache[year];
        if (!res) {
            res = {};
            var month = 0;
            for (var i = 0; i < 24; i++) {
                var day = getTerm(year, i);
                if (i % 2 == 0)month++;//24节气每个月两个
                res[formatMD(month, day)] = solarTerm[i];
            }
        }
        termCache[year] = res;
        return res;
    }


    /**
     * 返回
     * @param year
     * @param month
     * @param day
     * @returns {Date}返回对象
     */
    function formatDate(year, month, day) {
        year = year - 0;
        day = (day - 0) || 1;
        month = month - 0;
        return new Date(year, month - 1, day);
    }

    /**
     * 获取相隔几天的日期
     * @param baseDate
     * @param interval
     */
    function getDayNearBy(baseDate, interval) {

        var newDate;
        if (interval < 0) {
            newDate = new Date(baseDate - Math.abs(interval * ONE_DAY));
        } else {
            newDate = new Date(baseDate.getTime() + Math.abs(interval * ONE_DAY));
        }
        return newDate;
    }


    /**
     * 转成 yyyy-mm-dd
     * @param date
     * @returns {string}
     */
    function dateToString(date) {
        var _year = date.getFullYear();
        var _month = date.getMonth() + 1;
        _month = _month < 10 ? "0" + _month : _month;
        var _day = date.getDate();
        _day = _day < 10 ? "0" + _day : _day;
        return (_year + "-" + _month + "-" + _day);
    }


    /**
     * 返回
     * @param month
     * @param day
     * @returns {*}
     */
    function formatMD(month, day) {
        month = month < 10 ? "0" + month : "" + month;
        day = day < 10 ? "0" + day : "" + day;
        return month + day;
    }


    /**
     *
     * @param dateObj
     * @returns {{year: number, month: number, day: number, term: *, date: *, festival: *}}
     */
    function getSolarDay(dateObj) {
        var year = dateObj.getFullYear();
        var month = dateObj.getMonth();
        var day = dateObj.getDate();
        var MD = formatMD(month + 1, day);

        var terms = getYearTerm(year);

        var res = {
            year: dateObj.getFullYear(),
            month: month + 1,
            day: day,
            term: terms[MD],
            date: dateToString(dateObj),//公历日期
            festival: solarFestival[MD]//公历假日
        };
        return res;
    }


    /**
     *  通过日期对象返回农历时间
     * @param dateObj
     * @returns {{year: number, month: number, day: number, isLeap: boolean, monthName: (string|*), dayName: (string|*)}}
     */
    function getLunarDate(dateObj) {
        var baseDate = new Date(1900, 0, 31);
        var offset = (dateObj - baseDate) / ONE_DAY;//偏移总天数
        var temp = 0;
        for (var i = 1900; i < 2101 && offset > 0; i++) {
            temp = getLunarYearDays(i);
            offset -= temp;//从 1900/1/31(农历正月初一)开始通过减去每年的天数(阳历时间间隔)查出农历年
        }
        if (offset < 0) {
            offset += temp;//回退一年
            i--;
        }
        var year = i;//农历年
        var leap = getLeapMonth(year);//闰哪个月
        var isLeap = false;//默认非闰月
        for (var i = 1; i <= 12 && offset > 0; i++) {
            if (leap > 0 && i == leap + 1 && isLeap == false) {//当前月是闰月(多出来的一个月)
                i--;//增加一个月
                isLeap = true;
                temp = leapDays(year);//农历闰月天数
            } else {
                temp = getLunarMonthDays(year, i);//农历普通月份天数
            }
            if (isLeap && i == leap + 1) {
                isLeap = false;//恢复
            }
            offset -= temp;//减去每月天数
        }

        if (offset == 0 && leap > 0 && i == leap + 1) {//恰好
            if (isLeap) {
                isLeap = false;
            } else {
                i--;
                isLeap = true;
            }
        }

        if (offset < 0) {
            offset += temp;//跳回
            i--;
        }
        var month = i;
        var day = Math.floor(offset + 1);
        var monthName, dayName;
        monthName = luMonth[i - 1] + "月";
        dayName = luDay[day - 1];
        if (isLeap) {
            monthName = "闰" + monthName;
        }
        var MD = formatMD(month, day);

        return {
            year: year,
            month: month,
            day: day,
            isLeap: isLeap,
            monthName: monthName,
            dayName: dayName,
            festival: lunarFestival[MD]
        }
    }


    /**
     * 返回生肖
     * @param year
     * @returns {string}
     */
    function getAnimal(year) {
        return Animals[(year - 4) % 12];
    }


    /**
     *
     * @param dateObj
     * @returns {*}
     */
    function getCompleteObj(dateObj) {
        var _dateStr = dateToString(dateObj);
        var res = dateCache[_dateStr];//缓存
        if (!res) {
            var lunarDate = getLunarDate(dateObj);
            var solarDate = getSolarDay(dateObj);
            var isToday = _dateStr == dateToString(new Date());
            res = {
                date: dateObj,//日期对象
                dateStr: _dateStr,
                year: solarDate.year,//公历
                month: solarDate.month,
                day: solarDate.day,
                lunarYear: lunarDate.year,//农历
                lunarMonth: lunarDate.month,
                lunarDay: lunarDate.day,
                lunarMonthName: lunarDate.monthName,//农历月份名称
                lunarDayName: lunarDate.dayName,//农历天名称
                isLeapMonth: lunarDate.isLeap,//是否闰月
                term: solarDate.term,//节气
                solarFestival: solarDate.festival,//公历节日
                lunarFestival: lunarDate.festival,//农历节日
                isToday: isToday,//是否是今天,
                weekDay: week[dateObj.getDay()]
            };
            dateCache[_dateStr] = res;
        }
        return res
    }


    /**
     *
     * @param year
     * @param month
     * @returns {{}} currentMonth记录当前月份   animal:生肖  date[]:数据
     */
    function getCurrentMonth(year, month) {
        var res = {};
        res.animal = getAnimal(year);
        res.currentMonth = month;//记录当前月
        res.data = [];
        var _begin = formatDate(year, month);
        var _cur = _begin;
        var _tmp_dates = [];//存储日期对象,用于构造完整对象
        var _offset = _begin.getDay();
        if (_offset != 0) {
            var _pre = getDayNearBy(_begin, 0 - _begin.getDay());
        }
        while (_begin.getMonth() + 1 == month) {
            _tmp_dates.push(_begin);
            _begin = getDayNearBy(_begin, 1);
        }
        if (_pre) {
            for (var _m = 0; _m < _offset; _m++) {
                _cur = getDayNearBy(_cur, -1);
                _tmp_dates.unshift(_cur)
            }
        }
        while (_tmp_dates.length < 42) {//填充下个月的数据
            _tmp_dates.push(_begin);
            _begin = getDayNearBy(_begin, 1);
        }

        for (var i = 0, length = _tmp_dates.length; i < length; i++) {
            res.data.push(getCompleteObj(_tmp_dates[i]));
        }
        return res;
    }

    var calendar = {
        getMonthDays: getCurrentMonth,//传入 年份,月份,返回该月(上下)的
        getLunarDate: getLunarDate,//传入日期对象,返回该日期对应的农历对象
        getSolarDay: getSolarDay,//传入日期对象,返回该日期对象的公历对象
        dateToString: dateToString,//传入日期对象,返回该日期对象的 "yyyy-MM-dd"的表示
        getDateNearBy: getDayNearBy,//传入日期对象,和间隔天数(可正可负),返回间隔的日期对象
        getCompleteDay: getCompleteObj//传入日期对象,返回该日期的所有信息
    };
    //导出 calendar对象
    window.calendar = calendar;
})();