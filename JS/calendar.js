// ====================Imports===================== //

import { formatDisplayMonth, getMonthKey } from './utils.js';

// ====================Elements==================== //

const toPrev = document.getElementById("calendar-prev");      // Кнопка "предыдущий месяц"
const calTitle = document.getElementById("calendar-title");  // Заголовок с названием месяца
const toNext = document.getElementById("calendar-next");      // Кнопка "следующий месяц"
const calGrid = document.getElementById("calendar-grid");     // Сетка с днями

// ====================Data======================= //

// = {"2024-03-22": {mood: "счастлив 😊", events: "Встретился с друзьями, сходил в кино", goals: "Сделал зарядку, прочитал 50 страниц"}, "2024-03-23": {...}, ...}
const diaryEntries = JSON.parse(localStorage.getItem("diaryEntries")) || {};

/**
 * Проверяет, есть ли заметка в дневнике на указанную дату
 * @param {string} dateStr - дата в формате "2024-03-22"
 * @returns {boolean} true если есть хотя бы одно непустое поле
 */
function hasDiaryEntry(dateStr) {
  const entry = diaryEntries[dateStr];
  if (!entry) return false;
  return (entry.mood?.length > 0) || (entry.events?.length > 0) || (entry.goals?.length > 0);
}

// ====================State======================= //

// Текущий отображаемый месяц
let currentDate = new Date();

// ====================Date helpers================ //

/**
 * Определяет день недели первого дня месяца (Пн = 0, Вс = 6)
 * @returns {number} количество пустых ячеек перед первым днем
 */
function weekDayOfFirstDay() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  let weekday = new Date(year, month, 1).getDay();
  // Преобразуем: Вс(0) → 6, Пн(1) → 0, Вт(2) → 1 и т.д.
  weekday = weekday === 0 ? 6 : weekday - 1;
  return weekday;
}

/**
 * Возвращает количество дней в текущем месяце
 * @returns {number} 28-31
 */
function numberOfDaysThisMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  return new Date(year, month + 1, 0).getDate();
}

// ====================Render====================== //

/**
 * Отрисовывает календарь
 * @param {Function} onDayClick - колбэк, вызываемый при клике на день
 *   - Если передан: вызывается с датой (для страницы дневника)
 *   - Если не передан: переход на страницу дневника (для главной страницы)
 */
function render(onDayClick) {
  calGrid.innerHTML = "";
  const today = new Date();

  const daysBeforeFirst = weekDayOfFirstDay();
  const numberOfDays = numberOfDaysThisMonth();

  // Пустые ячейки перед первым днем месяца
  for (let i = 0; i < daysBeforeFirst; i++) {
    const emptyElement = document.createElement("div");
    calGrid.appendChild(emptyElement);
  }

  // Ячейки для каждого дня месяца
  for (let i = 1; i <= numberOfDays; i++) {
    // Проверка: является ли этот день сегодняшним
    const isToday = 
      today.getFullYear() === currentDate.getFullYear() &&
      today.getMonth() === currentDate.getMonth() &&
      i === today.getDate();

    // Создаем ячейку
    const dayElement = document.createElement("div");
    dayElement.classList.add("calendar__day");
    dayElement.textContent = i;
    if (isToday) dayElement.classList.add("calendar__day--today");

    // Формируем дату в формате "2024-03-22"
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

    // Обработчик клика по дню
    dayElement.addEventListener("click", () => {
      if (onDayClick) {
        onDayClick(dateStr);                          // Для страницы дневника
      } else {
        window.location.href = `diary.html?date=${dateStr}`;  // Для главной страницы
      }
    });

    // Индикатор наличия заметки
    const hasEntry = hasDiaryEntry(dateStr);
    if (hasEntry) dayElement.classList.add("calendar__day--has-task");

    calGrid.appendChild(dayElement);
  }
}

// ====================Navigation=================== //

/**
 * Проверяет, является ли текущий месяц реальным текущим месяцем
 */
function isCurrentMonthReal() {
  return getMonthKey(currentDate) === getMonthKey(new Date());
}

/**
 * Обновляет заголовок календаря и делает его кликабельным
 */
function updateCalTitle() {
  calTitle.textContent = formatDisplayMonth(currentDate);
  if (!isCurrentMonthReal()) {
    calTitle.classList.add("calendar__title--clickable");
  } else {
    calTitle.classList.remove("calendar__title--clickable");
  }
}

/**
 * Переход на предыдущий месяц
 */
function toPrevMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  currentDate = new Date(year, month - 1, 1);
  updateCalTitle();
  render();  // Без колбэка, так как навигация не должна менять поведение
}

/**
 * Переход на следующий месяц
 */
function toNextMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  currentDate = new Date(year, month + 1, 1);
  updateCalTitle();
  render();
}

/**
 * Возврат к текущему месяцу (клик по заголовку)
 */
function goToCurrentMonth() {
  if (isCurrentMonthReal()) return;
  currentDate = new Date();
  updateCalTitle();
  render();
}

// ====================Init======================== //

/**
 * Инициализирует календарь
 * @param {Function} onDayClick - опциональный колбэк для клика по дню
 */
export function initCalendar(onDayClick) {
  updateCalTitle();
  render(onDayClick);

  toPrev.addEventListener("click", toPrevMonth);
  toNext.addEventListener("click", toNextMonth);
  calTitle.addEventListener("click", goToCurrentMonth);
}