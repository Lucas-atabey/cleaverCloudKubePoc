import express from 'express';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch'; // ou axios

const configPath = path.join(process.cwd(), 'public/config/config.json');
let BACKEND_URL = '';

const app = express();
const PORT = process.env.PORT || 3000;

try {
  const data = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(data);
  BACKEND_URL = config.BACKEND_URL || '';
  console.log('[config] BACKEND_URL chargé :', BACKEND_URL);
} catch (err) {
  console.error('[config] Erreur de lecture de config.json :', err);
}

app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());

app.get('/api/ping', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/ping`, {
      headers: {
        Authorization: req.headers.authorization || '',
      },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Erreur proxy GET /ping :', err);
    res.status(500).json({ error: `Backend failed to ping ${BACKEND_URL}/ping` });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Erreur proxy /register :', err);
    res.status(500).json({ error: 'Backend fetch failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Erreur proxy /login :', err);
    res.status(500).json({ error: 'Backend fetch failed' });
  }
});

// Proxy GET /api/todos (avec auth)
app.get('/api/todos', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/todos`, {
      headers: {
        Authorization: req.headers.authorization || '',
      },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Erreur proxy GET /todos :', err);
    res.status(500).json({ error: 'Backend fetch failed' });
  }
});

// Proxy POST /api/todos (avec auth)
app.post('/api/todos', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: req.headers.authorization || '',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Erreur proxy POST /todos :', err);
    res.status(500).json({ error: 'Backend fetch failed' });
  }
});

// Proxy PUT /api/todos/:id (avec auth)
app.put('/api/todos/:id', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/todos/${req.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: req.headers.authorization || '',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error(`Erreur proxy PUT /todos/${req.params.id} :`, err);
    res.status(500).json({ error: 'Backend fetch failed' });
  }
});

// Proxy DELETE /api/todos/:id (avec auth)
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/todos/${req.params.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: req.headers.authorization || '',
      },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error(`Erreur proxy DELETE /todos/${req.params.id} :`, err);
    res.status(500).json({ error: 'Backend fetch failed' });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
