import { switchTheme } from "./theme.js";
import { formatDate } from "./utils.js";

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

async function handleShortCuts(event) {  // ← async
  // Alt + E (тема)
  if ((event.key === 'e' || event.key === 'у') && event.altKey) {
    event.preventDefault();
    switchTheme();
  }
  
  // Alt + , (настройки)
  if ((event.key === ',') && event.altKey) {
    event.preventDefault();
    if (!isOnPage('settings')) {
      window.location.href = `settings.html`;
    }
  }
  
  // Alt + T (дневник)
  if ((event.key === 't' || event.key === 'е') && event.altKey) {
    event.preventDefault();
    
    if (isOnPage('diary')) {
      // Динамический импорт только на странице дневника
      const { goToTodayInDiary } = await import('./diary.js');
      goToTodayInDiary();
    } else {
      window.location.href = `diary.html?date=${formatDate(new Date())}`;
    }
  }
  
  // Alt + H (фокус на привычки)
  if ((event.key === 'h' || event.key === "р") && event.altKey) {
    if (document.getElementById("habit-input")) {
      event.preventDefault();
      document.getElementById("habit-input").focus();
    }
  }
  
  // Alt + D (фокус на задачи дня)
  if ((event.key === 'd' || event.key === "в") && event.altKey) {
    if (document.getElementById("day-input")) {
      event.preventDefault();
      document.getElementById("day-input").focus();
    }
  }
  
  // Alt + M (фокус на цели месяца)
  if ((event.key === 'm' || event.key === "ь") && event.altKey) {
    if (document.getElementById("month-input")) {
      event.preventDefault();
      document.getElementById("month-input").focus();
    }
  }
  
  // Alt + R (главная страница)
  if ((event.key === 'r' || event.key === 'к') && event.altKey) {
    event.preventDefault();
    if (!isOnPage('index')) {
      window.location.href = `index.html`;
    }
  }

  // Alt + H - выделить задачу под курсором
    if ((event.key === 'q' || event.key === 'р') && event.altKey) {
    event.preventDefault();
    
    if (!isOnPage('diary') && !isOnPage('settings')) {
      const dayTask = document.querySelector(".day__item:hover");
      const monthTask = document.querySelector(".month__item:hover");
      
      if (dayTask) {
        const { highlightTaskUnderCursor } = await import('./day.js');
        highlightTaskUnderCursor();
      } else if (monthTask) {
        const { highlightGoalUnderCursor } = await import('./month.js');  // ← исправлено
        highlightGoalUnderCursor();
      } else {
        showNotification("✨ Наведите курсор на задачу или цель");
      }
    }
  }

}

export function initShortCuts() {
  document.addEventListener("keydown", handleShortCuts);
}