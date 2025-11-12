const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const PORT = 8000;

// CORS important
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'API Gateway is running' });
});

// Proxy MANUEL pour /api/auth
app.use('/api/auth', (req, res) => {
  const options = {
    hostname: 'auth-service',
    port: 3003,
    path: req.originalUrl,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      ...req.headers
    }
  };

  console.log(`[GATEWAY] ${req.method} ${req.originalUrl} -> auth-service:3003${req.originalUrl}`);

  const proxyReq = http.request(options, (proxyRes) => {
    let data = '';
    
    proxyRes.on('data', (chunk) => {
      data += chunk;
    });
    
    proxyRes.on('end', () => {
      console.log(`[GATEWAY] Response from auth-service: ${proxyRes.statusCode}`);
      res.status(proxyRes.statusCode);
      
      // Copier les headers
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });
      
      res.send(data);
    });
  });
  
  proxyReq.on('error', (err) => {
    console.error('[GATEWAY] Proxy error:', err);
    res.status(500).json({ 
      message: 'Auth service error', 
      error: err.message 
    });
  });
  
  // Envoyer le body si présent
  if (req.body && Object.keys(req.body).length > 0) {
    proxyReq.write(JSON.stringify(req.body));
  }
  
  proxyReq.end();
});

// Proxy MANUEL pour /api/users
app.use('/api/users', (req, res) => {
  const options = {
    hostname: 'user-service',
    port: 3002,
    path: req.originalUrl,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      ...req.headers
    }
  };
  
  console.log(`[GATEWAY] ${req.method} ${req.originalUrl} -> user-service:3002${req.originalUrl}`);
  
  const proxyReq = http.request(options, (proxyRes) => {
    let data = '';
    
    proxyRes.on('data', (chunk) => {
      data += chunk;
    });
    
    proxyRes.on('end', () => {
      res.status(proxyRes.statusCode);
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });
      res.send(data);
    });
  });
  
  proxyReq.on('error', (err) => {
    console.error('[GATEWAY] Proxy error:', err);
    res.status(500).json({ 
      message: 'User service error', 
      error: err.message 
    });
  });
  
  if (req.body && Object.keys(req.body).length > 0) {
    proxyReq.write(JSON.stringify(req.body));
  }
  
  proxyReq.end();
});

app.listen(PORT, () => {
  console.log(`✅ API Gateway (Manual) running on port ${PORT}`);
});