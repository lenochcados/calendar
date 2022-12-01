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

  this.nowScrollPosition = 0

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

    let daysInNowMonth = new Date(y, m).daysInMonth()
    let daysInMonth

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
    return this.days
  }

  let scrollWrapper = $('.scrollWrapper')[0]

  let finger = true
  let scrollIntoView = false

  preOrNextMonth = async function (dir) {
    // let month = m_cal.threeMonth[0][1][0].month
    m_cal.curM = m_cal.curM + dir;
    $(".calendarNum" + m_cal.curM)[0].scrollIntoView({
      inline: "center",
      behavior: "smooth"
    });
    m_cal.nowMonthStr = m_cal.months[m_cal.curM + 1] + ' ' + calY
    console.log(m_cal.nowMonthStr)
    finger = true
    scrollIntoView = true
    return $(".calendarNum" + m_cal.curM)[0].offsetLeft
  }

  // function scrollStop(callback, refresh = 66) {
  //   // Make sure a valid callback was provided
  //   if (!callback || typeof callback !== 'function') return;
  //   // Setup scrolling variable
  //   let isScrolling;
  //   // Listen for scroll events
  //   scrollWrapper.addEventListener('scroll', function (event) {
  //     // Clear our timeout throughout the scroll
  //     console.log('scroll')
  //     window.clearTimeout(isScrolling);
  //     // Set a timeout to run after scrolling ends
  //     isScrolling = debounce(setTimeout(callback, refresh), 1500);
  //   });
  // }

  const debounceScroll = debounce(() => {
    if (!scrollIntoView) {
      scrollToMonth(scrollWrapper.scrollLeft);
    } else {
      scrollIntoView = false
    }
  }, 300);

  scrollWrapper.addEventListener('scroll', function () {
    debounceScroll()
    scrollMonth()
    // if (!scrollIntoView) {
    //   scrollToMonth(scrollWrapper.scrollLeft);
    // } else {
    //   scrollIntoView = false
    // }
  })

  function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
      const context = this;
      const args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  // scrollStop(function () {
  //   if (finger) {
  //     scrollToMonth(scrollWrapper.scrollLeft)
  //     finger = false;
  //   }
  //   finger = true
  // });
  this.month = 0

  scrollMonth = async function () {
    m_cal.nowScrollPosition = scrollWrapper.scrollLeft
    m_cal.month = parseInt(m_cal.nowScrollPosition / parseInt(window.innerWidth * Math.pow(0.9, 2)))
    m_cal.nowMonthStr = m_cal.months[dateCounter(m_cal.month + 1)] + ' ' + m_cal.threeMonth[m_cal.month][1][0].year
    if (m_cal.month >= m_cal.threeMonth.length - 3) {
      for (let i = 1; i < 5; i++) {
        let data = await nextMonth(+1)
        m_cal.threeMonth.push(data)
      }
    }
  }

  scrollToMonth = function () {
    finger = false
    if (!scrollIntoView && !finger) {
      calM = dateCounter(m_cal.month + 1)
      // console.log("scrollToMonth ", month)
      $(".calendarNum" + m_cal.month)[0].scrollIntoView({
        inline: "center",
        behavior: "smooth"
      });
      scrollIntoView = true
    }
  }

  let flag = true

  dateCounter = function (month) {
    var monthNorm = month
    // var yearNorm = calY
    if (monthNorm > 11) {
      monthNorm = monthNorm - 12;
      if (flag) {
        calY = calY + 1
        flag = false
      }
    }
    if (monthNorm < 0) {
      monthNorm = 11;
      calY = calY - 1
    }
    return monthNorm
  }

  // Переход к следующему или предыдущему месяцу
  nextMonth = function (dir) {
    var nextM = dateCounter(calM + dir)
    var nextY = calY
    // if (nextM > 11) {
    //   nextM = 0;
    //   nextY = calY + 1
    // }
    // if (nextM < 0) {
    //   nextM = 11;
    //   nextY = calY - 1
    // }
    // console.log(nextM, nextY)
    return m_cal.calculate(nextY, nextM)
  }

  start = async function () {
    calM = 0
    calY = nowYear
    for (let i = 0; i <= 15; i++) {
      if (i === this.nowMonth) {
        let data = await m_cal.calculate(nowYear, m_cal.nowMonth)
        m_cal.threeMonth.push(data)
      } else {
        let data = await nextMonth(+1)
        m_cal.threeMonth.push(data)
      }
    }
    m_cal.nowMonthStr = m_cal.months[m_cal.nowMonth] + ' ' + nowYear
  }

  window.onload = async function () {
    // Показать текущий месяц
    await start()
    scrollIntoView = true
    $(".calendarNum" + (m_cal.nowMonth - 1))[0].scrollIntoView({
      inline: "center",
      behavior: "auto"
    })

    // scrollWrapper.scrollTo({
    //   left: $(".calendarNum" + (m_cal.nowMonth - 1))[0].offsetLeft - 19,
    //   // $(".calendarNum" + (m_cal.nowMonth-1)).offset().left - 153,
    //   behavior: 'auto'
    // });
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
    $(".calendarNum" + (monthSelect - 1))[0].scrollIntoView({
      inline: "center",
      behavior: "smooth"
    })
    m_cal.nowMonthStr = m_cal.months[monthSelect] + ' ' + yearSelect
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


// let startTime, startScroll, waitForScrollEvent;
// scrollWrapper.addEventListener('touchstart', function () {
//   waitForScrollEvent = false;
// });

// scrollWrapper.addEventListener('touchend', (e) => {
//   waitForScrollEvent = true;
//   let next = lastKnownScrollPosition - $(".calendarNum" + (m_cal.curM - 1))[0].offsetLeft
//   let pre = $(".calendarNum" + (m_cal.curM + 1))[0].offsetLeft - lastKnownScrollPosition
//   // let dir = (lastKnownScrollPosition > scrollWrapper.scrollLeft) ? -1 : 1
//   let dir = next < pre ? -1 : 1
//   preOrNextMonth(dir)
// })

// // С таймером

// let timer;
// scrollWrapper.addEventListener('scroll', function (e) {
//   if (timer) {
//     clearTimeout(timer);
//   }
//   timer = setTimeout(function () {
//     let next = lastKnownScrollPosition - $(".calendarNum" + (m_cal.curM - 1))[0].offsetLeft
//     let pre = $(".calendarNum" + (m_cal.curM + 1))[0].offsetLeft - lastKnownScrollPosition
//     // let dir = (lastKnownScrollPosition > scrollWrapper.scrollLeft) ? -1 : 1
//     let dir = next < pre ? -1 : 1
//     preOrNextMonth(dir)
//   }, 255)
// })