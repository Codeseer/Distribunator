//respond to requests for files

//send files to clients

var net = require('net');
var fs = require('fs');

var endSequence = '\n'

args = {
  server:'s1',
  router:'localhost:1337'
}

// print process.argv
process.argv.forEach(function(val, index, array) {
  if(val.indexOf('--') != -1){
    args[val.substr(2)] = array[index+1];
  }
});


routerHost = args.router.split(':')[0];
routerPort = args.router.split(':')[1];



remoteAddress = '';
remotePort = '';
var server = net.createServer(function(client) { //'connection' listener
  console.log('Connected to client' + client.remoteAddress+':'+client.remotePort);

  remoteAddress = client.remoteAddress;
  remotePort = client.remotePort;

  var filePath = '';
  client.on('data', function(data){
    filePath += data.toString();
    //newline means the serverName is complete.
    if(filePath.indexOf(endSequence) != -1) {
      filePath = filePath.replace(endSequence,'');
      console.log('Sending file '+filePath+' to client -> '+client.remoteAddress+":"+client.remotePort);
      fs.stat(filePath, function (err, stats) {
        client.write(stats.size+endSequence);      
        console.log('reading from file '+filePath);
        var readStream = fs.createReadStream(filePath);
        readStream.pipe(client);
      });
    }    
  });
  client.on('end', function() {
    console.log('Serving complete for client' + remoteAddress+':'+remotePort);
  });

});

server.listen(function() { //'listening' listener
  console.log('server bound to: '+server.address().address+':'+server.address().port);
    //send the router a registration request.
  client2 = net.createConnection(routerPort, routerHost, function(){
    client2.write(args.server+endSequence+server.address().address+':'+server.address().port+endSequence);
    client2.on('end', function(){
      console.log('Successfully registered with router');
    });
  });
});