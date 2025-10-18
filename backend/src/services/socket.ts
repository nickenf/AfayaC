import { Server } from 'socket.io'

export const connectSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-room', (room) => {
      socket.join(room)
      console.log('User joined room:', room)
    })

    socket.on('leave-room', (room) => {
      socket.leave(room)
      console.log('User left room:', room)
    })

    socket.on('chat-message', (data) => {
      io.to(data.room).emit('chat-message', data)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })
}