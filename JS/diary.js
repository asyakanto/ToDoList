// ====================Imports===================== //

import { formatDisplayAbsoluteDate, formatDate, showNotification } from './utils.js';
import { initCalendar } from './calendar.js';
import { initTheme } from './theme.js';  // Инициализация темы (светлая/темная)
import { initShortCuts } from './shortcuts.js';
import { getCurrentRealDate } from './day.js';



// ====================Elements==================== //

const diaryDate = document.getElementById("diary-date");      // Заголовок с датой
const diaryMood = document.getElementById("diary-mood");      // Поле "Эмоции"
const diaryEvents = document.getElementById("diary-events");  // Поле "События"
const diaryGoals = document.getElementById("diary-goals");    // Поле "Цели"

// ====================Data========================= //

// = {"2024-03-22": {mood: "не счастлив", events: "ничего", goals: "не сдохнуть"}, "2024-03-23": {...}, ...}
let diaryEntries = JSON.parse(localStorage.getItem("diaryEntries")) || {};
// Текущая открытая дата
let currentDate = null;

// ====================Helpers====================== //

/**
 * Обновляет заголовок страницы с датой
 */
function updateDiaryTitle() {
  if (diaryDate) {
      diaryDate.textContent = formatDisplayAbsoluteDate(currentDate);
  }
}

/**
 * Получает дату из URL параметра 'date'
 * @returns {string} дата в формате "2024-03-22" или сегодняшняя
 */
function getDateFromURL() {
  const params = new URLSearchParams(window.location.search);
  const date = params.get('date');
  if (date) return date;
  return formatDate(new Date());
}

/**
 * Загружает и отображает заметку для текущей даты
 */
export function render() {
  const entry = diaryEntries[currentDate] || { mood: "", events: "", goals: "" };
  diaryMood.value = entry.mood;
  diaryEvents.value = entry.events;
  diaryGoals.value = entry.goals;
}

/**
 * Сохраняет одно поле заметки в localStorage
 * @param {string} field - имя поля ("mood", "events", "goals")
 * @param {string} value - текст для сохранения
 */
function saveField(field, value) {
  if (!diaryEntries[currentDate]) {
    diaryEntries[currentDate] = { mood: "", events: "", goals: "" };
  }
  diaryEntries[currentDate][field] = value;
  localStorage.setItem("diaryEntries", JSON.stringify(diaryEntries));
  showNotification("Запись сохранена")
}

// ====================Calendar callback============ //

/**
 * Обработчик клика по дню в календаре
 * @param {string} dateStr - дата в формате "2024-03-22"
 */
function clickOnDay(dateStr) {
  currentDate = dateStr;
  updateDiaryTitle();
  render();
  initCalendar(clickOnDay, currentDate);
  // Обновляем URL без перезагрузки страницы
  window.history.pushState({}, "", `?date=${dateStr}`);
}
// ====================Navigate to today============ //


/**
 * Переход на сегодняшнюю дату в дневнике
 */
export function goToTodayInDiary() {
  const todayStr = formatDate(getCurrentRealDate());
  currentDate = todayStr;
  updateDiaryTitle();
  render();
  initCalendar(clickOnDay, currentDate);
  window.history.pushState({}, "", `?date=${todayStr}`);
}

// ====================Init========================= //

function initDiary() {
  currentDate = getDateFromURL();
  updateDiaryTitle();
  render();
  
  diaryMood.addEventListener("blur", () => saveField("mood", diaryMood.value));
  diaryEvents.addEventListener("blur", () => saveField("events", diaryEvents.value));
  diaryGoals.addEventListener("blur", () => saveField("goals", diaryGoals.value));
  
  // календарь с колбэком для переключения дня
  initCalendar(clickOnDay, currentDate);
}

initDiary();
initTheme();
initShortCuts();