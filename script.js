// Simulación de datos en localStorage
const usersKey = 'gymflow_users';
const progressKey = 'gymflow_progress';
const routinesKey = 'gymflow_routines';

// Cargar ejercicios desde JSON
async function loadExercises() {
  try {
    const res = await fetch('exercises.json');
    return await res.json();
  } catch (e) {
    console.error("Error al cargar ejercicios:", e);
    // Datos de respaldo si no se puede cargar el JSON
    return [
      {"id": 1,"name": "Sentadilla","group": "Piernas","machine": "Barra","video": "#"},
      {"id": 2,"name": "Press de banca","group": "Pecho","machine": "Banco","video": "#"},
      {"id": 3,"name": "Remo con barra","group": "Espalda","machine": "Barra","video": "#"},
      {"id": 4,"name": "Flexiones","group": "Pecho","machine": "Peso corporal","video": "#"},
      {"id": 5,"name": "Zancadas","group": "Piernas","machine": "Peso corporal","video": "#"}
    ];
  }
}

// RF.1: Guardar perfil
document.getElementById('registerForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = {
    name: document.getElementById('name').value,
    age: document.getElementById('age').value,
    weight: document.getElementById('weight').value,
    height: document.getElementById('height').value,
    fitness: document.getElementById('fitness').value,
    goal: document.getElementById('goal').value
  };
  localStorage.setItem(usersKey, JSON.stringify([user]));
  alert('Perfil guardado exitosamente.');
  window.location.href = 'dashboard.html';
});

// RF.10: Buscar ejercicios
document.getElementById('searchInput')?.addEventListener('input', async () => {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const exercises = await loadExercises();
  const filtered = exercises.filter(
    e => e.name.toLowerCase().includes(query) || e.group.toLowerCase().includes(query)
  );
  const list = document.getElementById('exerciseList');
  list.innerHTML = filtered.map(e => `
    <div class="exercise-item">
      <h3>${e.name}</h3>
      <p>Grupo: ${e.group} | Máquina: ${e.machine}</p>
      <a href="${e.video}" target="_blank">Ver video</a>
    </div>
  `).join('');
});

// RF.3: Generar rutina personalizada
document.getElementById('generateRoutineBtn')?.addEventListener('click', async () => {
  const users = JSON.parse(localStorage.getItem(usersKey) || '[]');
  if (users.length === 0) {
    alert("Debes crear un perfil primero.");
    return;
  }
  const user = users[0];
  const exercises = await loadExercises();
  const goal = user.goal;
  let routine = [];

  // Filtrar ejercicios por objetivo
  if (goal === 'perder_peso') {
    routine = exercises.filter(e => e.group === 'Piernas' || e.group === 'Espalda');
  } else if (goal === 'ganar_musculo') {
    routine = exercises.filter(e => e.group === 'Pecho' || e.group === 'Espalda' || e.group === 'Piernas');
  } else {
    routine = [...exercises]; // Mantenimiento: todos los grupos
  }

  // Seleccionar 3 ejercicios aleatorios
  routine = routine.sort(() => 0.5 - Math.random()).slice(0, 3);

  // Agregar series y repeticiones según nivel
  routine = routine.map(e => ({
    ...e,
    sets: user.fitness === 'principiante' ? 2 : user.fitness === 'intermedio' ? 3 : 4,
    reps: user.fitness === 'principiante' ? 8 : user.fitness === 'intermedio' ? 10 : 12
  }));

  // Guardar rutina generada
  localStorage.setItem(routinesKey, JSON.stringify(routine));

  // Mostrar rutina en pantalla
  renderRoutine(routine);
});

function renderRoutine(routine) {
  const display = document.getElementById('routineDisplay');
  if (!routine || routine.length === 0) {
    display.innerHTML = '<p>No hay rutina generada aún.</p>';
    return;
  }
  display.innerHTML = `
    <h3>Tu Rutina Personalizada</h3>
    <ul>
      ${routine.map(e => `
        <li>
          <strong>${e.name}</strong> (${e.group}) - ${e.sets} series x ${e.reps} repeticiones
          <a href="${e.video}" target="_blank">Ver video</a>
        </li>
      `).join('')}
    </ul>
  `;
}

// Cargar rutina al cargar la página de rutinas
window.addEventListener('load', async () => {
  if (window.location.pathname.includes('routines.html')) {
    const routine = JSON.parse(localStorage.getItem(routinesKey) || '[]');
    if (routine.length > 0) {
      renderRoutine(routine);
    }
  }
  if (window.location.pathname.includes('progress.html')) {
    renderProgress();
  }
});

// RF.4: Registrar progreso
document.getElementById('progressForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const entry = {
    name: document.getElementById('name').value,
    date: document.getElementById('date').value,
    weight: document.getElementById('weight').value,
    reps: document.getElementById('reps').value,
    sets: document.getElementById('sets').value
  };
  let progress = JSON.parse(localStorage.getItem(progressKey) || '[]');
  progress.push(entry);
  localStorage.setItem(progressKey, JSON.stringify(progress));
  renderProgress();
  document.getElementById('progressForm').reset(); // Limpiar formulario
});

function renderProgress() {
  const progress = JSON.parse(localStorage.getItem(progressKey) || '[]');
  const display = document.getElementById('progressDisplay');
  if (progress.length === 0) {
    display.innerHTML = '<p>No hay registros de progreso aún.</p>';
    return;
  }
  display.innerHTML = `
    <h3>Historial de Progreso</h3>
    <ul>
      ${progress.map(p => `
        <li>${p.date} - Peso: ${p.weight} kg | ${p.sets}x${p.reps}</li>
      `).join('')}
    </ul>
  `;
}

// RF.8: Notificaciones simuladas
window.addEventListener('load', () => {
  const notifications = document.getElementById('notifications');
  if (notifications) {
    // Simular notificación si hay progreso registrado
    const progress = JSON.parse(localStorage.getItem(progressKey) || '[]');
    if (progress.length >= 2) {
      notifications.innerHTML = '<p>¡Felicidades! Has completado 2 días de entrenamiento. ¡Sigue así!</p>';
    }
  }
});