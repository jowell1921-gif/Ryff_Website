import { io, Socket } from 'socket.io-client'

// Singleton: una sola conexión para toda la sesión
let socket: Socket | null = null

export const socketClient = {
  connect(token: string): Socket {
    if (socket?.connected) return socket

    socket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
    })

    return socket
  },

  disconnect(): void {
    socket?.disconnect()
    socket = null
  },

  get(): Socket | null {
    return socket
  },
}
