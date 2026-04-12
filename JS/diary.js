// ====================Imports===================== //

import { formatDisplayAbsoluteDate, formatDate, showNotification } from './utils.js';
import { initCalendar } from './calendar.js';
import { initTheme } from './theme.js';
import { initShortCuts } from './shortcuts.js';
import { getCurrentRealDate } from './day.js';
import { initSettings } from './settings.js'


// ====================Elements==================== //

const diaryDate = document.getElementById("diary-date");
const diaryMood = document.getElementById("diary-mood");
const diaryEvents = document.getElementById("diary-events");
const diaryGoals = document.getElementById("diary-goals");
const clearBtn = document.getElementById("clear_btn");
const copyBtn = document.getElementById("copy_btn");

// ====================Data========================= //

let diaryEntries = JSON.parse(localStorage.getItem("diaryEntries")) || {};
let currentDate = null;

// ====================Helpers====================== //

function updateDiaryTitle() {
  if (diaryDate) {
    diaryDate.textContent = formatDisplayAbsoluteDate(currentDate);
  }
}

function getDateFromURL() {
  const params = new URLSearchParams(window.location.search);
  const date = params.get('date');
  if (date) return date;
  return formatDate(new Date());
}

export function render() {
  const entry = diaryEntries[currentDate] || { mood: "", events: "", goals: "" };
  if (diaryMood) diaryMood.value = entry.mood;
  if (diaryEvents) diaryEvents.value = entry.events;
  if (diaryGoals) diaryGoals.value = entry.goals;
}

function saveField(field, value) {
  if (!diaryEntries[currentDate]) {
    diaryEntries[currentDate] = { mood: "", events: "", goals: "" };
  }
  diaryEntries[currentDate][field] = value;
  localStorage.setItem("diaryEntries", JSON.stringify(diaryEntries));
  showNotification("📝 Запись сохранена");
}

// ====================Calendar callback============ //

function clickOnDay(dateStr) {
  currentDate = dateStr;
  updateDiaryTitle();
  render();
  initCalendar(clickOnDay, currentDate);
  window.history.pushState({}, "", `?date=${dateStr}`);
}

// ====================Navigate to today============ //

export function goToTodayInDiary() {
  const todayStr = formatDate(getCurrentRealDate());
  currentDate = todayStr;
  updateDiaryTitle();
  render();
  initCalendar(clickOnDay, currentDate);
  window.history.pushState({}, "", `?date=${todayStr}`);
  showNotification("📅 Переход на сегодня");
}

// ====================Clear & Copy================= //

function clearCurrentText() {
  diaryEntries[currentDate] = { mood: "", events: "", goals: "" };
  localStorage.setItem("diaryEntries", JSON.stringify(diaryEntries));
  render();
  showNotification("🧹 Заметка очищена");
}

function copyToClipboard() {
  const entry = diaryEntries[currentDate] || { mood: "", events: "", goals: "" };
  const text = `📅 ${formatDisplayAbsoluteDate(currentDate)}\n\n` +
    `😊 Эмоции:\n${entry.mood || "—"}\n\n` +
    `📅 События:\n${entry.events || "—"}\n\n` +
    `🎯 Цели:\n${entry.goals || "—"}`;
  
  navigator.clipboard.writeText(text).then(() => {
    showNotification("📋 Заметка скопирована");
  }).catch(() => {
    showNotification("❌ Не удалось скопировать");
  });
}

// ====================Init========================= //

function initDiary() {
  currentDate = getDateFromURL();
  updateDiaryTitle();
  render();
  
  if (diaryMood) diaryMood.addEventListener("blur", () => saveField("mood", diaryMood.value));
  if (diaryEvents) diaryEvents.addEventListener("blur", () => saveField("events", diaryEvents.value));
  if (diaryGoals) diaryGoals.addEventListener("blur", () => saveField("goals", diaryGoals.value));
  if (clearBtn) clearBtn.addEventListener("click", clearCurrentText);
  if (copyBtn) copyBtn.addEventListener("click", copyToClipboard);
  
  initCalendar(clickOnDay, currentDate);
}

initTheme();
initShortCuts();
initDiary();
initSettings();