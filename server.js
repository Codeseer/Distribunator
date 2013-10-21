//respond to requests for files

//send files to clients

var net = require('net');
var fs = require('fs');

var endSequence = '\n'

var server = net.createServer(function(client) { //'connection' listener
  console.log('Connected to client' + client.remoteAddress+':'+client.remotePort);
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
    console.log('Serving complete for client' + client.remoteAddress+':'+client.remotePort);
  });

});

server.listen(process.argv[2], function() { //'listening' listener
  console.log('server bound to port: '+process.argv[2]);
});