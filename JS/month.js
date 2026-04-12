// ==================Variables==================== //
import { getMonthKey, formatDisplayMonth, escapeHtml, showNotification } from './utils.js';
import { addFromMonth, addFromMonthToNextDay } from './day.js';

const toPrev = document.getElementById("month-prev");
const monthTitle = document.getElementById("month-title");
const monthToggle = document.getElementById("month-toggle-done");
const toNext = document.getElementById("month-next");
const monthInput = document.getElementById("month-input");
const monthList = document.getElementById("month-list");
const monthAddBtn = document.getElementById("month-addTask");

// Состояние фильтра выполненных целей (true = скрывать выполненные)
let hideMonthCompleted = JSON.parse(localStorage.getItem("hideMonthCompleted")) || false;
// Все цели по месяцам: { "2024-03": [{ id, text, priority, completed, highlighted }] }
let tasks = JSON.parse(localStorage.getItem("monthTasks")) || {};

// ====================Date======================= //

// Текущий отображаемый месяц
let currentDate = new Date();

/**
 * Проверяет, является ли текущий отображаемый месяц реальным текущим месяцем
 * @returns {boolean} true если это текущий месяц
 */
function isCurrentMonthReal() {
  return getMonthKey(currentDate) == getMonthKey(new Date());
}

/**
 * Обновляет заголовок месяца и добавляет класс кликабельности
 */
function updateMonthTitle() {
  monthTitle.textContent = formatDisplayMonth(currentDate);

  if (!isCurrentMonthReal()) {
    monthTitle.classList.add("month__title--clickable");
  } else {
    monthTitle.classList.remove("month__title--clickable");
  }
}

// ==================Controls===================== //

/**
 * Переход на предыдущий месяц
 */
function goToPrevMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  currentDate = new Date(year, month - 1, 1);
  updateMonthTitle();
  render();
}

/**
 * Возврат к текущему месяцу (клик по заголовку)
 */
function goToCurrentMonth() {
  if (isCurrentMonthReal()) return;

  currentDate = new Date();
  updateMonthTitle();
  render();
}

/**
 * Переход на следующий месяц
 */
function goToNextMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  currentDate = new Date(year, month + 1, 1);
  updateMonthTitle();
  render();
}

// =================Toggle button================= //

/**
 * Обновляет иконку кнопки фильтра выполненных целей
 */
function updateToggleBtn() {
  const icon = monthToggle.querySelector("i");
  icon.className = hideMonthCompleted ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
}

/**
 * Переключает режим скрытия выполненных целей
 */
function toggleHide() {
  hideMonthCompleted = !hideMonthCompleted;

  updateToggleBtn();
  localStorage.setItem("hideMonthCompleted", JSON.stringify(hideMonthCompleted));
  render();
}

// ================add task======================= //

/**
 * Добавляет новую цель на месяц
 * Поддерживает приоритеты: "1_текст" (высокий), "3_текст" (низкий), по умолчанию 2 (средний)
 */
function addTask() {
  let text = monthInput.value.trim();
  let priority = 2;  // средний приоритет по умолчанию

  if (!text) return;

  const key = getMonthKey(currentDate);
  if (!tasks[key]) tasks[key] = [];

  // Парсинг приоритета из начала строки
  if (text.startsWith('1_')) {
    text = text.slice(2).trim();
    priority = 1;  // высокий
  } else if (text.startsWith("3_")) {
    text = text.slice(2).trim();
    priority = 3;  // низкий
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

// ===================render====================== //

/**
 * Отрисовывает список целей на месяц
 * Сортировка: сначала невыполненные по приоритету (1,2,3), затем выполненные по приоритету
 */
function render() {
  monthList.innerHTML = "";

  const key = getMonthKey(currentDate);
  let monthTasks = tasks[key] || [];
  
  // Фильтрация выполненных (если включен режим)
  if (hideMonthCompleted) {
    monthTasks = monthTasks.filter(t => !t.completed);
  }

  // Сортировка: сначала невыполненные по приоритету, потом выполненные
  const firstUncompletedTasks = monthTasks.filter(t => !t.completed && t.priority == 1);
  const secondUncompletedTasks = monthTasks.filter(t => !t.completed && t.priority == 2);
  const thirdUncompletedTasks = monthTasks.filter(t => !t.completed && t.priority == 3);
  const firstCompletedTasks = monthTasks.filter(t => t.completed && t.priority == 1);
  const secondCompletedTasks = monthTasks.filter(t => t.completed && t.priority == 2);
  const thirdCompletedTasks = monthTasks.filter(t => t.completed && t.priority == 3);

  monthTasks = [...firstUncompletedTasks, ...secondUncompletedTasks, ...thirdUncompletedTasks, 
                ...firstCompletedTasks, ...secondCompletedTasks, ...thirdCompletedTasks];

  // Если нет целей - показываем сообщение
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

  // Отображаем каждую цель
  monthTasks.forEach(task => {
    let li = document.createElement("li");
    li.className = `month__item${task.completed ? " month__item--done" : ""}${task.highlighted ? " month__item--highlighted" : ""}`;
    li.dataset.id = task.id;
    li.innerHTML = `
      <span class="priority priority--${task.priority}" data-action="toggle" data-id="${task.id}">${task.priority}</span>
      <p class="month__text">${escapeHtml(task.text)}</p>
      <div class="month__actions">
        <button class="month__action-btn btn btn--icon" data-action="add" aria-label="Добавить в день" data-id="${task.id}">
          <i class="fa-solid fa-plus"></i>
        </button>
        <button class="month__action-btn btn btn--icon" data-action="delete" aria-label="Удалить" data-id="${task.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
    li.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      editTask(task, li);
    })
    monthList.appendChild(li);
  });
}


// =================list item click=============== //

function editTask (task, element) {
  const priority = task.priority
  const originalText = `${priority}_${task.text}`;
  const OriginalElement = element.querySelector(".month__text");

  if (OriginalElement) {
    const input = document.createElement("div");
    input.className = "edit-input input";
    input.contentEditable = "true";
    input.textContent = originalText;

    OriginalElement.replaceWith(input);
    input.focus();
    // Ставим курсор в конец текста
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(input);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);


    input.addEventListener("blur", () => {
      let newText = input.textContent.trim();
      let newPriority = 2;
      if (newText.startsWith("1_")){
        newText = newText.slice(2);
        newPriority = 1
      } else if (newText.startsWith("2_")){
        newText =newText.slice(2);
      } else if (newText.startsWith("3_")){
        newText=newText.slice(2);
        newPriority = 3;
      }

      if (newText && newText !== originalText) {
        task.text = newText;
        task.priority = newPriority;
        localStorage.setItem("monthTasks", JSON.stringify(tasks));
      }
      render ();
    })

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        input.blur();
      } else if (event.key == "Escape") {
        render();
      }
    })
  }
}


/**
 * Обрабатывает клики по элементам списка целей
 * Действия: toggle (выполнить/вернуть), delete (удалить), add (добавить в день)
 */
function handleListClick(event) {
  const btn = event.target.closest("[data-action]");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;
  const key = getMonthKey(currentDate);

  if (!tasks[key]) return;

  if (action === 'delete') {
    // Удаление цели
    tasks[key] = tasks[key].filter(t => t.id !== id);
    if (tasks[key].length === 0) delete tasks[key];
  } else if (action === 'toggle') {
    // Переключение статуса выполнения
    const task = tasks[key].find(t => t.id === id);
    if (task) task.completed = !task.completed;
  } else if (action === 'add') {
    // Добавление цели в текущий день (из day.js)
    const task = tasks[key].find(t => t.id === id);
    if (task) {
      if (event.shiftKey) {
        addFromMonthToNextDay(task.text);  // Добавить на следующий день
      } else {
        addFromMonth(task.text);            // Добавить на текущий день
      }
    }
  }

  localStorage.setItem("monthTasks", JSON.stringify(tasks));
  render();
}

// ==============Highlight on Alt+H================ //

export function highlightGoalUnderCursor() {
  const hoveredElement = document.querySelector(".month__item:hover");

  if (!hoveredElement) {
    showNotification("❌ Наведите курсор на задачу");
    return;
  }

  const taskId = Number(hoveredElement.dataset.id);
  const key = getMonthKey(currentDate);
  const task = tasks[key]?.find(t => t.id === taskId);

  if (task) {
    task.highlighted = !task.highlighted;
    localStorage.setItem("monthTasks", JSON.stringify(tasks));
    render();
    showNotification(task.highlighted ? "✨ Задача выделена" : "✨ Выделение снято");
  }
}

// =================init========================== //

export function initMonth() {
  updateMonthTitle();
  updateToggleBtn();
  render();

  toPrev.addEventListener("click", goToPrevMonth);
  monthTitle.addEventListener("click", goToCurrentMonth);
  toNext.addEventListener("click", goToNextMonth);
  monthToggle.addEventListener("click", toggleHide);
  monthInput.addEventListener("keydown", (event) => event.key === "Enter" && addTask());
  monthAddBtn.addEventListener("click", addTask)
  monthList.addEventListener("click", handleListClick);
}