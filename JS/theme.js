/**
 * ==================== УПРАВЛЕНИЕ ТЕМОЙ ====================
 * Отвечает за переключение между тёмной и светлой темой
 * Сохраняет выбор пользователя в localStorage
 */

import { showNotification } from './utils.js';

// DOM элементы
const themeButton = document.getElementById("theme-btn");
const body = document.body;
const icon = themeButton?.querySelector("i");

// Загружаем сохранённую тему (false = тёмная по умолчанию)
let lightTheme = JSON.parse(localStorage.getItem("theme")) || false;

/**
 * Обновляет внешний вид в зависимости от текущей темы
 * Добавляет/удаляет класс light у body и меняет иконку
 */
function updateTheme() {
  if (lightTheme) {
    body.classList.add("light");
    if (icon) icon.className = "fa-solid fa-sun btn--icon";
  } else {
    body.classList.remove("light");
    if (icon) icon.className = "fa-solid fa-moon btn--icon";
  }
}

/**
 * Переключает тему
 * Меняет состояние, сохраняет в localStorage и обновляет интерфейс
 */
export function switchTheme() {
  lightTheme = !lightTheme;
  localStorage.setItem("theme", JSON.stringify(lightTheme));
  updateTheme();
  showNotification(`${lightTheme ? "☀️ Светлая" : "🌙 Тёмная"} тема`);
}

/**
 * Инициализирует тему при загрузке страницы
 */
export function initTheme() {
  updateTheme();
  if (themeButton) themeButton.addEventListener("click", switchTheme);
}