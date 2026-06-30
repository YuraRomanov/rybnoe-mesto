async function api(path, { method = 'GET', body } = {}) {
  try {
    const res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, msg: data.msg || 'Ошибка сервера', status: res.status };
    }
    return { ok: true, ...data };
  } catch {
    return { ok: false, msg: 'Сервер недоступен. Запустите: npm start' };
  }
}

async function registerUser(username, password) {
  return api('/auth/register', { method: 'POST', body: { username, password } });
}

async function loginUser(username, password, remember) {
  const r = await api('/auth/login', { method: 'POST', body: { username, password, remember } });
  if (r.ok) return { ok: true, username: r.username };
  return r;
}

async function logoutUser() {
  return api('/auth/logout', { method: 'POST' });
}

async function fetchMe() {
  const r = await api('/auth/me');
  return r.ok ? r : null;
}

async function listSavedUsers() {
  const r = await api('/auth/users');
  return r.ok ? r.users : [];
}

async function fetchSave() {
  const r = await api('/save');
  if (!r.ok) return null;
  return r.save;
}

async function putSave(payload) {
  return api('/save', { method: 'PUT', body: payload });
}
