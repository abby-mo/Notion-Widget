const THEME_STORAGE_KEY = "notion-calendar-theme";

const THEME_DEFAULTS = {
  "header-bg": "#1E222D",
  "header-text": "#FFFFFF",
  "calendar-bg": "#FFFFFF",
  "day-text": "#1A1A1A",
  "weekday-color": "#1A1A1A",
  "other-month-color": "#C5C5C5",
  "current-day-bg": "#1E222D",
  "current-day-text": "#FFFFFF",
};

const COLOR_INPUT_MAP = {
  "color-accent": ["header-bg", "current-day-bg"],
  "color-header-text": ["header-text"],
  "color-bg": ["calendar-bg"],
  "color-day-text": ["day-text", "weekday-color"],
  "color-today-text": ["current-day-text"],
};

function normalizeColor(value) {
  if (!value) return value;
  const trimmed = value.trim();
  if (/^[0-9A-Fa-f]{3,8}$/.test(trimmed)) {
    return `#${trimmed}`;
  }
  return trimmed;
}

function toHexColor(value) {
  const normalized = normalizeColor(value);
  if (!normalized) return "#000000";
  if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
    return normalized.toUpperCase();
  }
  if (/^#[0-9A-Fa-f]{3}$/.test(normalized)) {
    const r = normalized[1];
    const g = normalized[2];
    const b = normalized[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  const probe = document.createElement("div");
  probe.style.color = normalized;
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  document.body.removeChild(probe);

  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return "#000000";
  return (
    "#" +
    [match[1], match[2], match[3]]
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function applyThemeVars(vars) {
  Object.entries(vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, normalizeColor(value));
  });
}

function getThemeFromCss() {
  const theme = {};
  Object.keys(THEME_DEFAULTS).forEach((key) => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${key}`)
      .trim();
    theme[key] = value || THEME_DEFAULTS[key];
  });
  return theme;
}

function saveTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
}

function loadSavedTheme() {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function syncColorInputs() {
  const theme = getThemeFromCss();
  Object.entries(COLOR_INPUT_MAP).forEach(([inputId, keys]) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.value = toHexColor(theme[keys[0]]);
  });
}

function initTheme() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = {};
  params.forEach((value, key) => {
    fromUrl[key] = normalizeColor(value);
  });
  applyThemeVars(fromUrl);

  const saved = loadSavedTheme();
  if (saved) {
    applyThemeVars(saved);
  }

  syncColorInputs();

  Object.entries(COLOR_INPUT_MAP).forEach(([inputId, keys]) => {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener("input", () => {
      const color = input.value;
      const updates = {};
      keys.forEach((key) => {
        updates[key] = color;
      });
      applyThemeVars(updates);
      saveTheme(getThemeFromCss());
    });
  });

  const resetBtn = document.getElementById("theme-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(THEME_STORAGE_KEY);
      Object.keys(THEME_DEFAULTS).forEach((key) => {
        document.documentElement.style.removeProperty(`--${key}`);
      });
      applyThemeVars(fromUrl);
      syncColorInputs();
    });
  }

  initThemePanel();
}

function initThemePanel() {
  const container = document.querySelector(".calendar-container");
  const toggle = document.getElementById("theme-toggle");
  const panel = document.getElementById("theme-panel");
  if (!container || !toggle || !panel) return;

  function setOpen(open) {
    panel.hidden = !open;
    panel.classList.toggle("is-open", open);
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close color editor" : "Edit colors");
    toggle.hidden = open;
  }

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(true);
  });

  document.addEventListener("click", (event) => {
    if (!panel.classList.contains("is-open")) return;
    if (panel.contains(event.target) || toggle.contains(event.target)) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
}

window.addEventListener("DOMContentLoaded", initTheme);

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
