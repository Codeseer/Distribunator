//respond to requests for lookups

var net = require('net');
var endSequence = '\n';
var servers = {
  s1 : 'localhost:9001',
  s2 : 'localhost:9002'
};

var server = net.createServer(function(client) { //'connection' listener
  console.log('Routing for client ' + client.remoteAddress+':'+client.remotePort);
  var serverName = '';
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
    console.log('Routing complete for client ' + client.remoteAddress+':'+client.remotePort);
  });

});

server.listen(9000, function() { //'listening' listener
  console.log('router bound to port: 9000');
});