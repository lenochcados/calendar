let myDate = new Date()
let days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]
let months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
]

let nowMonth = myDate.getMonth()
let nowYear = myDate.getFullYear()
let myDay = myDate.getDate()
let myMonth = myDate.getMonth()
let myYear = myDate.getFullYear()
let numDayWeek = getDate(myDate.getDay())
let myDayWeek = days[numDayWeek]

let dayNotes={}

let calY
let calM
Date.prototype.daysInMonth = function () {
  return 32 - new Date(this.getFullYear(), this.getMonth(), 32).getDate()
}

function getDate(numberOfDay) {
  if (numberOfDay == 0) numberOfDay = 7
  return --numberOfDay
}

function calMonth(y, m) {
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

  let calculate = document.getElementById('calc')
  for (let row of calculate.rows) {
    removeAllChild(row)
  }

  let p = document.getElementById('p')
  p.innerHTML = months[m] + ' ' + y
  calc.before(p)

  for (i = 1; i < daysInMonth + 1; i++) {
    count++
    let numWeek = (count % 7 == 0) ? Math.floor(count / 7) : Math.floor(count / 7) + 1
    //Первая строка календаря
    if (i == 1) {
      let k = lastDayOfLastMonth - firstDay + 1
      for (let j = 0; j < firstDay; j++) {
        let td = document.createElement('td')
        td.className = 'not-current'
        td.innerHTML = k
        calendar.append(td)
        k++
        count++
      }
    }

    //Заполнение календаря
    calendar = document.getElementById(numWeek)
    let td = document.createElement('td')
    td.innerHTML = i+"<div class='textInputPopup'></div>"
    if (calendar) calendar.append(td)

    //Последняя строка календаря 
    if (i == lastDateOfMonth & numLastDay != 0) {
      let k = 1
      for (numLastDay; numLastDay < 7; numLastDay++) {
        let td = document.createElement('td')
        td.className = 'not-current'
        td.innerHTML = k
        calendar.append(td)
        k++
        count++
      }
    }
    if (i == myDay && nowMonth == m && nowYear == y) {
      td.className = "nowDay"
    }
  }
}

// Переход к следующему месяцу
nextMonth = function (dir) {
  var nextM=calM+1*dir
  var nextY=calY
  if (nextM > 11) {
    nextM = 0;
    nextY = calY + 1
  }
  if (nextM < 0) {
    nextM = 11;
    nextY = calY - 1
  }
  calMonth(nextY, nextM)
  // return

  // if (myMonth == 11) {
  //   myMonth = 0
  //   myYear = myYear + 1
  // } else {
  //   myMonth = myMonth + 1
  // }
  // let calendar = document.getElementById('calc')
  // for (let row of calendar.rows) {
  //   removeAllChild(row)
  // }
  // let p = document.getElementById('p')
  // p.parentNode.removeChild(p)
  // calMonth(myYear, myMonth)
}

// Переход к предыдущему месяцу
// previousMonth = function () {
//   if (myMonth == 0) {
//     myMonth = 11
//     myYear = myYear - 1
//   } else {
//     myMonth = myMonth - 1
//   }
//   let calendar = document.getElementById('calc')
//   for (let row of calendar.rows) {
//     removeAllChild(row)
//   }
//   let p = document.getElementById('p')
//   p.parentNode.removeChild(p)

//   calMonth(myYear, myMonth)
// }

window.onload = function () {
  // Показать текущий месяц
  calMonth(myYear, myMonth)

  // Привязываем кнопки «Следующий» и «Предыдущий»
  // let btnNext = document.getElementById('btnNext')
  // btnNext.onclick = function(){nextMonth(+1)}
  // let btnPrev = document.getElementById('btnPrev')
  // btnPrev.onclick = previousMonth
}

function removeAllChild(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}