//------------------------------------------------------- UDP server

var dgram		= require("dgram");
var server	= dgram.createSocket("udp4");
var os			= require('os');

// var http   = require('http');
// var io 	   = require('socket.io-client');

var mongoose	= require('mongoose');

var configDB 	= require('./config/database.js');

//------------------------------------ Base de datos

var DB = mongoose.connect(configDB.url, function(err, res) {

	if(err) {
    	console.log('ERROR: Base de datos no conectada ('+ err +')');
	} else {
    	console.log('Base de datos conectada');
	}

});

//------------------------------------ Importacion de modelos

var ReporteudpEsq = require('./modelos/reporteudp');
var ReporteEsq    = require('./modelos/reporte');

var REPOUDP = mongoose.model('REPOUDP', ReporteudpEsq);
var REPORTE	= mongoose.model('REPORTE', ReporteEsq);

//------------------------------------ Variables

var PORT   = "4444";
//var HOST   = "35.198.8.140";
var HOST   = getIPAddress();

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


function procesado_reporte(remote, reporte_str, id_eqp_rpt, numero_rpt, checksum_rpt){

  	//------------------------------------ Calculo del checksum

  	// var checksum = checksumf(reporte_str);

  	// console.log('checksum calculado: '+ checksum);

  	//------------------------------------ Validacion del checksum

  	// if (checksum === checksum_rpt) {

  		//------------------------------------ Creacion del esquema

  		var Reporte = new REPOUDP({

  			reporte: reporte_str,
  			ip: remote.address,
  			puerto: remote.port,
  			//hard_serie: "",			//ver si se puede hacer consulta de serial

  		});

  		//------------------------------------ Guardado en la base de datos

  		Reporte.save(function (err) {
  			if (err){

  				console.log("Error al guardar los datos");

  			} else {

					//------------------------------------ emisión de mensaje al cliente

					// io.emit('data_method',reporte_str); INSTALAR SOCKETIO

					var stringACK = ">SAK;"+ id_eqp_rpt +";"+ numero_rpt +";*" ;

					//console.log(stringACK);

					//------------------------------------ Calculo del checksum

					var checksum = checksumf(stringACK);

					// console.log('checksum calculado: '+ checksum);
					//
					//------------------------------------ Armado de ACK

					var ACK = new Buffer([0x0D,0x0A,,,,,,,,,,,,,,,,,,,,,0x0D,0x0A]);

					ACK.write(">SAK;"+ id_eqp_rpt +";"+ numero_rpt +";*"+ checksum +"<",2);

					// var ACK = new Buffer([0x0D,0x0A,,,,,,,,,,,,,,,,0x0D,0x0A]);
          //
					// ACK.write(">SAK;"+id_eqp_rpt+";"+numero_rpt+";"++"<",2);

					//------------------------------------ Envio de ACK

					server.send(ACK, 0, ACK.length, remote.port, remote.address, function(err, bytes) {
					    if (err) throw err;
					    console.log('Respuesta ACK'+ ACK +'enviada al equipo ' + remote.address + ':' + remote.port);
					    // io.emit('resp_equi',remote);
					  });
      		}
  		});


  };



//------------------------------------ Servidor

server.on("error", function (err) {
	console.log("servidor error:\n" + err.stack);
	server.close();
});


//------------------------------------ RECEPCION DE DATAGRAMAS

server.on("message", function (reporte, remote) {

	// console.log("reporte: " + reporte + " de " + remote.address + ":" + remote.port);

  // var reporte_str = reporte.toString();

  var reporte_str = reporte.toString().toUpperCase();

  //------------------------------------ Calculo del checksum

  var checksum = checksumf(reporte_str);

  //------------------------------------ mini Parseo de mensaje

  var rpt = reporte_str.split(";");
  var cabeza_rpt  = rpt[0].substr(1,3);
  var id_eqp_rpt  = rpt[1].substr(0,5);
  var numero_rpt  = rpt[2].substr(0,4);
  var checksum_rpt  = rpt[3].substr(1,2);

  // console.log(cabeza_rpt);
  // console.log(id_eqp_rpt);
  // console.log(numero_rpt);
  // console.log(checksum_rpt);
  // console.log(checksum);
  // console.log(reporte.length);

  //------------------------------------ Validacion del checksum

  if (checksum === checksum_rpt) {
    //------------------------------------ Identificacion de cabecera y Validacion del longitud

  	//identifica el tipo de reporte que llega al servidor y hace una comprobacion de longitud diferente!!

  	switch (cabeza_rpt)
      {
        case "RGP":
          if (reporte.length === 66 || reporte.length === 65){
          	procesado_reporte(remote,reporte_str,id_eqp_rpt,numero_rpt,checksum_rpt);
          } else {
  			console.log('Longitud incorrecta RGP');
  		}
          break;
        case "ROP":
          if (reporte.length === 82 || reporte.length === 81){
          	procesado_reporte(remote,reporte_str,id_eqp_rpt,numero_rpt,checksum_rpt)
          } else {
  			console.log('Longitud incorrecta ROP');
  		}
          break;
        case "RTP":
          if (reporte.length === 77 || reporte.length === 76){
          	procesado_reporte(remote,reporte_str,id_eqp_rpt,numero_rpt,checksum_rpt)
          } else {
  			console.log('Longitud incorrecta RTP');
  		}
          break;
        default:
          console.log('Cabeza de reporte no identificada: ' + cabeza_rpt);
          break;
      }

  } else {
  		console.log('checksum incorrecto');
  }


});

server.on("listening", function () {
	console.log("servidor corriendo " + HOST + ":" + PORT);
});

server.bind(PORT, HOST);
