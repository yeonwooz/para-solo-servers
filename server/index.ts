import http from 'http'
import express from 'express'
import { ExpressPeerServer, PeerServer } from 'peer'
import cors from 'cors'
import { Server, LobbyRoom } from 'colyseus'
import { monitor } from '@colyseus/monitor'
import { RoomType } from '../types/Rooms'
import authRouter from './routes/auth'
import chatRouter from './routes/chat'
// import { sequelize } from './DB/db'
import { config } from './envconfig'
// import socialRoutes from "@colyseus/social/express"

import { SkyOffice } from './rooms/Momstown'
import { connectDB, createCollection } from './DB/db'
const mongoose = require('mongoose')

const port = Number(process.env.PORT || 2567)
const app = express()

app.use(cors())
app.use(express.json())
// app.use(express.static('dist'))

// require('./models/index')
const server = http.createServer(app)
// const peerServer = ExpressPeerServer(server, {
//   path : '/peerServer'
// })
const gameServer = new Server({
  server,
})

// register room handlers
gameServer.define(RoomType.LOBBY, LobbyRoom)
gameServer.define(RoomType.PUBLIC, SkyOffice, {
  name: '전민동에 들어가기전',
  description: '동네 친구들을 만나보세요',
  password: null,
  autoDispose: false,
})
gameServer.define(RoomType.CUSTOM, SkyOffice).enableRealtimeListing()

/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/server/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);

// register colyseus monitor AFTER registering your room handlers
app.use('/colyseus', monitor())
app.use('/auth', authRouter)
app.use('/chat', chatRouter)

// const io = require('socket.io')(http)
// io.on('connection', (socket) => {
//   console.log('===socket', socket)
//   socket.on('join', async (gameId) => {
//     console.log('===gameId', gameId)
//   })
//   socket.on('message', (message) => {
//     console.log('===message', message)
//   })
// })
connectDB()
  .then((db) => {
    // console.log('init!', db)
    gameServer.listen(port)

    console.log(`Listening on ws://localhost:${port}`)
  })
  .catch(console.error)
