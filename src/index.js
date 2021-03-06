const express=require('express')
const http = require('http')
const socketio = require('socket.io')
const app = express()
const Filter=require('bad-words')

const port =process.env.PORT || 3000
const path = require('path')

const { addMessagesToRoom ,removeRoom, getMessagesInRoom}=require('./utils/rooms')
const {generateMessage , generateLocationMessage}=require('./utils/messages')
const server = http.createServer(app)
const io = socketio(server)
const {addUser,removeUser,getUser,getUsersInRoom}= require('./utils/users')
const messages = require('./utils/messages')

const publicDirPath = path.join(__dirname,'../public')

app.use(express.static(publicDirPath))

io.on('connection', (socket)=>{

    console.log('New user connected!')

    socket.on('join',({ username, room }, callback)=>{

        const {error , user}=addUser({
            id : socket.id ,
            username,
            room
        })
        if(error) {
            return callback(error)
        }
        socket.join(user.room)
        
        const oldMessages = getMessagesInRoom(user.room)

        oldMessages.forEach(message => {
            socket.emit('message',message)
        })

        socket.emit('message',generateMessage('War Commander(Admin)',`Beep boop 🤖, ${username}!`))
        socket.broadcast.to(user.room).emit('message',generateMessage('War Commander(Admin)',`New Warrior ${username} joined from the front!✌`))
        addMessagesToRoom({
            room : user.room,
            username : 'War Commander(Admin)',
            message : `New Warrior ${username} joined from the front!✌`
        })
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUsersInRoom(user.room)
        })
        
        callback()

    })

    socket.on('sendMessage',(message, callback)=>{
        const filter= new Filter()
        const user=getUser(socket.id)
        io.to(user.room).emit('message',generateMessage(user.username,filter.clean(message)))
        addMessagesToRoom({
            room : user.room,
            username : user.username,
            message : filter.clean(message)
        })
        callback()
    })

    socket.on('sendLocation',(location,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${location.lattitude},${location.longitude}`))
        callback()
    })

    socket.on('disconnect',()=>{
        const user =removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message',generateMessage('War Commander(Admin)',`${(user.username)} has disconnected😥, uhh! did it sound that bad?🤣`))
            addMessagesToRoom({
                room : user.room,
                username : 'War Commander(Admin)',
                message : `${(user.username)} has disconnected😥, uhh! did it sound that bad?🤣`
            })
            if(getUsersInRoom(user.room).length === 0) {
                removeRoom(user.room)
            }
            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }
        
    })
})
 
server.listen(port,()=>{
    console.log('Listeing on port 3000')
})