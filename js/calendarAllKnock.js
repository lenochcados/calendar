// m_cal={a:10}
// class m_cal{a:11}

class Day {
  constructor(params) {
    this.day = params.day;
    this.month = params.month;
    this.year = params.year;
    this.note = params.note;
    ko.track(this)
    ko.getObservable(this, 'note').subscribe(note =>
      localStorage.setItem('note' + '_' + this.day + '.' + this.month + '.' + this.year, note)
    );
    this.currentMonth = params.currentMonth;
  }

  getFromLocalStorage() {
    if (localStorage.getItem('note' + '_' + this.day + '.' + this.month + '.' + this.year)) {
      this.note = localStorage.getItem('note' + '_' + this.day + '.' + this.month + '.' + this.year);
    } else {
      localStorage.removeItem('note' + '_' + this.day + '.' + this.month + '.' + this.year);
    }
  }
}

let allDays = []

create = function (className, params) {
  let dateName = params.day + '.' + params.month + '.' + params.year
  if (allDays[dateName]) {
    return allDays[dateName]
  }
  var ret = new className(params)
  allDays[dateName] = ret
  return ret
}

m_cal = new function () {
  this.nowMonthStr = ''
  this.days = []
  this.selectedDate={}
  // localStorage.clear();
  this.clickBody = function (e, a) {
    if (a.target.localName === "body") this.selectedDate = null
  }
  let myDate = new Date()
  let months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ]

  let nowMonth = myDate.getMonth()
  let nowYear = myDate.getFullYear()
  let nowDay = myDate.getDate()

  let calY
  let calM
  let calendAr = []

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

  this.calculate = function (y, m) {
    calY = y
    calM = m
    let daysInNowMonth = new Date(y, m).daysInMonth()
    let daysInMonth
    m_cal.nowMonthStr = months[m] + ' ' + y
    // Последний день недели в месяце 
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
        if (i === nowDay && nowMonth === m && nowYear === y && j === 0) {
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
        newDay.getFromLocalStorage()
        calendAr.push(newDay)
      }
    }
    // Первый день недели в месяце 
    let firstDay = new Date(y, m, 0).getDay()
    firstDay = getDate(firstDay)
    // Последний день предыдущего месяца
    let lastDayOfLastMonth = new Date(year, month, 0).getDate()
    let finalDay = new Date(y, m, daysInNowMonth).getDay()
    finalDay = getDate(finalDay)
    let beginSlice = lastDayOfLastMonth - firstDay - 1
    let endSlice = beginSlice + daysInNowMonth + firstDay + 7 - finalDay
    if (firstDay == 6) {
      beginSlice = 0
      endSlice = daysInNowMonth + 6 - finalDay
    }
    calendAr = calendAr.slice(beginSlice, endSlice)
    this.days = []
    this.days = listToMatrix(calendAr, 7)
    calendAr = []
  }

  // Переход к следующему или предыдущему месяцу
  nextMonth = function (dir) {
    var nextM = calM + 1 * dir
    var nextY = calY
    if (nextM > 11) {
      nextM = 0;
      nextY = calY + 1
    }
    if (nextM < 0) {
      nextM = 11;
      nextY = calY - 1
    }
    m_cal.calculate(nextY, nextM)
  }

  window.onload = function () {
    // Показать текущий месяц
    m_cal.calculate(nowYear, nowMonth)
  }

  this.remove = function removeAllChild(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild)
    }
  }

  // Выпадашки
  let monthSelect = nowMonth
  let yearSelect = nowYear

  this.daysOfWeek = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"]

  this.monthsSelect = {
    options: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ],
    selectedOptionValue: nowMonth,
  }
  // ko.track(this.monthsSelect)
  document.querySelector("select.months").addEventListener('change', function (e) {
    monthSelect = Number(e.target.value)
    m_cal.calculate(yearSelect, monthSelect)
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