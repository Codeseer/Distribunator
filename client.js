//request the name of the server from the router
var net = require('net');
var fs = require('fs');
var endSequence = '\n';
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

var bandwidthDataPoints = [];
client.on('end', function() {
  console.log('client disconnected from router: '+args.router);
  
  //recieved the address of the server and start request for file
  serverHost = serverPath.split(':')[0];
  serverPort = serverPath.split(':')[1];
  var transmissionStart = 0;
  var client2 = net.createConnection(serverPort, serverHost, function() {
    console.log('client connected to server: '+args.server);
    transmissionStart = new Date().getTime();
    var writeStream = fs.createWriteStream('downloads/'+args.file.split('/').pop());
    var fileSize = '';
    var dataRecieved = 0;
    var metadata = true;
    var oldTime = 0;
    bandwidthDataPoints = [];
    client2.on('data', function(data) {
      if(metadata) {
        fileSize += data;
        if(fileSize.indexOf(endSequence) != -1) {
          fileSize = fileSize.split(endSequence)[0];
          metadata = false;
          oldTime = process.hrtime()[1];
        }
      } else {
        var deltaTime = process.hrtime()[1] - oldTime;
        console.log(deltaTime);
        oldTime = process.hrtime()[1];
        bandwidthDataPoints.push(data.length/(deltaTime*1000000000));
        console.log(data.length/(1000000/deltaTime));
        dataRecieved += data.length;
        console.log(Math.round(100 * (dataRecieved/fileSize))+'%');
        writeStream.write(data);
      }
    });

    client2.on('end',function() {
      total = 0;
      bandwidthDataPoints.forEach(function(index, element, array){
        total+=element;
      });
      console.log(total);
      var bandwidthAverage = total/bandwidthDataPoints.length;
      var transmissionTime = new Date().getTime() - transmissionStart;
      console.log('Average Transfer Speed: '+bandwidthAverage+_' bytes/milisecond');
      console.log('Transmission Time: '+transmissionTime+' miliseconds');
      console.log('File '+args.file+' finished transfer from server: '+ args.server);
    });

    //send the file request to the server
    client2.write(args.file + endSequence);
  });
});