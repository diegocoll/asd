//------------------------------------------------------- UDP server

var dgram		= require("dgram");
var server	= dgram.createSocket("udp4");
var os			= require('os');

//------------------------------------ Funciones


function getIPAddress() {
  var interfaces = os.networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.address;
    }
  }
  return '127.0.0.1';
}

//------------------------------------ Variables

var PORT   = "4444";
var HOST   = "35.198.8.140";
//var HOST   = getIPAddress();

//------------------------------------ Servidor

server.on("error", function (err) {
	console.log("servidor error:\n" + err.stack);
	server.close();
});

server.on("message", function (reporte, remote) {

	console.log("reporte: " + reporte + " de " + remote.address + ":" + remote.port);

	//var reporte_str = reporte.toString();		//lo convierte en string (ver si conviene Mayuscula)

});

server.on("listening", function () {
	console.log("servidor corriendo " + HOST + ":" + PORT);
});

server.bind(PORT, HOST);
