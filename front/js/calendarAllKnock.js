// m_cal={a:10}
// class m_cal{a:11}
// let date
class Day {
  constructor(params) {
    this.day = params.day;
    this.month = params.month;
    this.year = params.year;
    this.note = params.note;
    ko.track(this)
    ko.getObservable(this, 'note').extend({
      rateLimit: {
        timeout: 700,
        method: "notifyWhenChangesStop"
      }
    }).subscribe(note =>
      fetch('http://vm-67c21157.na4u.ru/calc', {
        method: "POST",
        body: JSON.stringify({
          date: this.day + '.' + this.month + '.' + this.year,
          note: this.note
        }),
      })
      // localStorage.setItem('note' + '_' + this.day + '.' + this.month + '.' + this.year, note)
    );
    this.currentMonth = params.currentMonth;
  }

  //   if (localStorage.getItem('note' + '_' + this.day + '.' + this.month + '.' + this.year)) {
  //     this.note = localStorage.getItem('note' + '_' + this.day + '.' + this.month + '.' + this.year);
  //   } else {
  //     localStorage.removeItem('note' + '_' + this.day + '.' + this.month + '.' + this.year);
  // }
  // notes(){
}

let allDays = {}


create = function (className, params) {
  let dateName = params.day + '.' + params.month + '.' + params.year
  if (allDays[dateName]) {
    return allDays[dateName]
  }
  var ret = new className(params)
  allDays[dateName] = ret
  return ret
}

async function getFromDataBase(date, calendAr, firstDay) {
  let noteResponce = await fetch(`/notes?date=${date}`)
  // for (i = 1; i < daysInMonth + 1; i++) {
  if (noteResponce.ok) {
    let json = await noteResponce.json()
    if (json.length !== 0) {
      for (data of json) {
        let day = Number(data.date.split('.')[0])
        let noteDay = firstDay + day
        calendAr[noteDay].note = data.notes
      }
    }
  } else {
    console.log("Ошибка HTTP: " + noteResponce.status)
  }
}

let lastKnownScrollPosition = 0;
let ticking = false;

m_cal = new function () {
  this.nowMonthStr = ''
  this.days = []
  this.threeMonth = []
  this.selectedDate = {}
  let calendAr = []
  ko.track(this.threeMonth)

  this.clickBody = function (e, a) {
    if (a.target.localName === "body") this.selectedDate = null
  }

  this.point = []

  // this.swipe = function (some, e) {
  //   this.point.push(e.originalEvent.changedTouches[0].clientX)
  //   if (this.point.length === 2) {
  //     let dir = (this.point[1] - this.point[0] > 0) ? -1 : +1
  //     preOrNextMonth(dir)
  //     this.point = []
  //   }
  // }

  let myDate = new Date()
  this.months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ]

  this.nowMonth = myDate.getMonth()
  let nowYear = myDate.getFullYear()
  let nowDay = myDate.getDate()

  this.curM = this.nowMonth - 1

  let calY
  let calM

  function listToMatrix(list, elementsPerSubArray) {
    var matrix = [],
      i, k;
    for (i = 0, k = -1; i < list.length; i++) {
      if (i % elementsPerSubArray === 0) {
        k++;
        matrix[k] = [];
      }
      matrix[k].push(list[i]);
    }
    return matrix;
  }

  Date.prototype.daysInMonth = function () {
    return 32 - new Date(this.getFullYear(), this.getMonth(), 32).getDate()
  }

  function getDate(numberOfDay) {
    if (numberOfDay == 0) numberOfDay = 7
    return --numberOfDay
  }

  // async

  this.calculate = async function (y, m) {
    calY = y
    calM = m
    // console.log('month', m)
    let daysInNowMonth = new Date(y, m).daysInMonth()
    let daysInMonth

    // months[m_cal.threeMonth[1][1][0].month] + ' ' + m_cal.threeMonth[1][1][0].year
    let className
    let month
    let year
    for (var j = -1; j <= 1; ++j) {
      month = m + j
      year = y
      if (month > 11) {
        month = 0;
        year = y + 1;
      } else if (month < 0) {
        month = 11;
        year = y - 1;
      }
      daysInMonth = new Date(year, month).daysInMonth()
      for (i = 1; i < daysInMonth + 1; i++) {
        if (i === nowDay && m_cal.nowMonth === m && nowYear === y && j === 0) {
          className = "nowDay"
        } else if (j === 0) {
          className = 'current'
        } else className = 'not-current';
        let newDay = create(Day, {
          day: i,
          month: month,
          year: year,
        })
        newDay.currentMonth = className
        calendAr.push(newDay)
      }
    }

    // Последний день предыдущего месяца
    let lastDayOfLastMonth = new Date(year, month - 1, 0).getDate()
    // Первый день недели в месяце 
    let firstDay = new Date(y, m, 0).getDay()
    firstDay = getDate(firstDay)
    let finalDay = new Date(y, m, daysInNowMonth).getDay()
    finalDay = getDate(finalDay)
    let beginSlice = lastDayOfLastMonth - firstDay - 1
    let endSlice = beginSlice + daysInNowMonth + firstDay + 7 - finalDay
    if (firstDay == 6) {
      beginSlice = lastDayOfLastMonth
      endSlice = beginSlice + daysInNowMonth + 6 - finalDay
    }
    calendAr = calendAr.slice(beginSlice, endSlice)
    // await getFromDataBase('.' + calendAr[firstDay + 1].month + '.' + calendAr[firstDay + 1].year, calendAr, firstDay)
    this.days = []
    this.days = listToMatrix(calendAr, 7)
    calendAr = []
    // this.threeMonth.push(this.days)
    // if (this.threeMonth.length < 3) {
    //   dir = +1
    //   nextMonth(dir)
    // }else {m--}
    return this.days
  }

  let scroll = $('.scrollWrapper')[0]

  preOrNextMonth = async function (dir) {
    // let month = m_cal.threeMonth[0][1][0].month
    m_cal.curM = m_cal.curM + dir
    scroll.scrollTo({
      left: $(".calendarNum" + m_cal.curM)[0].offsetLeft - 19,
      behavior: 'smooth'
    });
    m_cal.nowMonthStr = m_cal.months[m_cal.curM + 1] + ' ' + nowYear
    return $(".calendarNum" + m_cal.curM)[0].offsetLeft - 19
  }

  let startTime, startScroll, waitForScrollEvent;
  scroll.addEventListener('touchstart', function () {
    waitForScrollEvent = false;
  });

  scroll.addEventListener('touchend', function () {
    //   var deltaTime = new Date().getTime() - startTime;
    //   var deltaScroll = Math.abs(startScroll - scroll.scrollLeft);
    //   if (deltaScroll / deltaTime > 0.25 ||
    //     scroll.scrollLeft < 0 ||
    //     scroll.scrollLeft > scroll.weight) {
    //     // will cause momentum scroll, wait for 'scroll' event
    //     waitForScrollEvent = true;
    //   }
    //   // else {
    //   // //   onScrollCompleted(); // assume no momentum scroll was initiated
    //   // }
    let next = lastKnownScrollPosition - $(".calendarNum" + (m_cal.curM - 1))[0].offsetLeft
    let pre = $(".calendarNum" + (m_cal.curM + 1))[0].offsetLeft - lastKnownScrollPosition
    let dir = next < pre ? -1 : 1
    lastKnownScrollPosition = preOrNextMonth(dir)
    startTime = 0;

  })

// С таймером

  // let timer;
  // scroll.addEventListener('scroll', function (e) {
  //   if (timer) {
  //     clearTimeout(timer);
  //   }
  //   timer = setTimeout(function () {
  //     $(this).trigger('scrollFinished');
  //   }, 55)
  // })

  // scroll.addEventListener('scrollFinished', function () {
  //   // will be called when momentum scroll is finished
  //   let lastKnownScrollPosition = scroll.scrollLeft;
  //   console.log(lastKnownScrollPosition)
  //   let next = lastKnownScrollPosition - $(".calendarNum" + (m_cal.curM - 1))[0].offsetLeft
  //   let pre = $(".calendarNum" + (m_cal.curM + 1))[0].offsetLeft - lastKnownScrollPosition
  //   let dir = next > pre ? -1 : 1
  //   lastKnownScrollPosition = preOrNextMonth(dir)
  // })

  scroll.addEventListener('scroll', (e) => {
    //   if (waitForScrollEvent) {
        //   let next = lastKnownScrollPosition - $(".calendarNum" + (m_cal.curM - 1))[0].offsetLeft
        //   let pre = $(".calendarNum" + (m_cal.curM + 1))[0].offsetLeft - lastKnownScrollPosition
        //   let dir = next > pre ? -1 : 1
        //   lastKnownScrollPosition = preOrNextMonth(dir)
        lastKnownScrollPosition = scroll.scrollLeft;
    //   }
    // let dir = (lastKnownScrollPosition > scroll.scrollLeft) ? -1 : 1
    // preOrNextMonth(dir)

      // console.log(lastKnownScrollPosition)
      // if (!ticking) {
      //   scroll.requestAnimationFrame(() => {
      //     // console.log(lastKnownScrollPosition)
      //     if()
      //     preOrNextMonth(lastKnownScrollPosition);
      //     ticking = false;
      //   });
      //   ticking = true;
      // }
  });


  // Переход к следующему или предыдущему месяцу
  nextMonth = function (dir) {
    var nextM = calM + dir
    var nextY = calY
    if (nextM > 11) {
      nextM = 0;
      nextY = calY + 1
    }
    if (nextM < 0) {
      nextM = 11;
      nextY = calY - 1
    }
    return m_cal.calculate(nextY, nextM)
  }



  start = async function () {
    calM = 0
    calY = nowYear
    for (let i = 0; i <= 10; i++) {
      if (i === this.nowMonth) {
        let data = await m_cal.calculate(nowYear, m_cal.nowMonth)
        m_cal.threeMonth.push(data)
      } else {
        let data = await nextMonth(+1)
        m_cal.threeMonth.push(data)
      }
    }
    // await m_cal.calculate(nowYear, nowMonth)
    m_cal.nowMonthStr = m_cal.months[m_cal.nowMonth] + ' ' + nowYear
    // console.log("start")
  }

  // initialScroll = function () {
  //   $(".scrollWrapper")[0].scrollTo({
  //     left: $(".calendarNum0").width() - 26,
  //     behavior: 'smooth'
  //   });
  //   console.log("initialScroll")
  // }

  window.onload = async function () {
    // Показать текущий месяц
    await start()
    $(".scrollWrapper")[0].scrollTo({
      left: $(".calendarNum" + (m_cal.nowMonth - 1))[0].offsetLeft - 19,
      // $(".calendarNum" + (m_cal.nowMonth-1)).offset().left - 153,
      behavior: 'auto'
    });
    // console.log("onload")
  }

  this.remove = function removeAllChild(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild)
    }
  }

  // Выпадашки
  let monthSelect = this.nowMonth
  let yearSelect = nowYear

  this.daysOfWeek = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"]

  this.monthsSelect = {
    options: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ],
    selectedOptionValue: this.curM + 1,
  }
  document.querySelector("select.months").addEventListener('change', function (e) {
    monthSelect = Number(e.target.value)
    this.curM = monthSelect
    scroll.scrollTo({
      left: $(".calendarNum" + (monthSelect - 1))[0].offsetLeft - 19,
      behavior: 'smooth'
    });
    m_cal.nowMonthStr = m_cal.months[monthSelect] + ' ' + nowYear
    // m_cal.calculate(yearSelect, monthSelect)
  })

  this.yearsSelect = {
    options: ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"],
    selectedOptionValue: nowYear,
  }

  document.querySelector("select.years").addEventListener('change', function (e) {
    yearSelect = Number(e.target.value)
    m_cal.calculate(yearSelect, monthSelect)
  })
  ko.track(this)
}

ko.applyBindings(m_cal)