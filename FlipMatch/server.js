// Create server
let port = process.env.PORT || 8000;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function () {
  console.log('Server listening at port: ', port);
});

// Tell server where to look for files
app.use(express.static('public'));

// Create socket connection
let io = require('socket.io').listen(server);

// Clients in the output namespace
var outputs = io.of('/output');
// Listen for output clients to connect
outputs.on('connection', function (socket) {
  console.log('Output connected: ' + socket.id);
  
  socket.on('update', function (data) {
    let update = {
      id: 'output',
      data: data
    }
    
    inputs.emit('update', update);
    console.log(update.data.ind);
  });

  // Listen for this output client to disconnect
  socket.on('disconnect', function () {
    console.log("Output disconnected " + socket.id);
  });
});

// Clients in the input namespace
let inputs = io.of('/input');
// Listen for input clients to connect
inputs.on('connection', function (socket) {
  console.log('Input connected: ' + socket.id);
  outputs.emit('input', {id: socket.id}); // Let output know you connect

  // Listen for data messages
  socket.on('tilt', function (data) {
    // Data comes in as whatever was sent, including objects
    // console.log("Received: 'message' " + data);

    // Wrap up data in message
    let tilt = {
      id: socket.id,
      data: data
    }

    // Send data to all clients
    inputs.emit('tilt', tilt);
    outputs.emit('tilt', tilt);
  });
  
  socket.on('match', function (data) {
    let match = {
      id: socket.id,
      data: data
    }
    
    outputs.emit('match', match);
  })

  // Listen for this input client to disconnect
  // Tell all clients, this input client disconnected
  socket.on('disconnect', function () {
    console.log("Client has disconnected " + socket.id);
    inputs.emit('disconnected', socket.id);
    outputs.emit('disconnected', socket.id);
  });
});
