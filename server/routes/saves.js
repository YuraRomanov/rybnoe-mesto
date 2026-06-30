import { Router } from 'express';
import { readJson, writeJson } from '../lib/storage.js';

const router = Router();
const SAVES_FILE = 'saves.json';

function getSaves() {
  return readJson(SAVES_FILE, {});
}

function saveAll(saves) {
  writeJson(SAVES_FILE, saves);
}

function requireAuth(req, res, next) {
  if (!req.session?.username) {
    return res.status(401).json({ ok: false, msg: 'Не авторизован' });
  }
  next();
}

router.get('/', requireAuth, (req, res) => {
  const saves = getSaves();
  const data = saves[req.session.username];
  if (!data) {
    return res.json({ ok: true, save: null });
  }
  res.json({ ok: true, save: data });
});

router.put('/', requireAuth, (req, res) => {
  const { player, discountEnd, tutorialSeen } = req.body || {};
  if (!player || typeof player !== 'object') {
    return res.status(400).json({ ok: false, msg: 'Некорректные данные сохранения' });
  }

  const saves = getSaves();
  saves[req.session.username] = {
    player,
    discountEnd: discountEnd ?? null,
    tutorialSeen: Boolean(tutorialSeen),
    updatedAt: Date.now(),
  };
  saveAll(saves);

  res.json({ ok: true });
});

export default router;
