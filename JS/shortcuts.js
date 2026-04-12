/**
 * ==================== ГОРЯЧИЕ КЛАВИШИ ====================
 * Обрабатывает глобальные шорткаты по всему приложению
 * Alt + буква - основные комбинации
 */

import { switchTheme } from "./theme.js";
import { formatDate, showNotification } from "./utils.js";

/**
 * Определяет, на какой странице сейчас находится пользователь
 * @param {string} page - имя страницы ('index', 'diary', 'settings')
 * @returns {boolean} true если пользователь на указанной странице
 */
function isOnPage(page) {
  const path = window.location.pathname;
  
  if (page === 'index') {
    return path === '/' || path === '/index.html';
  }
  if (page === 'diary') {
    return path.startsWith('/diary/') || path === '/diary';
  }
  if (page === 'settings') {
    return path.startsWith('/settings/') || path === '/settings';
  }
  return false;
}

/**
 * Основной обработчик горячих клавиш
 * @param {KeyboardEvent} event - событие нажатия клавиши
 */
async function handleShortCuts(event) {
  // Alt + E / Alt + У - переключение темы
  if ((event.key === 'e' || event.key === 'у') && event.altKey) {
    event.preventDefault();
    switchTheme();
  }
  
  // Alt + , - открыть настройки
  if ((event.key === ',') && event.altKey) {
    event.preventDefault();
    if (!isOnPage('settings')) {
      window.location.href = `settings/index.html`;
    }
  }
  
  // Alt + T / Alt + Е - открыть дневник или перейти на сегодня
  if ((event.key === 't' || event.key === 'е') && event.altKey) {
    event.preventDefault();
    
    if (isOnPage('diary')) {
      const { goToTodayInDiary } = await import('./diary.js');
      goToTodayInDiary();
    } else {
      window.location.href = `diary/index.html?date=${formatDate(new Date())}`;
    }
  }
  
  // Alt + Q / Alt + Й - выделить задачу или цель под курсором
  if ((event.key === 'q' || event.key === 'й') && event.altKey) {
    event.preventDefault();
    
    if (!isOnPage('diary') && !isOnPage('settings')) {
      const dayTask = document.querySelector(".day__item:hover");
      const monthTask = document.querySelector(".month__item:hover");
      
      if (dayTask) {
        const { highlightTaskUnderCursor } = await import('./day.js');
        highlightTaskUnderCursor();
      } else if (monthTask) {
        const { highlightGoalUnderCursor } = await import('./month.js');
        highlightGoalUnderCursor();
      } else {
        showNotification("✨ Наведите курсор на задачу или цель");
      }
    }
  }
  
  // Alt + D / Alt + В - фокус на поле ввода задач дня
  if ((event.key === 'd' || event.key === "в") && event.altKey) {
    const input = document.getElementById("day-input");
    if (input) {
      event.preventDefault();
      input.focus();
    }
  }
  
  // Alt + M / Alt + Ь - фокус на поле ввода целей месяца
  if ((event.key === 'm' || event.key === "ь") && event.altKey) {
    const input = document.getElementById("month-input");
    if (input) {
      event.preventDefault();
      input.focus();
    }
  }
  
  // Alt + R / Alt + К - переход на главную страницу
  if ((event.key === 'r' || event.key === 'к') && event.altKey) {
    event.preventDefault();
    if (!isOnPage('index')) {
      window.location.href = `../index.html`;
    }
  }
}

/**
 * Инициализирует глобальные горячие клавиши
 */
export function initShortCuts() {
  document.addEventListener("keydown", handleShortCuts);
}