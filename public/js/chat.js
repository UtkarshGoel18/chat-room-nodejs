var socket = io()

//elements
const $messages=document.querySelector('#messages')

//templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//Options
const {username , room}=Qs.parse(location.search, { ignoreQueryPrefix : true})

const autoScroll=()=>{
    // new message
    const $newMessage = $messages.lastElementChild

    // grab its margin
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)

    // grab its total height
    const newMessageHeight = $newMessage.offsetHeight+newMessageMargin

    // grab the visible height
    const visibleHeight= $messages.offsetHeight

    // grab the total scrolling height
    const containerHeight = $messages.scrollHeight

    // how far have we scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
         $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message)=>{
    // console.log(message)
    const html= Mustache.render(messageTemplate,{
        message : message.text,
        createdAt : moment(message.createdAt).format('ddd, h:m a'),
        username : message.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()

})
socket.on('locationMessage', (message)=>{
    // console.log(message)
    const html = Mustache.render(locationTemplate,{
        url : message.url,
        createdAt : moment(message.createdAt).format('ddd, h:m a'),
        username : message.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({ room, users})=>{
     const html = Mustache.render(sidebarTemplate,{
         room,
         users
     })
     document.querySelector('#sidebar').innerHTML=html
})



document.querySelector('#message-form').addEventListener('submit', (e)=>{
    e.preventDefault()
    const message=e.target.elements.message.value
    if(message.length!=0) {
        socket.emit('sendMessage',message,()=>{
            console.log('Delivered!')
            e.target.elements.message.value=''
            e.target.elements.message.focus()
        })
        
    }
})


document.querySelector('#send-location').addEventListener('click',()=>{
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    document.querySelector('#send-location').setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        const location = {
            lattitude : position.coords.latitude,
            longitude : position.coords.longitude
        }
        socket.emit('sendLocation',location, ()=>{
            console.log('Location Shared!')
            document.querySelector('#send-location').removeAttribute('disabled')
        })
    })
})

socket.emit('join',{
    username,
    room
}, (error)=>{
    if(error){
    alert(error)
    location.href = '/'
    }

})
