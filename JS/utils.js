// ==================Format date===================== //

/**
 * Форматирует дату в формат ГГГГ-ММ-ДД для ключей в localStorage
 * @param {Date} date - объект даты
 * @returns {string} дата в формате "2024-03-22"
 * @example formatDate(new Date(2024, 2, 22)) // "2024-03-22"
 */
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// ==================Escape HTML===================== //

/**
 * Экранирует HTML-символы для защиты от XSS атак
 * Превращает < > & " в безопасные HTML-сущности
 * @param {string} text - текст для экранирования
 * @returns {string} безопасный текст с экранированными символами
 * @example escapeHtml('<script>alert("xss")</script>') // "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;      // устанавливаем как текст (безопасно)
  return div.innerHTML;        // получаем экранированную версию
}

// ==================Display date==================== //

/**
 * Форматирует дату для отображения в блоке "День"
 * @param {Date} date - объект даты
 * @returns {string} дата в формате "22 Марта"
 * @example formatDisplayDate(new Date(2024, 2, 22)) // "22 Марта"
 */
export function formatDisplayDate(date) {
  const months = [
    "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
    "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

// ==================Month key======================= //

/**
 * Формирует ключ для месяца в формате ГГГГ-М (без ведущего нуля)
 * @param {Date} date - объект даты
 * @returns {string} ключ месяца в формате "2024-3"
 * @example getMonthKey(new Date(2024, 2, 22)) // "2024-3"
 */
export function getMonthKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

// ==================Display month=================== //

/**
 * Форматирует дату для отображения в блоке "Месяц"
 * @param {Date} date - объект даты
 * @returns {string} дата в формате "Март 2024"
 * @example formatDisplayMonth(new Date(2024, 2, 22)) // "Март 2024"
 */
export function formatDisplayMonth(date) {
  const months = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}


export function formatDisplayAbsoluteDate(dateStr) {
  const months = [
    "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
    "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"
  ];
  return `${dateStr.slice(8)} ${months[Number(dateStr.slice(5,7)-1)]} ${dateStr.slice(0,4)}`;
}