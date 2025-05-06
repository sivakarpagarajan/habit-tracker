const habitList = document.getElementById('habitList');
const habitForm = document.getElementById('habitForm');
const habitNameInput = document.getElementById('habitName');

let habits = JSON.parse(localStorage.getItem('habits')) || [];

function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
}

function renderHabits() {
  habitList.innerHTML = '';
  const todayStr = new Date().toDateString();

  habits.forEach((habit, index) => {
    const completions = habit.completions || [];
    const stickers = habit.stickers || [];
    const streak = calculateStreak(completions);
    const markedToday = completions.includes(todayStr);

    const habitDiv = document.createElement('div');
    habitDiv.className = 'habit';

    // Header
    const header = document.createElement('div');
    header.className = 'habit-header';
    header.innerHTML = `
      <h2>🏷️ ${habit.name}</h2>
      <span class="streak">🔥 ${streak}-day streak</span>
    `;
    habitDiv.appendChild(header);

    // Calendar
    const calendar = renderCalendar(completions);
    habitDiv.appendChild(calendar);

    // Stickers
    const stickerDiv = document.createElement('div');
    stickerDiv.className = 'stickers';
    stickerDiv.innerHTML = `🏅 ${stickers.map(s => s.emoji).join(' ')}`;
    habitDiv.appendChild(stickerDiv);

    // Button
    const btn = document.createElement('button');
    btn.className = 'mark-done';
    btn.textContent = markedToday ? '✅ Done for Today' : '✅ Mark Today as Done';
    btn.disabled = markedToday;
    btn.addEventListener('click', () => {
      if (!completions.includes(todayStr)) {
        completions.push(todayStr);
        const sticker = getStickerByStreak(streak + 1);
        stickers.push({ date: todayStr, emoji: sticker });
        habit.completions = completions;
        habit.stickers = stickers;
        saveHabits();
        renderHabits();
      }
    });
    habitDiv.appendChild(btn);

    habitList.appendChild(habitDiv);
  });
}

function calculateStreak(dates) {
  const sorted = dates
    .map(d => new Date(d))
    .sort((a, b) => b - a);

  let streak = 0;
  let current = new Date();
  for (const date of sorted) {
    if (date.toDateString() === current.toDateString()) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else if (date.toDateString() === current.toDateString()) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

function renderCalendar(completedDates) {
  const calendarDiv = document.createElement('div');
  calendarDiv.className = 'calendar';

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const completedSet = new Set(completedDates);

  const grid = document.createElement('div');
  grid.className = 'calendar-grid';

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const cell = document.createElement('div');
    cell.className = 'day';
    cell.textContent = day;

    if (completedSet.has(date.toDateString())) {
      cell.classList.add('completed');
    }

    grid.appendChild(cell);
  }

  calendarDiv.appendChild(grid);
  return calendarDiv;
}

function getStickerByStreak(streak) {
  if (streak >= 30) return '👑';
  if (streak >= 14) return '🔥';
  if (streak >= 7) return '💎';
  if (streak >= 3) return '💪';
  return '⭐';
}

// Add new habit
habitForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = habitNameInput.value.trim();
  if (!name) return;

  habits.push({
    name,
    completions: [],
    stickers: []
  });

  habitNameInput.value = '';
  saveHabits();
  renderHabits();
});

renderHabits();
