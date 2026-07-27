window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  params.forEach((value, key) => {
    // Allow #colors as %23hex or plain hex (e.g. 1E222D or #1E222D)
    let cssValue = value;
    if (/^[0-9A-Fa-f]{3,8}$/.test(value)) {
      cssValue = `#${value}`;
    }
    document.documentElement.style.setProperty(`--${key}`, cssValue);
  });
});

function updateCalendar() {
  generateCalendar();
}

const updateInterval = setInterval(updateCalendar, 60 * 1000);

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let date = new Date();
let currentMonth = date.getMonth();
let currentYear = date.getFullYear();
let currentDate = date.getDate();

const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const calendarTable = document.getElementById("calendar");

function generateCalendar() {
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  document.getElementById("month").textContent =
    monthNames[currentMonth] + " " + currentYear;
  document.getElementById("year").textContent = currentYear;

  calendarTable.querySelector("tbody").innerHTML = "";

  let dateNum = 1;
  let nextMonthDate = 1;
  let row = calendarTable.querySelector("tbody").insertRow();

  // First week: previous month padding + start of current month
  for (let i = 0; i < 7; i++) {
    const cell = row.insertCell();

    if (i < firstDay) {
      const prevMonthDay = daysInPrevMonth - firstDay + i + 1;
      cell.textContent = prevMonthDay;
      cell.classList.add("other-month");
      continue;
    }

    const cellDate = dateNum;
    cell.textContent = cellDate;

    if (
      cellDate === currentDate &&
      currentMonth === new Date().getMonth() &&
      currentYear === new Date().getFullYear()
    ) {
      cell.classList.add("current-day");
    }

    dateNum++;

    if (i === 6) {
      row = calendarTable.querySelector("tbody").insertRow();
    }
  }

  // Remaining weeks
  while (dateNum <= daysInMonth) {
    for (let i = 0; i < 7; i++) {
      const cell = row.insertCell();

      if (dateNum > daysInMonth) {
        cell.textContent = nextMonthDate;
        cell.classList.add("other-month");
        nextMonthDate++;
      } else {
        const cellDate = dateNum;
        cell.textContent = cellDate;

        if (
          cellDate === currentDate &&
          currentMonth === new Date().getMonth() &&
          currentYear === new Date().getFullYear()
        ) {
          cell.classList.add("current-day");
        }

        dateNum++;
      }
    }

    if (dateNum <= daysInMonth || nextMonthDate <= 7) {
      row = calendarTable.querySelector("tbody").insertRow();
    }
  }
}

prevMonthBtn.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  generateCalendar();
});

generateCalendar();

const monthElement = document.getElementById("month");
if (monthElement) {
  monthElement.addEventListener("click", returnToCurrentMonth);
}

function returnToCurrentMonth() {
  const today = new Date();
  currentMonth = today.getMonth();
  currentYear = today.getFullYear();
  generateCalendar();
}
