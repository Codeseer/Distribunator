//respond to requests for files

//send files to clients

var net = require('net');

var server = net.createServer(function(client) { //'connection' listener
  console.log('Connected to client' + client.remoteAddress+':'+client.remotePort);
  var filePath = '';
  client.on('data', function(data){
    filePath += data.toString();
    //newline means the serverName is complete.
    if(filePath.indexOf('\n')) {
      filePath.replace('','\n');
      console.log('Sending file'+filePath+' to client -> '+client.remoteAddress+":"+client.remotePort);
      client.write(servers[serverName]);
    }    
  });
  
  client.on('end', function() {
    console.log('Routing complete for client' + client.remoteAddress+':'+client.remotePort);
  });

});

server.listen(process.argv[0], function() { //'listening' listener
  console.log('server bound to port: '+process.argv[0]);
});