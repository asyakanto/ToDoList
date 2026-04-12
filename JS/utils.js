/**
 * ==================== УТИЛИТЫ ====================
 * Вспомогательные функции для работы с датами, безопасностью и уведомлениями
 */

/**
 * Форматирует дату для ключа в localStorage
 * @param {Date} date - объект даты
 * @returns {string} дата в формате "2024-03-22"
 * @example formatDate(new Date(2024, 2, 22)) // "2024-03-22"
 */
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Защита от XSS атак - экранирует спецсимволы HTML
 * Превращает < > & " в безопасные HTML-сущности
 * @param {string} text - текст для защиты
 * @returns {string} безопасный текст с экранированными символами
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Форматирует дату для отображения в блоке "День"
 * @param {Date} date - объект даты
 * @returns {string} дата в формате "22 Марта"
 */
export function formatDisplayDate(date) {
  const months = [
    "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
    "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Формирует ключ для хранения целей по месяцам
 * @param {Date} date - объект даты
 * @returns {string} ключ в формате "2024-3"
 */
export function getMonthKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

/**
 * Форматирует дату для отображения в блоке "Месяц"
 * @param {Date} date - объект даты
 * @returns {string} дата в формате "Март 2024"
 */
export function formatDisplayMonth(date) {
  const months = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Форматирует строку даты "2024-03-22" в читаемый вид
 * @param {string} dateStr - дата в формате "2024-03-22"
 * @returns {string} дата в формате "22 Марта 2024"
 */
export function formatDisplayAbsoluteDate(dateStr) {
  const months = [
    "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
    "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"
  ];
  const day = dateStr.slice(8);
  const month = Number(dateStr.slice(5, 7)) - 1;
  const year = dateStr.slice(0, 4);
  return `${day} ${months[month]} ${year}`;
}

/**
 * Показывает временное всплывающее уведомление
 * Уведомление автоматически исчезает через 2 секунды
 * @param {string} message - текст уведомления
 */
export function showNotification(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.classList.add("notification");
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}