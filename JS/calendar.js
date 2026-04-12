/**
 * ==================== МОДУЛЬ КАЛЕНДАРЯ ====================
 * Универсальный календарь:
 * - Отображение дней месяца
 * - Индикаторы наличия задач и записей дневника
 * - Подсветка текущей и выбранной даты
 * - Навигация по месяцам
 * - Клик по дню (переход в дневник или вызов колбэка)
 */

import { formatDisplayMonth, getMonthKey } from './utils.js';

// ============== DOM ЭЛЕМЕНТЫ ==============
const toPrev = document.getElementById("calendar-prev");
const calTitle = document.getElementById("calendar-title");
const toNext = document.getElementById("calendar-next");
const calGrid = document.getElementById("calendar-grid");

// ============== СОСТОЯНИЕ ==============
let currentDate = new Date();
let highlightedDate = null;      // Дата для подсветки (из дневника)
let onDayClickCallback = null;    // Колбэк при клике на день

// ============== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==============

/**
 * Проверяет, есть ли запись в дневнике на указанную дату
 * @param {string} dateStr - дата в формате "2024-03-22"
 */
function hasDiaryEntry(dateStr) {
  const diaryEntries = JSON.parse(localStorage.getItem("diaryEntries")) || {};
  const entry = diaryEntries[dateStr];
  if (!entry) return false;
  return (entry.mood?.length > 0) || (entry.events?.length > 0) || (entry.goals?.length > 0);
}

/** Определяет день недели первого дня месяца (Пн = 0) */
function weekDayOfFirstDay() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  let weekday = new Date(year, month, 1).getDay();
  weekday = weekday === 0 ? 6 : weekday - 1;
  return weekday;
}

/** Возвращает количество дней в текущем месяце */
function numberOfDaysThisMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  return new Date(year, month + 1, 0).getDate();
}

// ============== ОТРИСОВКА ==============

/**
 * Отрисовывает календарь
 * @param {Function} onDayClick - колбэк при клике на день
 * @param {string} highlightDate - дата для подсветки
 */
function render(onDayClick, highlightDate) {
  calGrid.innerHTML = "";
  const today = new Date();

  const daysBeforeFirst = weekDayOfFirstDay();
  const numberOfDays = numberOfDaysThisMonth();

  // Пустые ячейки перед первым днём
  for (let i = 0; i < daysBeforeFirst; i++) {
    const emptyElement = document.createElement("div");
    calGrid.appendChild(emptyElement);
  }

  // Ячейки для каждого дня месяца
  for (let i = 1; i <= numberOfDays; i++) {
    const isToday = 
      today.getFullYear() === currentDate.getFullYear() &&
      today.getMonth() === currentDate.getMonth() &&
      i === today.getDate();

    const dayElement = document.createElement("div");
    dayElement.classList.add("calendar__day");
    dayElement.textContent = i;
    
    if (isToday) dayElement.classList.add("calendar__day--today");

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

    // Подсветка выбранной даты (из дневника)
    if (highlightDate && dateStr === highlightDate) {
      dayElement.classList.add("calendar__day--active");
    }

    // Обработчик клика
    dayElement.addEventListener("click", () => {
      if (onDayClick) {
        onDayClick(dateStr);
      } else {
        window.location.href = `diary/index.html?date=${dateStr}`;
      }
    });

    // Индикатор наличия записи в дневнике
    if (hasDiaryEntry(dateStr)) {
      dayElement.classList.add("calendar__day--has-task");
    }

    calGrid.appendChild(dayElement);
  }
}

// ============== НАВИГАЦИЯ ==============

function isCurrentMonthReal() {
  return getMonthKey(currentDate) === getMonthKey(new Date());
}

function updateCalTitle() {
  calTitle.textContent = formatDisplayMonth(currentDate);
  if (!isCurrentMonthReal()) {
    calTitle.classList.add("calendar__title--clickable");
  } else {
    calTitle.classList.remove("calendar__title--clickable");
  }
}

function toPrevMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  currentDate = new Date(year, month - 1, 1);
  updateCalTitle();
  render(onDayClickCallback, highlightedDate);
}

function toNextMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  currentDate = new Date(year, month + 1, 1);
  updateCalTitle();
  render(onDayClickCallback, highlightedDate);
}

function goToCurrentMonth() {
  if (isCurrentMonthReal()) return;
  currentDate = new Date();
  updateCalTitle();
  render(onDayClickCallback, highlightedDate);
}

// ============== ИНИЦИАЛИЗАЦИЯ ==============

/**
 * Инициализирует календарь
 * @param {Function} onDayClick - колбэк при клике на день (для страницы дневника)
 * @param {string} highlightDate - дата для подсветки (текущая дата в дневнике)
 */
export function initCalendar(onDayClick, highlightDate) {
  onDayClickCallback = onDayClick;
  highlightedDate = highlightDate;
  updateCalTitle();
  render(onDayClick, highlightDate);

  toPrev.addEventListener("click", toPrevMonth);
  toNext.addEventListener("click", toNextMonth);
  calTitle.addEventListener("click", goToCurrentMonth);
}