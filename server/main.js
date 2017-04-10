require("babel-core").transform("code");

import IO from 'socket.io';
import express from 'express';
import https from 'https';
var app = express()
var port = 443 //change this to 1337 once dev is done (its 443 because I dev at school) (Should we turn this into a config controlled port?)
import fs from 'fs';
var options = {
	key: fs.readFileSync(__dirname + '/ssl/server.key'),
	cert: fs.readFileSync(__dirname + '/ssl/server.cert')
};

/*

EXAMPLE OF GLOBAL TRACKING OBJECT
---------------------------------

var obj = {
	interface: 'wlan0',
	mac: 'mac of card',
	type: 'wireless',
	status: {
		busy: false,
		process: null //due to busy being false
	},
	isup: true, //interface is up
	connected: false //not connected to wifi, not neccessarily busy yknow?
}

var ob2 = {
	interface: 'wlan1',
	type: 'wireless',
	status: {
		busy: true,
		process: {
			type: 'WIFI_DOS', ///could be anything, MiTM, MASS_JAM, WPS_ATTACK, SCANNING and so on
			bssid: 'mac address of attacked wifi point',
			essid: 'ssid of attacked wifi point'
		}
	},
	isup: true,
	connected: false //not connected
}

var obj3 = {
	interface: 'wlan2',
	type: 'wireless',
	status: {
		busy: false,
		process: null
	},
	isup: true,
	connected: {
		bssid: 'mac of connected access point',
		essid: 'name of connected access point',
		ip: 'ip of interface related to that access point (private ip)',
		router: 'ip of router/gateway'
	}
}

*/

import {
	Log,
	ScanLocal,
	ScanTarget
} from './functions/fn';

import {
	ScanWifi
} from './functions/wifi';

var SYSINFO = {
	cpu: {},
	mem: {},
	fs: {},
	interfaces: {},
	swap: {}
}
export default SYSINFO;

//HTTP SERVER INIT
var server = https.createServer(options, app).listen(port, () => {
	Log.i("Express server listening on port " + port);
});

//STATIC WEB
app.use(express.static(__dirname + '/web'));

//SOCKET.IO INIT
const io = IO(server);

//HTTP GET RULES
app.get('/', (req, res) => {
	Log.d(req.connection.remoteAddress + " GET /")
	res.sendFile(__dirname + '/web/index.html');
});


io.on('connection', (socket) => {

	socket.on('get system info', (callback) => {
		callback(SYSINFO)
	})

	socket.on('scan local', (iface, cb) => {
		ScanLocal(iface, cb)
	})

	socket.on('scan target', (iface, target, cb) => {
		ScanTarget(iface, target, cb)
	})

	socket.on('scan wifi', (iface, cb) => {
		ScanWifi(iface, cb)
	})

})