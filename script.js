window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  });
  
  function updateCalendar() {
    generateCalendar(); 
  }
  
  const updateInterval = setInterval(updateCalendar, 60 * 1000); // Update every minute
  
  
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    let date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();
    let currentDate = date.getDate(); // Get the current day

    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");
    const monthYearSpan = document.getElementById("month-year");
    const calendarTable = document.getElementById("calendar");

    function generateCalendar() {
      const firstDay = new Date(currentYear, currentMonth, 1).getDay();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

      document.getElementById("month").textContent = monthNames[currentMonth] + " " + currentYear;
      document.getElementById("year").textContent = currentYear;

      // Clear previous rows
      calendarTable.querySelector("tbody").innerHTML = "";

      let date = 1;
      let nextMonthDate = 1;
      let row = calendarTable.querySelector("tbody").insertRow();

      // Fill in previous month's days
      for (let i = 0; i < 7; i++) {
        const cell = row.insertCell();

        if (i < firstDay) {
          // Previous month days
          const prevMonthDay = daysInPrevMonth - firstDay + i + 1;
          cell.textContent = prevMonthDay;
          cell.classList.add("other-month");
          continue;
        }

        const cellDate = date;
        cell.textContent = cellDate;

        // Highlight the current day
        if (
          cellDate === currentDate &&
          currentMonth === new Date().getMonth() &&
          currentYear === new Date().getFullYear()
        ) {
          cell.classList.add("current-day");
        }

        date++;

        if (i === 6) {
          row = calendarTable.querySelector("tbody").insertRow();
        }
      }

      // Fill remaining days of current month
      while (date <= daysInMonth) {
        for (let i = 0; i < 7; i++) {
          const cell = row.insertCell();

          if (date > daysInMonth) {
            // Next month days
            cell.textContent = nextMonthDate;
            cell.classList.add("other-month");
            nextMonthDate++;
          } else {
            const cellDate = date;
            cell.textContent = cellDate;

            if (
              cellDate === currentDate &&
              currentMonth === new Date().getMonth() &&
              currentYear === new Date().getFullYear()
            ) {
              cell.classList.add("current-day");
            }

            date++;
          }
        }

        if (date <= daysInMonth || nextMonthDate <= 7) {
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
  
    const monthElement = document.getElementById('month');
    if (monthElement) {
      monthElement.addEventListener('click', returnToCurrentMonth);
    }
  
  
    function returnToCurrentMonth() {
        console.log("Returning to the current month.");
        const today = new Date();
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        generateCalendar();
      }
  
  
      
  
  
  
  
  
