import express from 'express';
import session from 'express-session';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import saveRoutes from './routes/saves.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const PORT = Number(process.env.PORT) || 3000;

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(session({
  name: 'rybnoe.sid',
  secret: process.env.SESSION_SECRET || 'rybnoe-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, app: 'rybnoe-mesto', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/save', saveRoutes);

app.use(express.static(publicDir));

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, msg: 'API не найден' });
  }
  res.status(404).send('Страница не найдена');
});

app.listen(PORT, () => {
  console.log(`Рыбное место: http://localhost:${PORT}`);
});
