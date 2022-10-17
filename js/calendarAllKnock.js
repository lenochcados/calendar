// m_cal={a:10}
// class m_cal{a:11}

class Day {
  constructor(params) {
    this.day = params.day;
    this.month = params.month;
    this.year = params.year;
    this.note = ko.observable(params.note);
    this.currentMonth = params.class;
  }
}
// document.querySelector("select.months").addEventListener('change', () => {
//   ServiceWorkerRegistration.pushManager.subscribe(options)
//     .then((note) => {
//       localStorage.setItem('note' + '_' + calendAr[].day + '.' + calendAr[].month + '.' + calendAr[].year, calendAr[].note());
//     });
// })

m_cal = new function () {

  this.nowMonthStr = ko.observable("__")
  this.days = ko.observableArray([])
  this.selectedDate = ko.observable()

  // this.note = function (e) {
  //   $(".arrow").hide()
  // }

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



  // let value = ''

  this.calculate = function (y, m) {
    calY = y
    calM = m
    let calendar = document.getElementById(1)
    // Первый день недели в месяце 
    let firstDay = new Date(y, m, 7).getDay()
    // Последний день месяца
    let lastDateOfMonth = new Date(y, m + 1, 0).getDate()
    // Последний день предыдущего месяца
    let lastDayOfLastMonth = m == 0 ? new Date(y - 1, 11, 0).getDate() : new Date(y, m, 0).getDate()
    let numLastDay = new Date(y, m + 1, 0).getDay()
    let daysInMonth = new Date(y, m).daysInMonth()
    let count = 0

    m_cal.nowMonthStr(months[m] + ' ' + y)

    for (i = 1; i < daysInMonth + 1; i++) {
      count++
      //Первая строка календаря
      if (i == 1) {
        let k = lastDayOfLastMonth - firstDay + 1
        for (let j = 0; j < firstDay; j++) {
          calendAr.push(new Day({
            day: k,
            month: calM - 1,
            year: calY,
            class: 'not-current',
          }))
          k++
          count++
          // document.getElementsByClassName("textInput").addEventListener('change', () => {
          //   ServiceWorkerRegistration.pushManager.subscribe(options)
          //     .then((note) => {
          //       localStorage.setItem('note' + '_' + calendAr[j].day + '.' + calendAr[j].month + '.' + calendAr[j].year, calendAr[j].note());
          //     });
          // })
        }
      }

      calendAr.push(new Day({
        day: i,
        month: calM,
        year: calY,
        class: 'current',
      }))
      // document.getElementsByClassName("textInput").addEventListener('change', () => {
      //   ServiceWorkerRegistration.pushManager.subscribe(options)
      //     .then((note) => {
      //       localStorage.setItem('note' + '_' + calendAr[i].day + '.' + calendAr[i].month + '.' + calendAr[i].year, calendAr[i].note());
      //     });
      // })

      //Последняя строка календаря 
      if (i == lastDateOfMonth & numLastDay != 0) {
        let k = 1
        for (numLastDay; numLastDay < 7; numLastDay++) {
          calendAr.push(new Day({
            day: k,
            month: calM + 1,
            year: calY,
            class: 'not-current',
          }))
          k++
          count++
          // document.getElementsByClassName("textInput").addEventListener('change', () => {
          //   ServiceWorkerRegistration.pushManager.subscribe(options)
          //     .then((note) => {
          //     });
          // })
        }
      }

      if (i == nowDay && nowMonth == m && nowYear == y) {
        // td.className = "nowDay"
      }

      // e.stopPropagation()
    }

    this.days([])
    this.days(listToMatrix(calendAr, 7))
    console.log(this.days())
    calendAr = []
  }

  //   $("body").click(function (e) {
  //     $(".arrow").hide()
  //   })
  // }

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


  this.toLocalStorage = function (i, j) {
    localStorage.setItem('note' + '_' + m_cal.days()[i][j].day + '.' + m_cal.days()[i][j].month + '.' + m_cal.days()[i][j].year, m_cal.days()[i][j].note());
  }

  // Выпадашки
  let monthSelect = nowMonth
  let yearSelect = nowYear

  this.daysOfWeek = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"]

  this.monthsSelect = {
    options: ko.observable(["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ]),
    selectedOptionValue: ko.observable(nowMonth),
  }
  document.querySelector("select.months").addEventListener('change', function (e) {
    monthSelect = Number(e.target.value)
    m_cal.calculate(yearSelect, monthSelect)
  })

  this.yearsSelect = {
    options: ko.observable(["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"]),
    selectedOptionValue: ko.observable(nowYear),
  }

  document.querySelector("select.years").addEventListener('change', function (e) {
    yearSelect = Number(e.target.value)
    m_cal.calculate(yearSelect, monthSelect)
  })
}()



ko.applyBindings(m_cal)

// localStorage.clear();
// ko.applyBindings(yearSelect,$(".years")[0])