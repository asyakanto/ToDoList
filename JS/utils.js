// ==================Format date===================== //

/**
 * Форматирует дату для ключа в localStorage
 * @param {Date} date - объект даты
 * @returns {string} "2024-03-22"
 */
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// ==================Escape HTML===================== //

/**
 * Защита от XSS атак - экранирует спецсимволы HTML
 * @param {string} text - текст для защиты
 * @returns {string} безопасный текст
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==================Display date==================== //

/**
 * Форматирует дату для блока "День"
 * @param {Date} date - объект даты
 * @returns {string} "22 Марта"
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
 * Формирует ключ для месяца
 * @param {Date} date - объект даты
 * @returns {string} "2024-3"
 */
export function getMonthKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

// ==================Display month=================== //

/**
 * Форматирует дату для блока "Месяц"
 * @param {Date} date - объект даты
 * @returns {string} "Март 2024"
 */
export function formatDisplayMonth(date) {
  const months = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// ==================Absolute date=================== //

/**
 * Форматирует строку даты "2024-03-22" в читаемый вид
 * @param {string} dateStr - дата в формате "2024-03-22"
 * @returns {string} "22 Марта 2024"
 */
export function formatDisplayAbsoluteDate(dateStr) {
  const months = [
    "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
    "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"
  ];
  const day = dateStr.slice(8);           // "22"
  const month = Number(dateStr.slice(5,7)) - 1;  // 3 -> индекс 2 (Марта)
  const year = dateStr.slice(0,4);         // "2024"
  return `${day} ${months[month]} ${year}`;
}