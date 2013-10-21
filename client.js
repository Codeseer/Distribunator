//request the name of the server from the router
var net = require('net');
var endSequence = '\n'
args = {
  router:'localhost:9000',
  server:'s1',
  file:'server.js'
}

// print process.argv
process.argv.forEach(function(val, index, array) {
  if(val.indexOf('--') != -1){
    args[val.substr(2)] = array[index+1];
  }
});
console.log(args);


routerHost = args.router.split(':')[0];
routerPort = args.router.split(':')[1];

var client = net.createConnection(routerPort, routerHost, function() { //'connect' listener
  console.log('client connected to router: '+args.router);
  client.write(args.server+endSequence);
});

var serverPath = '';
client.on('data', function(data) {
  console.log(data.toString());
  serverPath += data.toString();
  if(serverPath.indexOf(endSequence) != -1) {
    client.end();
  }
});

client.on('end', function() {
  console.log('client disconnected from router: '+args.router);
  
  //recieved the address of the server and start request for file
  serverHost = serverPath.split(':')[0];
  serverPort = serverPath.split(':')[1];
  var client2 = net.createConnection(serverPort, serverHost, function() {
    console.log('client connected to server: '+args.server);
    var writeStream = fs.createWriteStream(args.file);
    client2.on('data', function(data) {
      writeStream.pipe(data);
    });

    //send the file request to the server
    client2.write(args.file + endSequence);
  });
});