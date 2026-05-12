/**
 * Cloudflare Pages Function — /api/db
 * KV binding: DB_KV → d5-creator-db
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const AUTH_TOKENS = ['d5-creator-2026', 'xhsrj2026-auth'];

async function getDB(env) {
  const raw = await env.DB_KV.get('db');
  if (!raw) return { tasks: [], signups: [], users: [], _version: 0 };
  try { const d = JSON.parse(raw); if (!d.users) d.users = []; return d; }
  catch { return { tasks: [], signups: [], users: [], _version: 0 }; }
}

async function saveDB(env, data) {
  data._version = (data._version || 0) + 1;
  await env.DB_KV.put('db', JSON.stringify(data));
  return data;
}

function simpleHash(s) { return btoa(unescape(encodeURIComponent(s))); }

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // GET — 读取所有数据
  if (request.method === 'GET') {
    const data = await getDB(env);
    return new Response(JSON.stringify(data), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }

  // POST — 各种操作
  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
        status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    if (!AUTH_TOKENS.includes(body.token)) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    const db = await getDB(env);
    const action = body.action;

    try {
      switch (action) {
        case 'get': {
          return new Response(JSON.stringify({ ok: true, data: db }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }

        // ---- 用户相关 ----
        case 'register': {
          const { username, password } = body;
          if (!username || !password) {
            return new Response(JSON.stringify({ ok: false, error: '用户名和密码不能为空' }), {
              status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
          }
          if (password.length < 6) {
            return new Response(JSON.stringify({ ok: false, error: '密码至少6位' }), {
              status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
          }
          const exists = (db.users || []).find(u => u.username.toLowerCase() === username.toLowerCase());
          if (exists) {
            return new Response(JSON.stringify({ ok: false, error: '用户名已存在' }), {
              status: 409, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
          }
          const user = { username, password: simpleHash(password), createdAt: Date.now() };
          db.users = db.users || [];
          db.users.push(user);
          await saveDB(env, db);
          return new Response(JSON.stringify({ ok: true, data: { username } }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }

        case 'login': {
          const { username, password } = body;
          const user = (db.users || []).find(u => u.username.toLowerCase() === username.toLowerCase());
          if (!user) {
            return new Response(JSON.stringify({ ok: false, error: '用户名不存在' }), {
              status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
          }
          if (user.password !== simpleHash(password)) {
            return new Response(JSON.stringify({ ok: false, error: '密码错误' }), {
              status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
          }
          return new Response(JSON.stringify({ ok: true, data: { username: user.username } }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }

        // ---- 数据操作 ----
        case 'create': {
          const { type, value } = body;
          if (!value.id) value.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
          if (!value.createdAt) value.createdAt = Date.now();
          if (type === 'task') {
            db.tasks = (db.tasks || []).filter(t => t.id !== value.id);
            db.tasks.push(value);
          } else if (type === 'signup') {
            db.signups = (db.signups || []).filter(s => s.id !== value.id);
            db.signups.push(value);
          }
          const saved = await saveDB(env, db);
          return new Response(JSON.stringify({ ok: true, data: saved }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }

        case 'update': {
          const { type, value } = body;
          if (type === 'task') {
            const idx = (db.tasks || []).findIndex(t => t.id === value.id);
            if (idx >= 0) Object.assign(db.tasks[idx], value);
          } else if (type === 'signup') {
            const idx = (db.signups || []).findIndex(s => s.id === value.id);
            if (idx >= 0) Object.assign(db.signups[idx], value);
          } else if (type === 'user' && body.subAction === 'resetPassword') {
            const idx = (db.users || []).findIndex(u => u.username === value.username);
            if (idx >= 0) {
              db.users[idx].password = simpleHash(value.password);
            }
          }
          const saved = await saveDB(env, db);
          return new Response(JSON.stringify({ ok: true, data: saved }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }

        case 'delete': {
          const { type, id } = body;
          if (type === 'task') {
            db.tasks = (db.tasks || []).filter(t => t.id !== id);
            db.signups = (db.signups || []).filter(s => s.taskId !== id);
          } else if (type === 'signup') {
            db.signups = (db.signups || []).filter(s => s.id !== id);
          }
          const saved = await saveDB(env, db);
          return new Response(JSON.stringify({ ok: true, data: saved }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }

        case 'saveAll': {
          const { tasks, signups } = body;
          db.tasks = tasks || [];
          db.signups = signups || [];
          const saved = await saveDB(env, db);
          return new Response(JSON.stringify({ ok: true, data: saved }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }

        default:
          return new Response(JSON.stringify({ ok: false, error: 'Unknown action: ' + action }), {
            status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
      }
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message }), {
        status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Not found', { status: 404, headers: CORS_HEADERS });
}
