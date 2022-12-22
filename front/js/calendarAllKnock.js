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
    );
    this.currentMonth = params.currentMonth;
  }
}

// let allDays = {}
document
  .querySelectorAll('[data-tiny-editor]')
  .forEach(editor =>
    editor.addEventListener('input', e => console.log(e.target.innerHTML))
  );

// create = function (nameClass, params) {
//   let dateName = params.day + '.' + params.month + '.' + params.year
//   if (allDays[dateName]) {
//     return allDays[dateName]
//   }
//   var ret = new nameClass(params)
//   allDays[dateName] = ret
//   return ret
// }

async function getFromDataBase(date, calendAr, firstDay) {
  let noteResponce = await fetch(`/notes?date=${date}`)
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

  this.clickBody = function (e, a) {
    if (a.target.localName === "body" || a.target.localName === "img") this.selectedDate = null
  }

  this.point = []

  let myDate = new Date()
  this.months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ]

  this.nowMonth = myDate.getMonth()
  let nowYear = myDate.getFullYear()
  let nowDay = myDate.getDate()

  this.curM = this.nowMonth

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
        } else {
          className = 'not-current'
        }
        let newDay = new Day({
          day: i,
          month: month,
          year: year,
          currentMonth: className
        })
        // newDay.currentMonth = className
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
    await getFromDataBase('.' + calendAr[firstDay + 1].month + '.' + calendAr[firstDay + 1].year, calendAr, firstDay)
    this.days = []
    this.days = listToMatrix(calendAr, 7)
    calendAr = []
    return this.days
  }

  this.scrollWrapper = $('.scrollWrapper')[0]

  let finger = window.innerWidth > 500 ? false : true

  preOrNextMonth = async function (dir) {
    m_cal.curM = m_cal.curM + dir
    if (m_cal.curM >= m_cal.threeMonth.length - 2) {
      for (let i = 1; i < 3; i++) {
        let data = await nextMonth(+1)
        m_cal.threeMonth.push(data)
      }
    }
    $(".calendarNum" + m_cal.curM)[0].scrollIntoView({
      inline: "center",
      behavior: "smooth"
    });
    $('.months').val(m_cal.threeMonth[m_cal.curM][1][0].month)
    $('.years').val(m_cal.threeMonth[m_cal.curM][1][0].year)
    m_cal.nowMonthStr = m_cal.months[m_cal.threeMonth[m_cal.curM][1][0].month] + ' ' + m_cal.threeMonth[m_cal.curM][1][0].year
  }

  let nomber = 1

  let debounceScroll = debounce(() => {
    if (nomber % 2 === 0) scrollToMonth()
    nomber++
  }, 400);

  this.scrollWrapper.addEventListener('scroll', () => {
    if (finger) {
      scrollMonth()
      debounceScroll()
    }
  })

  function debounce(f, t) {
    return function (args) {
      let previousCall = this.lastCall;
      this.lastCall = Date.now();
      if (previousCall && ((this.lastCall - previousCall) <= t)) {
        clearTimeout(this.lastCallTimer);
      }
      this.lastCallTimer = setTimeout(() => f(args), t);
    }
  }

  this.month = 0

  scrollMonth = async function () {
    m_cal.nowScrollPosition = m_cal.scrollWrapper.scrollLeft
    m_cal.month = Math.floor(m_cal.nowScrollPosition / $(".calendarNum" + m_cal.curM)[0].offsetWidth)
    if (m_cal.month > m_cal.threeMonth.length - 2) {
      for (let i = 1; i < 5; i++) {
        let data = await nextMonth(1)
        m_cal.threeMonth.push(data)
      }
    }
    // m_cal.month = Math.floor(m_cal.nowScrollPosition / (window.innerWidth * 81 / 100))
    if (m_cal.month >= 40) {
      m_cal.month = m_cal.month - 1
    }
    m_cal.nowMonthStr = m_cal.months[m_cal.threeMonth[m_cal.month][1][0].month] + ' ' + m_cal.threeMonth[m_cal.month][1][0].year

    $('.months').val(m_cal.threeMonth[m_cal.month][1][0].month)
    $('.years').val(m_cal.threeMonth[m_cal.month][1][0].year)
    m_cal.monthSelect = m_cal.threeMonth[m_cal.month][1][0].month
    m_cal.yearSelect = m_cal.threeMonth[m_cal.month][1][0].year
  }

  scrollToMonth = function () {
    $(".calendarNum" + m_cal.month)[0].scrollIntoView({
      inline: 'center',
      behavior: 'smooth',
    });
  }

  dateCounter = function (month) {
    var monthNorm = month
    if (month > 11) {
      monthNorm = monthNorm % 12;
      if (monthNorm === 0) {
        calY++
      }
    }
    calM = monthNorm
    return monthNorm
  }

  // Переход к следующему или предыдущему месяцу
  nextMonth = async function (dir) {
    dateCounter(calM + dir)
    var nextM = calM
    var nextY = calY
    return await m_cal.calculate(nextY, nextM)
  }

  start = async function () {
    calM = -1
    calY = nowYear
    for (let i = -1; i <= 14; i++) {
      if (i === this.nowMonth) {
        let data = await m_cal.calculate(nowYear, m_cal.nowMonth)
        m_cal.threeMonth.push(data)
      } else {
        let data = await nextMonth(1)
        m_cal.threeMonth.push(data)
      }
    }
    m_cal.nowMonthStr = m_cal.months[m_cal.nowMonth] + ' ' + nowYear
  }

  window.onload = async function () {
    // Показать текущий месяц
    await start()
    $(".calendarNum" + (m_cal.nowMonth))[0].scrollIntoView({
      inline: "center",
      behavior: "auto"
    })
  }

  // Выпадашки
  this.monthSelect = this.nowMonth
  this.yearSelect = nowYear

  this.daysOfWeek = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"]

  this.monthsSelect = {
    options: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ],
    selectedOptionValue: this.nowMonth,
  }
  document.querySelector("select.months").addEventListener('change', async function (e) {
    m_cal.monthSelect = Number(e.target.value)
    m_cal.curM = m_cal.monthSelect + 12 * (m_cal.yearSelect - nowYear)
    m_cal.month = m_cal.monthSelect + 12 * (m_cal.yearSelect - nowYear)
    if (m_cal.curM > m_cal.threeMonth.length - 1) {
      for (let i = m_cal.threeMonth.length - 1; i < m_cal.curM + 3; i++) {
        let data = await nextMonth(+1)
        m_cal.threeMonth.push(data)
      }
    }
    $(".calendarNum" + m_cal.curM)[0].scrollIntoView({
      inline: "center",
      behavior: "smooth"
    })
    m_cal.nowMonthStr = m_cal.months[m_cal.threeMonth[m_cal.curM][1][0].month] + ' ' + m_cal.threeMonth[m_cal.curM][1][0].year
  })

  this.yearsSelect = {
    options: ["2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"],
    selectedOptionValue: nowYear,
  }

  // "2015", "2016", "2017", "2018", "2019", "2020", "2021",

  document.querySelector("select.years").addEventListener('change', async function (e) {
    m_cal.yearSelect = Number(e.target.value)
    m_cal.curM = m_cal.monthSelect + 12 * (m_cal.yearSelect - nowYear)
    m_cal.month = m_cal.monthSelect + 12 * (m_cal.yearSelect - nowYear)
    if (m_cal.curM > m_cal.threeMonth.length - 1) {
      for (let i = m_cal.threeMonth.length - 1; i < m_cal.curM + 3; i++) {
        let data = await nextMonth(+1)
        m_cal.threeMonth.push(data)
      }
    }
    $(".calendarNum" + m_cal.curM)[0].scrollIntoView({
      inline: "center",
      behavior: "smooth"
    })
    m_cal.nowMonthStr = m_cal.months[m_cal.threeMonth[m_cal.curM][1][0].month] + ' ' + m_cal.threeMonth[m_cal.curM][1][0].year
  })

  ko.track(this)
}

ko.applyBindings(m_cal)