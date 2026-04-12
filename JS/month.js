/**
 * ==================== МОДУЛЬ МЕСЯЦА ====================
 * Управление ежемесячными целями:
 * - Добавление, удаление, выполнение целей
 * - Приоритеты (1 - высокий, 2 - средний, 3 - низкий)
 * - Навигация по месяцам
 * - Фильтрация выполненных целей
 * - Выделение важных целей (Alt+H)
 * - Редактирование целей (двойной клик)
 * - Добавление целей в ежедневные задачи
 */

import { getMonthKey, formatDisplayMonth, escapeHtml, showNotification } from './utils.js';
import { addFromMonth, addFromMonthToNextDay } from './day.js';

// ============== DOM ЭЛЕМЕНТЫ ==============
const toPrev = document.getElementById("month-prev");
const monthTitle = document.getElementById("month-title");
const monthToggle = document.getElementById("month-toggle-done");
const toNext = document.getElementById("month-next");
const monthInput = document.getElementById("month-input");
const monthList = document.getElementById("month-list");
const monthAddBtn = document.getElementById("month-addTask");

// ============== СОСТОЯНИЕ ==============
// Фильтр выполненных целей
let hideMonthCompleted = JSON.parse(localStorage.getItem("hideMonthCompleted")) || false;
// Хранилище целей: { "2024-3": [{ id, text, priority, completed, highlighted }] }
let tasks = JSON.parse(localStorage.getItem("monthTasks")) || {};

// Текущий отображаемый месяц
let currentDate = new Date();

// ============== РАБОТА С ДАТОЙ ==============

/** Проверяет, является ли текущий месяц реальным текущим месяцем */
function isCurrentMonthReal() {
  return getMonthKey(currentDate) === getMonthKey(new Date());
}

/** Обновляет заголовок месяца и делает его кликабельным */
function updateMonthTitle() {
  monthTitle.textContent = formatDisplayMonth(currentDate);
  if (!isCurrentMonthReal()) {
    monthTitle.classList.add("month__title--clickable");
  } else {
    monthTitle.classList.remove("month__title--clickable");
  }
}

// ============== НАВИГАЦИЯ ==============

/** Переход на предыдущий месяц */
function goToPrevMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  currentDate = new Date(year, month - 1, 1);
  updateMonthTitle();
  render();
}

/** Возврат к текущему месяцу (клик по заголовку) */
function goToCurrentMonth() {
  if (isCurrentMonthReal()) return;
  currentDate = new Date();
  updateMonthTitle();
  render();
}

/** Переход на следующий месяц */
function goToNextMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  currentDate = new Date(year, month + 1, 1);
  updateMonthTitle();
  render();
}

// ============== ФИЛЬТР ВЫПОЛНЕННЫХ ==============

/** Обновляет иконку кнопки фильтра */
function updateToggleBtn() {
  const icon = monthToggle.querySelector("i");
  icon.className = hideMonthCompleted ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
}

/** Переключает режим скрытия выполненных целей */
function toggleHide() {
  hideMonthCompleted = !hideMonthCompleted;
  updateToggleBtn();
  localStorage.setItem("hideMonthCompleted", JSON.stringify(hideMonthCompleted));
  render();
}

// ============== ДОБАВЛЕНИЕ ЦЕЛЕЙ ==============

/**
 * Добавляет новую цель на месяц
 * Поддерживает приоритеты:
 * - "1_текст" → высокий приоритет (1)
 * - "3_текст" → низкий приоритет (3)
 * - обычный текст → средний приоритет (2)
 */
function addTask() {
  let text = monthInput.value.trim();
  let priority = 2;

  if (!text) return;

  const key = getMonthKey(currentDate);
  if (!tasks[key]) tasks[key] = [];

  if (text.startsWith('1_')) {
    text = text.slice(2).trim();
    priority = 1;
  } else if (text.startsWith("3_")) {
    text = text.slice(2).trim();
    priority = 3;
  }

  tasks[key].push({
    id: Date.now(),
    text: text,
    priority: priority,
    completed: false,
    highlighted: false,
  });

  monthInput.value = "";
  localStorage.setItem("monthTasks", JSON.stringify(tasks));
  render();
}

// ============== ОТРИСОВКА ==============

/**
 * Отрисовывает список целей на месяц
 * Сортировка: сначала невыполненные по приоритету, затем выполненные
 */
function render() {
  monthList.innerHTML = "";

  const key = getMonthKey(currentDate);
  let monthTasks = tasks[key] || [];
  
  if (hideMonthCompleted) {
    monthTasks = monthTasks.filter(t => !t.completed);
  }

  // Сортировка по приоритету и статусу
  const firstUncompleted = monthTasks.filter(t => !t.completed && t.priority === 1);
  const secondUncompleted = monthTasks.filter(t => !t.completed && t.priority === 2);
  const thirdUncompleted = monthTasks.filter(t => !t.completed && t.priority === 3);
  const firstCompleted = monthTasks.filter(t => t.completed && t.priority === 1);
  const secondCompleted = monthTasks.filter(t => t.completed && t.priority === 2);
  const thirdCompleted = monthTasks.filter(t => t.completed && t.priority === 3);

  monthTasks = [...firstUncompleted, ...secondUncompleted, ...thirdUncompleted, 
                ...firstCompleted, ...secondCompleted, ...thirdCompleted];

  if (monthTasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "month__item month__item--empty";
    emptyMessage.innerHTML = `
      <p class="month__text month__text--empty">
        ${hideMonthCompleted ? "Нет активных задач ✨" : "Нет задач на этот месяц 🎉"}
      </p>
    `;
    emptyMessage.addEventListener("click", () => monthInput.focus());
    monthList.appendChild(emptyMessage);
    return;
  }

  monthTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `month__item${task.completed ? " month__item--done" : ""}${task.highlighted ? " month__item--highlighted" : ""}`;
    li.dataset.id = task.id;
    li.innerHTML = `
      <span class="priority priority--${task.priority}" data-action="toggle" data-id="${task.id}">${task.priority}</span>
      <p class="month__text">${escapeHtml(task.text)}</p>
      <div class="month__actions">
        <button class="month__action-btn btn btn--icon" data-action="add" data-id="${task.id}">
          <i class="fa-solid fa-plus"></i>
        </button>
        <button class="month__action-btn btn btn--icon" data-action="delete" data-id="${task.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
    
    li.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      editTask(task, li);
    });
    
    monthList.appendChild(li);
  });
}

// ============== РЕДАКТИРОВАНИЕ ==============

/** Редактирование цели (двойной клик) */
function editTask(task, element) {
  const originalText = `${task.priority}_${task.text}`;
  const originalElement = element.querySelector(".month__text");

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
      let newText = input.textContent.trim();
      let newPriority = 2;
      
      if (newText.startsWith("1_")) {
        newText = newText.slice(2).trim();
        newPriority = 1;
      } else if (newText.startsWith("2_")) {
        newText = newText.slice(2).trim();
      } else if (newText.startsWith("3_")) {
        newText = newText.slice(2).trim();
        newPriority = 3;
      }

      if (newText && newText !== originalText) {
        task.text = newText;
        task.priority = newPriority;
        localStorage.setItem("monthTasks", JSON.stringify(tasks));
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
 * Обрабатывает клики по элементам списка целей
 * Действия:
 * - delete: удаление цели
 * - toggle: выполнение/возврат
 * - add: добавление в ежедневные задачи
 */
function handleListClick(event) {
  const btn = event.target.closest("[data-action]");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;
  const key = getMonthKey(currentDate);

  if (!tasks[key]) return;

  if (action === 'delete') {
    tasks[key] = tasks[key].filter(t => t.id !== id);
    if (tasks[key].length === 0) delete tasks[key];
  } else if (action === 'toggle') {
    const task = tasks[key].find(t => t.id === id);
    if (task) task.completed = !task.completed;
  } else if (action === 'add') {
    const task = tasks[key].find(t => t.id === id);
    if (task) {
      if (event.shiftKey) {
        addFromMonthToNextDay(task.text);
      } else {
        addFromMonth(task.text);
      }
    }
  }

  localStorage.setItem("monthTasks", JSON.stringify(tasks));
  render();
}

// ============== ВЫДЕЛЕНИЕ ЦЕЛЕЙ ==============

/** Выделяет/снимает выделение с цели под курсором (Alt+H) */
export function highlightGoalUnderCursor() {
  const hoveredElement = document.querySelector(".month__item:hover");

  if (!hoveredElement) {
    showNotification("❌ Наведите курсор на цель");
    return;
  }

  const taskId = Number(hoveredElement.dataset.id);
  const key = getMonthKey(currentDate);
  const task = tasks[key]?.find(t => t.id === taskId);

  if (task) {
    task.highlighted = !task.highlighted;
    localStorage.setItem("monthTasks", JSON.stringify(tasks));
    render();
    showNotification(task.highlighted ? "✨ Цель выделена" : "✨ Выделение снято");
  }
}

// ============== ИНИЦИАЛИЗАЦИЯ ==============

export function initMonth() {
  updateMonthTitle();
  updateToggleBtn();
  render();

  toPrev.addEventListener("click", goToPrevMonth);
  monthTitle.addEventListener("click", goToCurrentMonth);
  toNext.addEventListener("click", goToNextMonth);
  monthToggle.addEventListener("click", toggleHide);
  monthInput.addEventListener("keydown", (event) => event.key === "Enter" && addTask());
  monthAddBtn.addEventListener("click", addTask);
  monthList.addEventListener("click", handleListClick);
}