import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { readJson, writeJson } from '../lib/storage.js';

const router = Router();
const USERS_FILE = 'users.json';

function getUsers() {
  return readJson(USERS_FILE, {});
}

function saveUsers(users) {
  writeJson(USERS_FILE, users);
}

function normalizeName(username) {
  return String(username || '').trim();
}

router.post('/register', async (req, res) => {
  const name = normalizeName(req.body?.username);
  const password = String(req.body?.password || '');

  if (name.length < 2) {
    return res.status(400).json({ ok: false, msg: 'Имя минимум 2 символа' });
  }
  if (password.length < 4) {
    return res.status(400).json({ ok: false, msg: 'Пароль минимум 4 символа' });
  }

  const users = getUsers();
  if (users[name]) {
    return res.status(409).json({ ok: false, msg: 'Такой рыбак уже есть' });
  }

  users[name] = {
    passHash: await bcrypt.hash(password, 10),
    created: Date.now(),
  };
  saveUsers(users);

  res.json({ ok: true, username: name });
});

router.post('/login', async (req, res) => {
  const name = normalizeName(req.body?.username);
  const password = String(req.body?.password || '');
  const remember = Boolean(req.body?.remember);
  const users = getUsers();
  const user = users[name];

  if (!user) {
    return res.status(401).json({ ok: false, msg: 'Рыбак не найден' });
  }

  const valid = await bcrypt.compare(password, user.passHash);
  if (!valid) {
    return res.status(401).json({ ok: false, msg: 'Неверный пароль' });
  }

  req.session.username = name;
  if (remember) {
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
  } else {
    req.session.cookie.maxAge = null;
  }

  res.json({ ok: true, username: name });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.session?.username) {
    return res.status(401).json({ ok: false, msg: 'Не авторизован' });
  }
  res.json({ ok: true, username: req.session.username });
});

router.get('/users', (_req, res) => {
  const users = Object.keys(getUsers());
  res.json({ ok: true, users });
});

export default router;
