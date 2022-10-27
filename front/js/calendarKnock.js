// m_cal={a:10}
// class m_cal{a:11}
m_cal =new function () {

  let myDate = new Date()
  let days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]
  let months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ]

  let nowMonth = myDate.getMonth()
  let nowYear = myDate.getFullYear()
  let nowDay = myDate.getDate()

  let calY
  let calM


  Date.prototype.daysInMonth = function () {
    return 32 - new Date(this.getFullYear(), this.getMonth(), 32).getDate()
  }

  function getDate(numberOfDay) {
    if (numberOfDay == 0) numberOfDay = 7
    return --numberOfDay
  }

  let value = ''

  function calMonth(y, m) {
    calY = y
    calM = m
    let calendar = document.getElementById('1я')
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
      calendar = document.getElementById(`${numWeek}я`)
      let td = document.createElement('td')
      td.innerHTML = i + "<div class = 'arrow' style='display: none;'><textarea class = 'textInput'  placeholder = 'Напишите здесь текст заметки' rows='4' cols='12' name='message'></textarea><div class = 'arrow-textInputPopup'></div></div>"
      td.className = 'current'
      td.id = `${i}`
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
      if (i == nowDay && nowMonth == m && nowYear == y) {
        td.className = "nowDay"
      }

      td.onclick = function tdClick(e) {
        let textInput = td.getElementsByClassName('arrow')
        $(".arrow").hide()
        if (value != e.target.id) {
          if (value != '') {
            const a = document.getElementById(value)
            a.getElementsByClassName('arrow')[0].style.display = 'none'
            textInput[0].onclick = function (n) {
              value = e.path[0].id
              const target = n.target;
              let textInputPopup = td.getElementsByClassName('textInput')
              const its_text = target == textInputPopup[0];
              if (!its_text) {
                textInput[0].style.display = 'none'
              }
            }
          }
          value = e.path[0].id
          textInput[0].style.display = 'block'

          textInput[0].onclick = function (n) {
            value = e.path[0].id
            const target = n.target;
            let textInputPopup = td.getElementsByClassName('textInput')
            const its_text = target == textInputPopup[0];
            if (!its_text) {
              textInput[0].style.display = 'none'
            } else {
              value = n.path[2].id
            }
          }
        } else {
          textInput[0].style.display = 'block'
        }
        e.stopPropagation()
      }
    }

    $("body").click(function (e) {
      $(".arrow").hide()
    })
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
    calMonth(nextY, nextM)
  }

  window.onload = function () {
    // Показать текущий месяц
    calMonth(nowYear, nowMonth)
  }

  function removeAllChild(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild)
    }
  }

  // Выпадашки
  let monthSelect = nowMonth
  let yearSelect = nowYear
  
  this.daysOfWeek=["ПН","ВТ","ПН","ПН","ПН","ПН","ПН"]

  this.monthsSelect = {
    options: ko.observable(["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ]),
    selectedOptionValue: ko.observable(nowMonth),
  }
  document.querySelector("select.months").addEventListener('change', function (e) {
    monthSelect = Number(e.target.value)
    calMonth(yearSelect, monthSelect)
  })


  this.yearsSelect = {
    options: ko.observable(["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"]),
    selectedOptionValue: ko.observable(nowYear),
  }

  document.querySelector("select.years").addEventListener('change', function (e) {
    yearSelect = Number(e.target.value)
    calMonth(yearSelect, monthSelect)
  })

}()
ko.applyBindings(m_cal)


// ko.applyBindings(yearSelect,$(".years")[0])