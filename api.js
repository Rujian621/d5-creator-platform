// Cloudflare KV API client
const API_BASE = '/api/db';
const AUTH_TOKEN = 'd5-creator-2026';

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

// Get all data (tasks + signups)
async function getDB() {
  try {
    return await apiCall('get');
  } catch (e) {
    return { tasks: [], signups: [], _version: 0 };
  }
}

// Save all data (full state replacement - for admin)
async function saveAll(tasks, signups) {
  return apiCall('saveAll', { tasks, signups });
}

// Create a new task
async function createTask(task) {
  return apiCall('create', { type: 'task', value: task });
}

// Update a task
async function updateTask(task) {
  return apiCall('update', { type: 'task', value: task });
}

// Delete a task
async function deleteTask(id) {
  return apiCall('delete', { type: 'task', id });
}

// Create a signup
async function createSignup(signup) {
  return apiCall('create', { type: 'signup', value: signup });
}

// Update a signup (e.g., change status)
async function updateSignup(signup) {
  return apiCall('update', { type: 'signup', value: signup });
}
