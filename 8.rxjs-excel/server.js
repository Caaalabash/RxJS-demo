const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

let uid = 0
const room = 'excel_room'

app.get('/', function(req, res){
  res.sendFile(__dirname + '/dist/index.html')
})

app.get('*.js', function(req, res) {
  res.sendFile(__dirname + '/dist/' + req.url)
})

io.on('connection', function(socket){
  console.log('a user connected')

  socket.join(room, function() {
    io.to(room).emit('uid', ++uid)
  })

  socket.on('disconnect', function() {
    console.log('a user disconnected')

    socket.leave(room, function() {
      io.to(room).emit('uid', --uid)
    })
  })

  socket.on('edit', function(data) {
    console.log(data)
    socket.broadcast.emit('sync', data)
  })
})

http.listen(3000, function(){
  console.log('listening on *:3000')
})
