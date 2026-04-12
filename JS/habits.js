/**
 * ==================== МОДУЛЬ ПРИВЫЧЕК ====================
 * Трекер привычек:
 * - Добавление/удаление привычек
 * - Отметка выполнения по дням
 * - Режим редактирования (крестики)
 * - Адаптивное количество дней (5 на мобилках, 7 на ПК)
 */

import { formatDate } from './utils.js';

// ============== DOM ЭЛЕМЕНТЫ ==============
const habitInput = document.getElementById("habit-input");
const habitGrid = document.getElementById("habit-grid");
const habitAddBtn = document.getElementById("habit-addTask");
const habitEditBtn = document.getElementById("habit-edit-btn");

// ============== СОСТОЯНИЕ ==============
// Хранилище привычек: [{ id, name, entries: { "2024-03-22": true } }]
let habits = JSON.parse(localStorage.getItem("habits")) || [];
// Режим редактирования (показывать крестики удаления)
let isRedactinHabits = JSON.parse(localStorage.getItem("isRedactinHabits")) || false;

// ============== ДНИ ==============

/** Определяет количество отображаемых дней в зависимости от ширины экрана */
function getNumberOfDays() {
  return window.innerWidth < 700 ? 5 : 7;
}

/** Возвращает массив дат для отображения (последние N дней) */
function getDayList() {
  const days = [];
  const today = new Date();
  const dayCount = getNumberOfDays();
  
  for (let i = dayCount - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    days.push(day);
  }
  return days;
}

// ============== ОТРИСОВКА ==============

/** Отрисовывает сетку привычек */
function render() {
  const days = getDayList();
  const dayCount = getNumberOfDays();

  habitGrid.innerHTML = '';
  habitGrid.style.gridTemplateColumns = `minmax(100px, 150px) repeat(${dayCount}, 1fr)`;

  // Пустое состояние
  if (habits.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "habit__empty";
    emptyMessage.textContent = "Добавьте привычку 🎀";
    emptyMessage.addEventListener("click", () => habitInput.focus());
    habitGrid.appendChild(emptyMessage);
    return;
  }

  // Пустая ячейка в левом верхнем углу
  const emptyBlock = document.createElement("div");
  emptyBlock.classList.add("habit__day-header");
  habitGrid.appendChild(emptyBlock);

  // Заголовки дней (числа)
  for (let i = 0; i < dayCount; i++) {
    const habitTitle = document.createElement("div");
    habitTitle.classList.add("habit__day-header");
    habitTitle.textContent = days[i].getDate();
    habitGrid.appendChild(habitTitle);
  }

  // Отображение каждой привычки
  habits.forEach(habit => {
    const habitName = document.createElement("div");
    habitName.className = "habit__name";

    const habitSpan = document.createElement("span");
    habitSpan.textContent = habit.name;
    habitSpan.classList.add("habitSpan");
    habitName.appendChild(habitSpan);

    // Кнопка удаления (только в режиме редактирования)
    if (isRedactinHabits) {
      const habitButton = document.createElement('button');
      habitButton.className = "habit__delete-btn";
      habitButton.dataset.habitId = habit.id;
      habitButton.textContent = "✕";
      habitButton.addEventListener("click", deleteHabit);
      habitName.appendChild(habitButton);

      habitSpan.addEventListener("dblclick", (event) => {
        event.stopPropagation();
        editHabit(habit, habitSpan);
      });
    }

    habitGrid.appendChild(habitName);

    // Ячейки для каждого дня
    for (let i = 0; i < dayCount; i++) {
      const day = days[i];
      const formattedDay = formatDate(day);

      const habitCell = document.createElement('div');
      const isDone = habit.entries?.[formattedDay] || false;
      habitCell.classList.add('habit__cell');
      if (isDone) habitCell.classList.add("habit__cell--done");
      habitCell.dataset.habitId = habit.id;
      habitCell.dataset.date = formattedDay;

      habitGrid.appendChild(habitCell);
    }
  });
}

// ============== РЕДАКТИРОВАНИЕ ==============

/** Редактирование названия привычки (двойной клик) */
function editHabit(habit, element) {
  const originalText = habit.name;
  const originalElement = element;

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
      const newName = input.textContent.trim();
      if (newName && newName !== originalText) {
        habit.name = newName;
        localStorage.setItem("habits", JSON.stringify(habits));
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

// ============== ДОБАВЛЕНИЕ ==============

/** Добавляет новую привычку */
function addHabit() {
  const name = habitInput.value.trim();
  if (!name) return;

  habits.push({
    id: Date.now(),
    name: name,
    entries: {},
  });

  habitInput.value = "";
  localStorage.setItem("habits", JSON.stringify(habits));
  render();
}

// ============== УДАЛЕНИЕ ==============

/** Удаляет привычку */
function deleteHabit(event) {
  const btn = event.target.closest("button");
  if (!btn) return;

  const id = Number(btn.dataset.habitId);
  habits = habits.filter(h => h.id !== id);

  localStorage.setItem("habits", JSON.stringify(habits));
  render();
}

// ============== ОТМЕТКА ВЫПОЛНЕНИЯ ==============

/** Обрабатывает клик по ячейке привычки */
function handleClick(event) {
  const cell = event.target.closest(".habit__cell");
  if (!cell) return;

  const id = Number(cell.dataset.habitId);
  const date = cell.dataset.date;

  const habit = habits.find(h => h.id === id);
  if (habit) {
    if (!habit.entries) habit.entries = {};
    habit.entries[date] = !habit.entries[date];
    localStorage.setItem("habits", JSON.stringify(habits));
    render();
  }
}

// ============== РЕЖИМ РЕДАКТИРОВАНИЯ ==============

/** Включает/выключает режим редактирования */
function turnRedactingMode() {
  isRedactinHabits = !isRedactinHabits;
  updateRedactingIcon();
  localStorage.setItem("isRedactinHabits", JSON.stringify(isRedactinHabits));
  render();
}

/** Обновляет иконку кнопки режима редактирования */
function updateRedactingIcon() {
  const icon = habitEditBtn.querySelector("i");
  if (isRedactinHabits) {
    icon.className = "fa-solid fa-times";
    habitEditBtn.classList.add("habit__edit-btn--active");
  } else {
    icon.className = "fa-solid fa-pencil";
    habitEditBtn.classList.remove("habit__edit-btn--active");
  }
}

// ============== ИНИЦИАЛИЗАЦИЯ ==============

export function initHabits() {
  render();
  habitInput.addEventListener("keydown", (event) => event.key === "Enter" && addHabit());
  habitGrid.addEventListener("click", handleClick);
  habitAddBtn.addEventListener("click", addHabit);
  habitEditBtn.addEventListener("click", turnRedactingMode);
  updateRedactingIcon();
  window.addEventListener("resize", () => render());
}