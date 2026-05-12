// Cliente WebSocket para Chatsito
// Maneja conexión, envío y recepción de mensajes en tiempo real
// Integración con Google OAuth para autenticación

let ws;
let currentUsername = '';

// Función para decodificar el token JWT de Google
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

// Función callback de Google Sign-In
function handleGoogleLogin(response) {
  try {
    // Decodificar el token JWT
    const payload = parseJwt(response.credential);
    
    // Extraer datos del usuario de Google
    const googleName = payload.name;
    const googleEmail = payload.email;
    const googlePicture = payload.picture;
    
    console.log('Usuario autenticado con Google:', googleName, googleEmail);
    
    // Ocultar pantalla de login y mostrar chat
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('chatContainer').style.display = 'block';
    
    // Conectar al servidor WebSocket con el nombre de Google
    conectarWebSocket(googleName);
    
  } catch (error) {
    console.error('Error al procesar login de Google:', error);
    addSystemMessage('Error al autenticar con Google');
  }
}

// Función para ingresar como invitado
function handleGuestLogin() {
  // Generar nombre temporal aleatorio
  const randomId = Math.floor(Math.random() * 10000);
  const guestName = `Invitado_${randomId}`;
  
  console.log('Usuario ingresando como invitado:', guestName);
  
  // Ocultar pantalla de login y mostrar chat
  document.getElementById('loginContainer').style.display = 'none';
  document.getElementById('chatContainer').style.display = 'block';
  
  // Conectar al servidor WebSocket con nombre de invitado
  conectarWebSocket(guestName);
}

// Función para conectar al servidor WebSocket
function conectarWebSocket(nombre) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${window.location.host}`);
  
  ws.onopen = () => {
    console.log('Conectado al servidor WebSocket');
    
    // Enviar nombre de usuario al servidor
    ws.send(JSON.stringify({
      type: 'login',
      username: nombre
    }));
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleMessage(data);
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
    }
  };
  
  ws.onclose = () => {
    console.log('Desconectado del servidor');
    addSystemMessage('Desconectado del servidor. Reconectando...');
    
    // Intentar reconectar después de 3 segundos
    setTimeout(() => conectarWebSocket(nombre), 3000);
  };
  
  ws.onerror = (error) => {
    console.error('Error en WebSocket:', error);
    addSystemMessage('Error de conexión');
  };
}

// Manejar diferentes tipos de mensajes
function handleMessage(data) {
  switch (data.type) {
    case 'username':
      // Recibir nombre de usuario asignado
      currentUsername = data.username;
      document.getElementById('currentUsername').textContent = currentUsername;
      addSystemMessage(`Conectado como ${currentUsername}`);
      console.log(`Nombre de usuario asignado: ${currentUsername}`);
      break;
      
    case 'chat':
      // Mensaje de chat
      addChatMessage(data.username, data.message, data.timestamp);
      break;
      
    case 'system':
      // Mensaje del sistema
      addSystemMessage(data.message);
      break;
      
    case 'history':
      // Historial de mensajes
      displayHistory(data.messages);
      break;
  }
}

// Agregar mensaje de chat a la interfaz
function addChatMessage(username, message, timestamp) {
  const messagesContainer = document.getElementById('messages');
  const messageDiv = document.createElement('div');
  
  const isOwn = username === currentUsername;
  messageDiv.className = `message ${isOwn ? 'own' : 'other'}`;
  
  const time = new Date(timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  messageDiv.innerHTML = `
    <div class="message-header">${username} - ${time}</div>
    <div class="message-text">${escapeHtml(message)}</div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

// Agregar mensaje del sistema
function addSystemMessage(message) {
  const messagesContainer = document.getElementById('messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'system-message';
  messageDiv.textContent = message;
  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

// Mostrar historial de mensajes
function displayHistory(messages) {
  const messagesContainer = document.getElementById('messages');
  messagesContainer.innerHTML = '';
  
  messages.forEach(msg => {
    addChatMessage(msg.username, msg.message, msg.timestamp);
  });
  
  addSystemMessage('--- Historial cargado ---');
}

// Enviar mensaje al servidor
function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (message && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'chat',
      message: message
    }));
    input.value = '';
  }
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Scroll al final del chat
function scrollToBottom() {
  const messagesContainer = document.getElementById('messages');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Event listeners
document.getElementById('guestButton').addEventListener('click', handleGuestLogin);

document.getElementById('sendButton').addEventListener('click', sendMessage);

document.getElementById('messageInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});
