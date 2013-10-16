//request the name of the server from the router
var net = require('net');


var router = process.argv[0];
var server = process.argv[1];
var file = process.argv[2];

var client = net.connect({path:router}, function() { //'connect' listener
  console.log('client connected to router: '+router);
  client.write(server);
});

var serverPath = '';
client.on('data', function(data) {
  console.log(data.toString());
  serverPath += data.toString();
});

client.on('end', function() {
  console.log('client disconnected from router: '+router);
  //recieved the address of the server and start request for file
  var client2 = net.connect({path:serverPath}, function() {
    console.log('client connected to server: '+server);
    var writeStream = fs.createWriteStream('file.txt');
    client2.on('data', function(data) {
      writeStream.pipe(data);
    });

    //send the file request to the server
    client2.write(file);
  });
});