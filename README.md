# Chat Colaborativo - WebSocket

Sistema de chat colaborativo en tiempo real utilizando el protocolo WebSocket para comunicación bidireccional persistente entre múltiples usuarios.

## Características

- ✅ Comunicación en tiempo real mediante WebSocket
- ✅ Múltiples conexiones simultáneas
- ✅ Nombres de usuario temporales automáticos (Usuario_123)
- ✅ Notificaciones de conexión/desconexión de usuarios
- ✅ Historial de mensajes persistente en base de datos
- ✅ Interfaz web moderna y responsiva
- ✅ Sin polling ni long-polling (solo WebSocket)

## Stack Tecnológico

- **Backend:** Node.js + ws (biblioteca WebSocket)
- **Frontend:** HTML5 + CSS3 + JavaScript (vanilla)
- **Base de Datos:** SQLite (better-sqlite3)
- **Comunicación:** WebSocket exclusivamente

## Instalación

### Requisitos previos

- Node.js (v14 o superior)
- npm (viene con Node.js)

### Pasos de instalación

1. Clonar o descargar el repositorio
2. Navegar al directorio del proyecto:
   ```bash
   cd chatsito
   ```
3. Instalar dependencias:
   ```bash
   npm install
   ```

## Ejecución

### Iniciar el servidor

```bash
npm start
```

El servidor se iniciará en `http://0.0.0.0:3000`

### Conexiones Locales

1. Abrir un navegador web y navegar a `http://localhost:3000`
2. Ingresar tu nombre (opcional) o dejar vacío para nombre automático
3. Hacer clic en "Unirse al Chat"
4. Abrir otra pestaña para simular otro usuario

### Conexiones Remotas

El servidor detecta y muestra automáticamente la IP local al iniciar. Verás algo como:

```
==================================================
💬 Chat Colaborativo - Servidor Iniciado
==================================================
Conexión local: http://localhost:3000
Conexión remota: http://192.168.1.XX:3000
==================================================
```

Desde otro dispositivo en la misma red, usa la IP mostrada (ej: `http://192.168.1.XX:3000`)

Para acceso desde internet: Configurar firewall/port forwarding en el puerto 3000

## Estructura del Proyecto

```
chatsito/
├── server.js          # Servidor WebSocket
├── database.js        # Manejo de SQLite
├── package.json       # Dependencias del proyecto
├── chat.db            # Base de datos SQLite (se crea automáticamente)
├── public/
│   ├── index.html     # Interfaz del cliente
│   ├── style.css      # Estilos CSS
│   └── client.js      # Lógica del cliente WebSocket
└── README.md          # Esta documentación
```

## Funcionamiento

### Servidor (server.js)

- Crea servidor HTTP para servir archivos estáticos
- Inicia servidor WebSocket en el puerto 3000
- Maneja múltiples conexiones simultáneas
- Asigna nombres de usuario temporales (Usuario_123)
- Difunde mensajes a todos los clientes conectados
- Notifica cuando un usuario se une o desconecta
- Guarda mensajes en base de datos SQLite

### Cliente (client.js)

- Se conecta al servidor WebSocket
- Recibe nombre de usuario asignado
- Envía y recibe mensajes en tiempo real
- Muestra historial de mensajes
- Maneja reconexión automática
- Interfaz interactiva con input y botón de envío

### Base de Datos (database.js)

- SQLite para persistencia local
- Guarda mensajes con timestamp
- Recupera historial completo
- No requiere configuración de servidor

## Especificaciones Técnicas

- **Protocolo:** WebSocket exclusivamente (sin polling)
- **Persistencia:** SQLite en archivo local
- **Autenticación:** Nombres temporales automáticos
- **Interfaz:** Web responsive
- **Concurrencia:** Múltiples conexiones simultáneas

## Notas para el Docente

- El código es simple y fácil de explicar
- Solo requiere `npm install` y `npm start`
- No requiere configuración adicional
- La base de datos se crea automáticamente
- Puedes abrir múltiples pestañas para simular varios usuarios
- Los mensajes persisten aunque reinicies el servidor

## Capturas Requeridas

Para la entrega, preparar:
1. Captura del tablero Trello/Notion
2. Captura del repositorio Git
3. Captura del chat funcionando con múltiples usuarios
4. Links del tablero y del repositorio

## Autores

Proyecto desarrollado para el curso de [Nombre del Curso]
