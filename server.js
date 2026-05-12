// Servidor WebSocket para Chat Colaborativo
// Maneja múltiples conexiones simultáneas y difunde mensajes en tiempo real

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const Database = require('./database');

// Inicializar base de datos
const db = new Database();

// Crear servidor HTTP para servir archivos estáticos
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error del servidor');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.url === '/style.css') {
    fs.readFile(path.join(__dirname, 'public', 'style.css'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error del servidor');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(data);
    });
  } else if (req.url === '/client.js') {
    fs.readFile(path.join(__dirname, 'public', 'client.js'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error del servidor');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('No encontrado');
  }
});

// Crear servidor WebSocket
const wss = new WebSocket.Server({ server });

// Almacenar clientes conectados
const clients = new Map();
let userIdCounter = 1;

// Cuando un cliente se conecta
wss.on('connection', (ws) => {
  let clientData = { id: userIdCounter++, username: null };
  
  // Guardar cliente temporalmente
  clients.set(ws, clientData);
  
  // Cuando se recibe un mensaje del cliente
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'login') {
        // Procesar login: usar nombre proporcionado o generar temporal
        const desiredUsername = message.username ? message.username.trim() : '';
        
        if (desiredUsername) {
          // Usar el nombre proporcionado por el usuario
          clientData.username = desiredUsername;
        } else {
          // Asignar nombre temporal
          clientData.username = `Usuario_${clientData.id}`;
        }
        
        console.log(`${clientData.username} se ha conectado`);
        
        // Enviar nombre de usuario al cliente
        ws.send(JSON.stringify({
          type: 'username',
          username: clientData.username
        }));
        
        // Notificar a todos que un usuario se unió
        broadcast({
          type: 'system',
          message: `${clientData.username} se ha unido al chat`
        }, ws);
        
        // Enviar historial de mensajes al nuevo cliente
        db.getMessages((err, history) => {
          if (!err && history) {
            ws.send(JSON.stringify({
              type: 'history',
              messages: history
            }));
          }
        });
        
      } else if (message.type === 'chat') {
        const client = clients.get(ws);
        
        // Si el cliente no tiene nombre, ignorar el mensaje
        if (!client || !client.username) {
          return;
        }
        
        const chatMessage = {
          username: client.username,
          message: message.message,
          timestamp: new Date().toISOString()
        };
        
        // Guardar en base de datos (asíncrono)
        db.addMessage(chatMessage);
        
        // Difundir a todos los clientes
        broadcast({
          type: 'chat',
          username: client.username,
          message: message.message,
          timestamp: chatMessage.timestamp
        });
      }
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
    }
  });
  
  // Cuando un cliente se desconecta
  ws.on('close', () => {
    const client = clients.get(ws);
    if (client) {
      console.log(`${client.username} se ha desconectado`);
      
      // Notificar a todos que un usuario se fue
      broadcast({
        type: 'system',
        message: `${client.username} se ha desconectado`
      });
      
      // Eliminar cliente
      clients.delete(ws);
    }
  });
  
  // Manejar errores
  ws.on('error', (error) => {
    console.error('Error en WebSocket:', error);
  });
});

// Función para difundir mensaje a todos los clientes
function broadcast(message, excludeWs = null) {
  const messageStr = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== excludeWs) {
      client.send(messageStr);
    }
  });
}

// Función para obtener la IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Iniciar servidor
const PORT = 3000;
const HOST = '0.0.0.0'; // Aceptar conexiones de cualquier IP
const localIP = getLocalIP();

server.listen(PORT, HOST, () => {
  console.log('='.repeat(50));
  console.log('💬 Chat Colaborativo - Servidor Iniciado');
  console.log('='.repeat(50));
  console.log(`Conexión local: http://localhost:${PORT}`);
  console.log(`Conexión remota: http://${localIP}:${PORT}`);
  console.log('='.repeat(50));
  console.log('WebSocket listo para conexiones');
  console.log('='.repeat(50));
});
