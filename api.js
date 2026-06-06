// Cloudflare KV API client
const API_BASE = '/api/db';
const AUTH_TOKEN = GAME_CONFIG.authToken;

async function apiCall(action, data = {}) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: AUTH_TOKEN, action, ...data })
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'API error');
  return json.data;
}

// Get all data
async function getDB() {
  try {
    return await apiCall('get');
  } catch (e) {
    return { tasks: [], signups: [], users: [], _version: 0 };
  }
}

// User: register
async function registerUser(username, password) {
  return apiCall('register', { username, password });
}

// User: login
async function loginUser(username, password) {
  return apiCall('login', { username, password });
}

// Save all data
async function saveAll(tasks, signups) {
  return apiCall('saveAll', { tasks, signups });
}

// Task CRUD
async function createTask(task) {
  return apiCall('create', { type: 'task', value: task });
}
async function updateTask(task) {
  return apiCall('update', { type: 'task', value: task });
}
async function deleteTask(id) {
  return apiCall('delete', { type: 'task', id });
}

// Signup CRUD
async function createSignup(signup) {
  return apiCall('create', { type: 'signup', value: signup });
}
async function updateSignup(signup) {
  return apiCall('update', { type: 'signup', value: signup });
}
async function deleteSignup(id) {
  return apiCall('delete', { type: 'signup', id });
}

// User: reset password (admin)
async function resetUserPassword(username, newPassword) {
  return apiCall('update', { type: 'user', subAction: 'resetPassword', value: { username, password: newPassword } });
}
