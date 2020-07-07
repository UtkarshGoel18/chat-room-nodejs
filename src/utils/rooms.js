const {generateMessage}=require('./messages')

const rooms=[]


const addMessagesToRoom = ({ room,username, message })=>{
    room=room.trim().toLowerCase()
    const existroom = rooms.find((individualRoom)=>{
        return individualRoom.name === room
    })
    if(existroom) {
        if(existroom.messages.length >= 1000)
        existroom.messages.splice(0,1)
        return existroom.messages.push(generateMessage(username,message))
    }
    if(message) {
        const newRoom={
            name : room,
            messages :[
                generateMessage(username,message)
            ]
        }
        return rooms.push(newRoom)

    }
    const newRoom={
        name : room,
        messages :[]
        
    }
    return rooms.push(newRoom)
}

const removeRoom = (room)=>{
    room=room.trim().toLowerCase()
    const existroomIndex = rooms.findIndex((individualRoom)=>{
        return individualRoom.name === room
    })
    rooms.splice(existroomIndex,1)

}

const getMessagesInRoom = (room)=>{
    room=room.trim().toLowerCase()
    const existroom = rooms.find((individualRoom)=>{
        return individualRoom.name === room
    })
    if(existroom) {
        return existroom.messages
    }
    return []
}

module.exports={
    addMessagesToRoom,
    removeRoom,
    getMessagesInRoom
}








// const r1 = {
//     name : 'first',
//     messages : []
// }

// const r2 = {
//     name : 'second',
//     messages : [
//         generateMessage('user1','msg1')
//     ]
// }

// const r3 = {
//     name : 'third',
//     messages : [
//         generateMessage('user1','msg1'),
//         generateMessage('user2','msg2')
//     ]
// }

// rooms.push(r1)
// rooms.push(r2)
// rooms.push(r3)

// addMessagesToRoom({
//     room : 'fourth',
//     username : 'user1',
//     message : ''
// })

// addMessagesToRoom({
//     room : 'third',
//     username : 'user1',
//     message : 'msg3'
// })

// console.log(rooms)