//respond to requests for lookups

var net = require('net');
var endSequence = '\n';
var servers = {};

var server = net.createServer(function(client) { //'connection' listener
  console.log('Routing for client ' + client.remoteAddress+':'+client.remotePort);
  var serverName = '';
  var startTime = new Date().getTime();
  client.on('data', function(data){
    serverName += data.toString();
    //newline means the serverName is complete.
    if(serverName.indexOf(endSequence) != -1) {      
      serverName = serverName.replace(endSequence,'');
      console.log('Finished lookup for server: '+serverName);
      console.log('Sending data to client -> '+client.remoteAddress+":"+client.remotePort);
      client.write(servers[serverName]+endSequence);
    }    
  });

  client.on('end', function() {
    console.log('lookup time: '+(new Date().getTime() - startTime)+' miliseconds');
    console.log('Routing complete for client ' + client.remoteAddress+':'+client.remotePort);
  });
});

server.listen(9000, function() { //'listening' listener
  console.log('router bound to port: 9000');
});

var registerServer = net.createServer(function(client) { //'connection' listener
  console.log('Adding server ' + client.remoteAddress+':'+client.remotePort);
  var metadata = '';
  client.on('data', function(data){
    metadata += data.toString();
    //newline means the serverName is complete.
    if(metadata.indexOf(endSequence,metadata.indexOf(endSequence)+1) != -1) {      
      serverName = metadata.split(endSequence)[0];
      serverAddress = metadata.split(endSequence)[1];
      console.log('Registered server: '+serverName);
      console.log('With address '+serverAddress);
      servers[serverName] = serverAddress;
      client.end();
    }
  });
});

registerServer.listen(1337, function(){
  console.log('router lookup registery bound to port: 1337');
});