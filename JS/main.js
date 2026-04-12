/**
 * ==================== ТОЧКА ВХОДА ====================
 * Главный файл приложения, инициализирует все модули
 * Выполняется после полной загрузки DOM
 */

import { initDay } from './day.js';
import { initTheme } from './theme.js';
import { initMonth } from './month.js';
import { initHabits } from './habits.js';
import { initCalendar } from './calendar.js';
import { initShortCuts } from './shortcuts.js';

/**
 * Инициализация приложения
 * Ждём загрузку DOM, затем запускаем все модули
 */
document.addEventListener("DOMContentLoaded", () => {
  initShortCuts();   // Горячие клавиши (должны работать везде)
  initTheme();       // Тема оформления
  initDay();         // Ежедневные задачи
  initMonth();       // Ежемесячные цели
  initHabits();      // Трекер привычек
  initCalendar();    // Календарь
});