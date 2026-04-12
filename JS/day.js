/**
 * ==================== МОДУЛЬ ДНЯ ====================
 * Управление ежедневными задачами:
 * - Добавление, удаление, выполнение задач
 * - Навигация по дням (вперёд/назад)
 * - Фильтрация выполненных задач
 * - Выделение важных задач (Alt+H)
 * - Редактирование задач (двойной клик)
 * - Добавление задач на следующий день (Shift+Enter)
 */

import { formatDate, escapeHtml, formatDisplayDate, showNotification } from './utils.js';

// ============== DOM ЭЛЕМЕНТЫ ==============
const dayInput = document.getElementById("day-input");
const dayList = document.getElementById("day-list");
const toggleBtn = document.getElementById("day-toggle-done");
const toNext = document.getElementById("day-next");
const dayTitle = document.getElementById("day-title");
const toPrev = document.getElementById("day-prev");
const addTaskBtn = document.getElementById("day-addTask");

// ============== СОСТОЯНИЕ ==============
// Фильтр выполненных задач
let hideCompleted = JSON.parse(localStorage.getItem("hideCompleted")) || false;
// Хранилище задач: { "2024-03-22": [{ id, text, completed, highlighted }] }
let tasks = JSON.parse(localStorage.getItem("dayTasks")) || {};

// ============== РАБОТА С ДАТОЙ ==============

/**
 * Определяет "реальную" сегодняшнюю дату с учётом правила 2 часов ночи
 * Если сейчас меньше 2 часов ночи, показываем вчерашний день
 * @returns {Date} объект даты, который считается "сегодня"
 */
export function getCurrentRealDate() {
  let now = new Date();
  if (now.getHours() < 2) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return yesterday;
  }
  return now;
}

// Текущая выбранная дата
let currentDate = getCurrentRealDate();

/**
 * Проверяет, является ли текущая выбранная дата "сегодня" по правилу
 * @returns {boolean}
 */
function isCurrentDateReal() {
  return formatDate(currentDate) === formatDate(getCurrentRealDate());
}

/**
 * Обновляет заголовок с датой
 * Если дата не сегодняшняя - делает заголовок кликабельным
 */
function updateDayTitle() {
  dayTitle.textContent = formatDisplayDate(currentDate);
  if (!isCurrentDateReal()) {
    dayTitle.classList.add("day__title--clickable");
  } else {
    dayTitle.classList.remove("day__title--clickable");
  }
}

// ============== НАВИГАЦИЯ ==============

/** Переход на предыдущий день */
function goToPrevDay() {
  currentDate.setDate(currentDate.getDate() - 1);
  updateDayTitle();
  render();
}

/** Возврат к текущему дню (клик по заголовку) */
function goToToday() {
  if (isCurrentDateReal()) return;
  currentDate = getCurrentRealDate();
  updateDayTitle();
  render();
}

/** Переход на следующий день */
function goToNextDay() {
  currentDate.setDate(currentDate.getDate() + 1);
  updateDayTitle();
  render();
}

// ============== ФИЛЬТР ВЫПОЛНЕННЫХ ==============

/** Обновляет иконку кнопки фильтра */
function updateToggleBtn() {
  const icon = toggleBtn.querySelector("i");
  icon.className = hideCompleted ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
}

/** Переключает режим скрытия выполненных задач */
function toggleHide() {
  hideCompleted = !hideCompleted;
  localStorage.setItem("hideCompleted", JSON.stringify(hideCompleted));
  updateToggleBtn();
  render();
}

// ============== ДОБАВЛЕНИЕ ЗАДАЧ ==============

/** Добавляет задачу на текущий день */
function addTask() {
  const text = dayInput.value.trim();
  if (!text) return;

  const key = formatDate(currentDate);
  if (!tasks[key]) tasks[key] = [];

  tasks[key].push({
    id: Date.now(),
    text: text,
    completed: false,
    highlighted: false,
  });

  dayInput.value = "";
  localStorage.setItem("dayTasks", JSON.stringify(tasks));
  render();
}

/** Добавляет задачу на следующий день (Shift+Enter) */
function addTaskToNextDay() {
  const text = dayInput.value.trim();
  if (!text) return;
  
  const nextDay = new Date(currentDate);
  nextDay.setDate(currentDate.getDate() + 1);
  const key = formatDate(nextDay);

  if (!tasks[key]) tasks[key] = [];

  tasks[key].push({
    id: Date.now(),
    text: text,
    completed: false,
    highlighted: false,
  });

  dayInput.value = "";
  localStorage.setItem("dayTasks", JSON.stringify(tasks));
  showNotification(`✅ Задача добавлена на ${formatDisplayDate(nextDay)}`);
}

// ============== ОТРИСОВКА ==============

/**
 * Отрисовывает список задач
 * Сортировка: сначала невыполненные, потом выполненные
 */
function render() {
  dayList.innerHTML = "";

  const key = formatDate(currentDate);
  let dayTasks = tasks[key] || [];

  if (hideCompleted) {
    dayTasks = dayTasks.filter(t => !t.completed);
  }
  
  const completedTasks = dayTasks.filter(t => t.completed);
  const unCompletedTasks = dayTasks.filter(t => !t.completed);
  dayTasks = [...unCompletedTasks, ...completedTasks];

  if (dayTasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "day__item day__item--empty";
    emptyMessage.innerHTML = `
      <p class="day__text day__text--empty">
        ${hideCompleted ? "Нет активных задач ✨" : "Нет задач на этот день 🎉"}
      </p>
    `;
    emptyMessage.addEventListener("click", () => dayInput.focus());
    dayList.appendChild(emptyMessage);
    return;
  }

  dayTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `day__item${task.completed ? " day__item--done" : ""}${task.highlighted ? " day__item--highlighted" : ""}`;
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
    
    li.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      editTask(task, li);
    });
    
    dayList.appendChild(li);
  });
}

// ============== РЕДАКТИРОВАНИЕ ==============

/** Редактирование задачи (двойной клик) */
function editTask(task, element) {
  const originalText = task.text;
  const originalElement = element.querySelector(".day__text");

  if (originalElement) {
    const input = document.createElement("div");
    input.className = "edit-input input";
    input.contentEditable = "true";
    input.textContent = originalText;

    originalElement.replaceWith(input);
    input.focus();
    
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(input);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);

    input.addEventListener("blur", () => {
      const newText = input.textContent.trim();
      if (newText && newText !== originalText) {
        task.text = newText;
        localStorage.setItem("dayTasks", JSON.stringify(tasks));
      }
      render();
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        input.blur();
      } else if (event.key === "Escape") {
        render();
      }
    });
  }
}

// ============== ОБРАБОТЧИК КЛИКОВ ==============

/**
 * Обрабатывает клики по кнопкам задач
 * - delete: удаление
 * - toggle: выполнение/возврат
 */
function handleListClick(event) {
  const btn = event.target.closest("button");
  
  if (btn) {
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    const key = formatDate(currentDate);
    
    if (!tasks[key]) return;
    
    if (action === "delete") {
      tasks[key] = tasks[key].filter(t => t.id !== id);
      if (tasks[key].length === 0) delete tasks[key];
    } else if (action === 'toggle') {
      const task = tasks[key].find(t => t.id === id);
      if (task) task.completed = !task.completed;
    }
    
    localStorage.setItem("dayTasks", JSON.stringify(tasks));
    render();
  }
}

// ============== ВЫДЕЛЕНИЕ ЗАДАЧ ==============

/**
 * Выделяет/снимает выделение с задачи под курсором (Alt+H)
 */
export function highlightTaskUnderCursor() {
  const hoveredElement = document.querySelector(".day__item:hover");
  
  if (!hoveredElement) {
    showNotification("❌ Наведите курсор на задачу");
    return;
  }
  
  const taskId = Number(hoveredElement.dataset.id);
  const key = formatDate(currentDate);
  const task = tasks[key]?.find(t => t.id === taskId);
  
  if (task) {
    task.highlighted = !task.highlighted;
    localStorage.setItem("dayTasks", JSON.stringify(tasks));
    render();
    showNotification(task.highlighted ? "✨ Задача выделена" : "✨ Выделение снято");
  }
}

// ============== ИМПОРТ ИЗ МЕСЯЦА ==============

/** Добавляет цель из месяца в текущий день */
export function addFromMonth(text) {
  const key = formatDate(currentDate);
  if (!tasks[key]) tasks[key] = [];

  tasks[key].push({
    id: Date.now(),
    text: text,
    completed: false,
    highlighted: false,
  });

  localStorage.setItem("dayTasks", JSON.stringify(tasks));
  render();
}

/** Добавляет цель из месяца в следующий день */
export function addFromMonthToNextDay(text) {
  const nextDay = new Date(currentDate);
  nextDay.setDate(currentDate.getDate() + 1);
  const key = formatDate(nextDay);
  if (!tasks[key]) tasks[key] = [];

  tasks[key].push({
    id: Date.now(),
    text: text,
    completed: false,
    highlighted: false,
  });

  localStorage.setItem("dayTasks", JSON.stringify(tasks));
  showNotification(`✅ Цель добавлена на ${formatDisplayDate(nextDay)}`);
  render();
}

// ============== ИНИЦИАЛИЗАЦИЯ ==============

export function initDay() {
  updateDayTitle();
  updateToggleBtn();
  render();

  dayInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (event.shiftKey) {
        addTaskToNextDay();
      } else {
        addTask();
      }
    }
  });
  
  addTaskBtn.addEventListener("click", (event) => {
    event.preventDefault();
    if (event.shiftKey) {
      addTaskToNextDay();
    } else {
      addTask();
    }
  });
  
  toPrev.addEventListener('click', goToPrevDay);
  dayTitle.addEventListener("click", goToToday);
  toNext.addEventListener("click", goToNextDay);
  toggleBtn.addEventListener('click', toggleHide);
  dayList.addEventListener("click", handleListClick);
}