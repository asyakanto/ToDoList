// ==============Variables======================== //

import { formatDate, escapeHtml, formatDisplayDate } from './utils.js';

const dayInput = document.getElementById("day-input");
const dayList = document.getElementById("day-list");
const toggleBtn = document.getElementById("day-toggle-done");
const toNext = document.getElementById("day-next");
const dayTitle = document.getElementById("day-title");
const toPrev = document.getElementById("day-prev");

// Состояние фильтра выполненных задач (true = скрывать выполненные)
let hideCompleted = JSON.parse(localStorage.getItem("hideCompleted")) || false;
// Все задачи по дням: { "2024-03-22": [{ id, text, completed }] }
let tasks = JSON.parse(localStorage.getItem("dayTasks")) || {};

// ==============Date============================= //

/**
 * Определяет "реальную" сегодняшнюю дату с учетом правила 2 часов ночи
 * Если сейчас меньше 2 часов ночи - возвращает вчерашний день
 * @returns {Date} объект даты, который считается "сегодня"
 */
function getCurrentRealDate() {
  let now = new Date();
  if (now.getHours() < 2) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return yesterday;
  }
  return now;
}

// Текущая выбранная дата (какой день показываем на экране)
let currentDate = getCurrentRealDate();

/**
 * Проверяет, является ли текущая выбранная дата "сегодня" по правилу
 * @returns {boolean} true если currentDate = сегодня
 */
function isCurrentDateReal() {
  return formatDate(currentDate) === formatDate(getCurrentRealDate());
}

/**
 * Обновляет заголовок с датой и делает его кликабельным если это не сегодня
 */
function updateDayTitle() {
  dayTitle.textContent = formatDisplayDate(currentDate);

  if (!isCurrentDateReal()) {
    dayTitle.classList.add("day__title--clickable");
  } else {
    dayTitle.classList.remove("day__title--clickable");
  }
}

// =================Controls====================== //

/**
 * Переход на предыдущий день
 */
function goToPrevDay() {
  currentDate.setDate(currentDate.getDate() - 1);
  updateDayTitle();
  render();
}

/**
 * Возврат к текущему дню (клик по заголовку)
 */
function goToToday() {
  if (isCurrentDateReal()) return;

  currentDate = getCurrentRealDate();
  updateDayTitle();
  render();
}

/**
 * Переход на следующий день
 */
function goToNextDay() {
  currentDate.setDate(currentDate.getDate() + 1);
  updateDayTitle();
  render();
}

// ================Toggle btn===================== //

/**
 * Обновляет иконку кнопки фильтра выполненных задач
 */
function updateToggleBtn() {
  const icon = toggleBtn.querySelector("i");
  icon.className = hideCompleted ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
}

/**
 * Переключает режим скрытия выполненных задач
 */
function toggleHide() {
  hideCompleted = !hideCompleted;
  localStorage.setItem("hideCompleted", JSON.stringify(hideCompleted));

  updateToggleBtn();
  render();
}

// =================add task====================== //

/**
 * Добавляет новую задачу на текущий день
 * Срабатывает при нажатии Enter в поле ввода
 */
function addTask() {
  const text = dayInput.value.trim();
  if (!text) return;

  const key = formatDate(currentDate);

  if (!tasks[key]) tasks[key] = [];

  tasks[key].push({
    id: Date.now(),
    text: text,
    completed: false,
  });

  dayInput.value = "";
  localStorage.setItem("dayTasks", JSON.stringify(tasks));
  render();
}

// ================render========================= //

/**
 * Отрисовывает список задач на текущий день
 * Сортировка: сначала невыполненные, потом выполненные
 */
function render() {
  dayList.innerHTML = "";

  const key = formatDate(currentDate);
  let dayTasks = tasks[key] || [];

  // Фильтрация выполненных (если включен режим)
  if (hideCompleted) {
    dayTasks = dayTasks.filter(t => !t.completed);
  }
  
  // Сортировка: сначала невыполненные, потом выполненные
  const completedTasks = dayTasks.filter(t => t.completed);
  const unCompletedTasks = dayTasks.filter(t => !t.completed);
  dayTasks = [...unCompletedTasks, ...completedTasks];

  // Если нет задач - показываем сообщение
  if (dayTasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "day__item day__item--empty";
    emptyMessage.innerHTML = `
      <p class="day__text day__text--empty">
        ${hideCompleted ? "Нет активных задач ✨" : "Нет задач на этот день 🎉"}
      </p>
    `;
    dayList.appendChild(emptyMessage);
    return;
  }

  // Отображаем каждую задачу
  dayTasks.forEach(task => {
    let li = document.createElement("li");
    li.className = `day__item${task.completed ? " day__item--done" : ""}`;
    li.dataset.id = task.id;
    li.innerHTML = `
      <button class="day__check btn btn--icon" data-action="toggle" data-id="${task.id}">
        <i class="${task.completed ? "fa-solid fa-check-square" : "fa-regular fa-square"}"></i>
      </button>
      <p class="day__text">${escapeHtml(task.text)}</p>
      <div class="day__actions">
        <button class="day__action-btn btn btn--icon" data-action="delete" data-id="${task.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
    dayList.appendChild(li);
  });
}

// ===============list item clicks================ //

/**
 * Обрабатывает клики по элементам списка задач
 * Действия: toggle (выполнить/вернуть), delete (удалить)
 */
function handleListClick(event) {
  const btn = event.target.closest("button");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;
  const key = formatDate(currentDate);

  if (!tasks[key]) return;

  if (action === "delete") {
    // Удаление задачи
    tasks[key] = tasks[key].filter(t => t.id !== id);
    if (tasks[key].length === 0) delete tasks[key];
  } else if (action === 'toggle') {
    // Переключение статуса выполнения
    const task = tasks[key].find(t => t.id === id);
    if (task) task.completed = !task.completed;
  }

  localStorage.setItem("dayTasks", JSON.stringify(tasks));
  render();
}

// ===================Add from months============= //

/**
 * Добавляет задачу из месяца в текущий день
 * Вызывается из month.js при нажатии на кнопку "+"
 * @param {string} text - текст задачи/цели
 */
export function addFromMonth(text) {
  const key = formatDate(currentDate);
  if (!tasks[key]) tasks[key] = [];

  tasks[key].push({
    id: Date.now(),
    text: text,
    completed: false,
  });

  localStorage.setItem("dayTasks", JSON.stringify(tasks));
  render();
}

// =================init========================== //

export function initDay() {
  updateDayTitle();
  updateToggleBtn();
  render();

  dayInput.addEventListener("keydown", (event) => event.key === "Enter" && addTask());
  toPrev.addEventListener('click', goToPrevDay);
  dayTitle.addEventListener("click", goToToday);
  toNext.addEventListener("click", goToNextDay);
  toggleBtn.addEventListener('click', toggleHide);
  dayList.addEventListener("click", handleListClick);
}