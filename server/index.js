const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Tokens map to user profiles for testing
const VALID_TOKENS = {
  'testtoken123': { id: '1', name: 'Juan Pérez', email: 'juan@ejemplo.com', rol: 'secretaria', doctor_id: '45' },
  'doctortoken': { id: '2', name: 'Dra. María', email: 'maria@ejemplo.com', rol: 'doctor', doctor_id: '2' }
};

function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = m[1];
  const user = VALID_TOKENS[token];
  if (!user) return res.status(401).json({ error: 'Invalid token' });
  req.user = user;
  next();
}

// In-memory messages store for testing
let messages = [
  { id: 'm1', from: '1', to: '2', content: 'Hola, ¿cómo estás?', createdAt: new Date(Date.now() - 3600 * 1000).toISOString(), read: false },
  { id: 'm2', from: '2', to: '1', content: 'Bien, gracias. ¿Y tú?', createdAt: new Date(Date.now() - 1800 * 1000).toISOString(), read: true }
];

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const u = req.user;
  // Return minimal profile plus optional metadata
  res.json({ id: String(u.id), name: u.name, email: u.email, rol: u.rol, doctor_id: String(u.doctor_id) });
});

app.post('/api/mensajes', authMiddleware, (req, res) => {
  const body = req.body || {};
  // Accept both English and Spanish payload shapes
  const from = body.from ?? body.emisorId ?? body.emisor ?? body.sender;
  const to = body.to ?? body.receptorId ?? body.receptor ?? body.receiver;
  const content = body.content ?? body.contenido ?? body.mensaje ?? body.text ?? body.body;

  if (!from || !to || !content) return res.status(400).json({ error: 'Missing fields: emisorId/receptorId/contenido (or from/to/content)' });
  const id = 'm' + Date.now();
  const msg = {
    id,
    // canonical internal shape
    from: String(from),
    to: String(to),
    content,
    createdAt: new Date().toISOString(),
    read: false,
    // also include Spanish-shaped fields in response for compatibility
    emisorId: String(from),
    receptorId: String(to),
    contenido: content
  };
  messages.push(msg);
  res.status(201).json(msg);
});

app.get('/api/mensajes/conversation/:user/:other', authMiddleware, (req, res) => {
  const { user, other } = req.params;
  const conv = messages.filter(m => (m.from === user && m.to === other) || (m.from === other && m.to === user));
  conv.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  res.json(conv);
});

app.get('/api/mensajes/user/:userId', authMiddleware, (req, res) => {
  const { userId } = req.params;
  const list = messages.filter(m => m.from === userId || m.to === userId);
  res.json(list);
});

app.patch('/api/mensajes/:id/read', authMiddleware, (req, res) => {
  const { id } = req.params;
  const msg = messages.find(m => m.id === id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  msg.read = true;
  res.json(msg);
});

app.listen(PORT, () => console.log(`Mock server listening on http://localhost:${PORT}`));
