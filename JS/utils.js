export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function formatDisplayDate(date) {
  const months = [
    "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
    "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export function getMonthKey(date){
  return `${date.getFullYear()}-${date.getMonth()+1}`
}

export function formatDisplayMonth (date){
    const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", 
                  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    return months[date.getMonth()] + ' ' + date.getFullYear();
}