<<<<<<< Updated upstream
let myDate = new Date();
let days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
let months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

let myDay = myDate.getDate();
let myMonth = myDate.getMonth();
let myYear = myDate.getFullYear();
let numDayWeek = getDate(myDate.getDay());
let myDayWeek = days[numDayWeek];

let calendar = document.getElementById(1);
// Первый день недели в месяце 
let firstDay = new Date(myYear, myMonth, 7).getDay();
// Последний день месяца
let lastDateOfMonth = new Date(myYear, myMonth + 1, 0).getDate();
// Последний день предыдущего месяца
let lastDayOfLastMonth = myMonth == 0 ? new Date(myYear - 1, 11, 0).getDate() : new Date(myYear, myMonth, 0)
  .getDate();
let numLastDay = new Date(myYear, myMonth + 1, 0).getDay();

let calc = document.getElementById('calc');
let p = document.createElement('p');
p.className = 'monthName';
p.innerHTML = months[myMonth] + ' ' + myYear;
calc.before(p);

Date.prototype.daysInMonth = function () {
  return 32 - new Date(this.getFullYear(), this.getMonth(), 32).getDate();
};

let daysInMonth = new Date().daysInMonth();
let count = 0;

function getDate(numberOfDay) {
  if (numberOfDay == 0) numberOfDay = 7;
  return --numberOfDay;
}

for (i = 1; i < daysInMonth + 1; i++) {
  count++;
  let numWeek = (count % 7 == 0) ? Math.floor(count / 7) : Math.floor(count / 7) + 1;
  if (i == 1) {
    let k = lastDayOfLastMonth - firstDay + 1;
    for (var j = 0; j < firstDay; j++) {
      let td = document.createElement('td');
      td.className = 'not-current';
      td.innerHTML = k;
      calendar.append(td);
      k++;
      count++;
    }
  }

  calendar = document.getElementById(numWeek);
  let td = document.createElement('td');
  td.innerHTML = i;
  calendar.append(td);
  if (i == lastDateOfMonth) {
    let k = 1;
    for (numLastDay; numLastDay < 7; numLastDay++) {
      let td = document.createElement('td');
      td.className = 'not-current';
      td.innerHTML = k;
      calendar.append(td);
      k++;
      count++;
    }
  }
  if (i == myDay) {
    td.className = "nowDay";
  }
}

// Привязываем кнопки «Следующий» и «Предыдущий»
document.getElementById('btnNext').onclick = function () {
  c.nextMonth();
};

document.getElementById('btnPrev').onclick = function () {
  c.previousMonth();
=======
let myDate = new Date();
let days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
let months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

let myDay = myDate.getDate();
let myMonth = myDate.getMonth();
let myYear = myDate.getFullYear();
let numDayWeek = getDate(myDate.getDay());
let myDayWeek = days[numDayWeek];

let calendar = document.getElementById(1);
// Первый день недели в месяце 
let firstDay = new Date(myYear, myMonth, 7).getDay();
// Последний день месяца
let lastDateOfMonth = new Date(myYear, myMonth + 1, 0).getDate();
// Последний день предыдущего месяца
let lastDayOfLastMonth = myMonth == 0 ? new Date(myYear - 1, 11, 0).getDate() : new Date(myYear, myMonth, 0)
  .getDate();
let numLastDay = new Date(myYear, myMonth + 1, 0).getDay();

let calc = document.getElementById('calc');
let p = document.createElement('p');
p.className = 'monthName';
p.innerHTML = months[myMonth] + ' ' + myYear;
calc.before(p);

Date.prototype.daysInMonth = function () {
  return 32 - new Date(this.getFullYear(), this.getMonth(), 32).getDate();
};

let daysInMonth = new Date().daysInMonth();
let count = 0;

function getDate(numberOfDay) {
  if (numberOfDay == 0) numberOfDay = 7;
  return --numberOfDay;
}

for (i = 1; i < daysInMonth + 1; i++) {
  count++;
  let numWeek = (count % 7 == 0) ? Math.floor(count / 7) : Math.floor(count / 7) + 1;
  if (i == 1) {
    let k = lastDayOfLastMonth - firstDay + 1;
    for (var j = 0; j < firstDay; j++) {
      let td = document.createElement('td');
      td.className = 'not-current';
      td.innerHTML = k;
      calendar.append(td);
      k++;
      count++;
    }
  }

  calendar = document.getElementById(numWeek);
  let td = document.createElement('td');
  td.innerHTML = i;
  calendar.append(td);
  if (i == lastDateOfMonth) {
    let k = 1;
    for (numLastDay; numLastDay < 7; numLastDay++) {
      let td = document.createElement('td');
      td.className = 'not-current';
      td.innerHTML = k;
      calendar.append(td);
      k++;
      count++;
    }
  }
  if (i == myDay) {
    td.className = "nowDay";
  }
}

// Привязываем кнопки «Следующий» и «Предыдущий»
document.getElementById('btnNext').onclick = function () {
  c.nextMonth();
};

document.getElementById('btnPrev').onclick = function () {
  c.previousMonth();
>>>>>>> Stashed changes
};