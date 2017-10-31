require('./check-versions')()

var config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.dev.conf')

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()
var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

var uri = 'http://localhost:' + port

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})

var server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}

//------------------------------------------------------- socket.io

var io = require('socket.io')(server);
//var datos = [50,30,25,10];

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  //socket.on('emit_method', function(msg){
    //console.log('message: ' + msg);     // codigo para probar la transmicion
    //io.emit('data_method',datos);
  //});
});

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
//var HOST   = "35.198.8.140";
var HOST   = getIPAddress();

//------------------------------------ Servidor


function checksumf (strinn){
	var check = "";
	for (var i = 0; i < strinn.length; i++)
			{
			check ^= strinn[i].charCodeAt();
			if(strinn[i] === "*")
				{
				break;
				}
			};

	check = check.toString(16).toUpperCase();		// (ver si conviene convertir en Mayuscula)

	if (check.length===1)
  	 {
       check = "0"+check;
     };

	return check
};

server.on("error", function (err) {
	console.log("servidor error:\n" + err.stack);
	server.close();
});

server.on("message", function (reporte, remote) {

	console.log("reporte: " + reporte + " de " + remote.address + ":" + remote.port);

  var reporte_str = reporte.toString();


  //------------------------------------ Parseo de mensaje

  var rpt = reporte_str.split(";");
  var id_eqp_rpt  = rpt[1].substr(0,4);
  var numero_rpt  = rpt[2].substr(0,4);
  var checksum_rpt  = rpt[3].substr(1,2);

  //------------------------------------ emisión de mensaje al cliente

  io.emit('data_method',reporte_str);

  var stringACK = ">SAK;"+ id_eqp_rpt +";"+ numero_rpt +";*" ;

  //console.log(stringACK);

  //------------------------------------ Calculo del checksum

  var checksum = checksumf(stringACK);

  if (checksum.length===1)
  {
    checksum = "0"+checksum;
  };

  console.log('checksum calculado: '+ checksum);

  //------------------------------------ Armado de ACK

  var ACK = new Buffer([0x0D,0x0A,,,,,,,,,,,,,,,,,,,,0x0D,0x0A]);

  ACK.write(">SAK;"+ id_eqp_rpt +";"+ numero_rpt +";*"+ checksum +"<",2);

  //------------------------------------ Envio de ACK

  server.send(ACK, 0, ACK.length, remote.port, remote.address, function(err, bytes) {
      if (err) throw err;
      console.log('Respuesta ACK'+ ACK +'enviada al equipo ' + remote.address + ':' + remote.port);
    });

});

server.on("listening", function () {
	console.log("servidor corriendo " + HOST + ":" + PORT);
});

server.bind(PORT, HOST);
