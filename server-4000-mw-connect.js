// backend server

const  express = require('express');
const  Mindwave = require('mindwave2');
const  kefir = require('kefir');
const  fs = require('fs');

const  mw = new Mindwave();


let nodeModules = {};

fs.readdirSync('node_modules').filter(function(x){
  return ['.bin'].indexOf(x) === -1;
}).forEach(function(mod){
  nodeModules[mod] = 'commonjs ' + mod;
})

const app = express();

const server = require('http').Server(app);

const io = require('socket.io')(server);

server.listen(process.env.PORT || 4000);

// Mindwave Mobile Subroutines
function toObj(objs) {
    return objs.reduce(function(acc, o) {
        var k = Object.keys(o)[0]
        acc[k] = o[k]
        return acc
    }, {})
}

function prop(p) {
    return (v) => {
        var r = {}
        r[p] = v
        return r
    }
}

function asProp(ev) {
    return kefir.fromEvents(mw, ev).map(prop(ev))
}

// mindwave mobile waveform?
const waveS = kefir.fromEvents(mw, 'wave').bufferWithCount(256).map(prop('wave'))

// mindwave mobile data
const outS = kefir.zip([
    asProp('eeg'),
    asProp('signal'),
    asProp('attention'),
    asProp('meditation')
    // waveS,
]).map(toObj)

 outS.log();

 const getBluetoothDevicePaths = (path) => {
    const bluetoothDevicePaths = []
    fs.readdir(path, function(err, items) {
        // console.log(items);

        // fs.writeFileSync('dev_directory.txt', items)
        for (var i=0; i<items.length; i++) {
            // console.log(items[i]);
            // For TTY
            //  match path prefixed by 'tty.MindWaveMobile-Dev'
            //  also include tty.Bluetooth-Incoming-Port
            // ".includes('tty.MindWave-Mobile-Dev')"
            // or "=== tty.Bluetooth-Incoming-Port'"
            const mindwaveMobileDevPathsTTY = 'tty.MindWaveMobile-Dev'
            // For CU
            //  match path prefixed by 'cu.MindWaveMobile-Dev'
            //  also include cu.Bluetooth-Incoming-Port
            // ".includes('cu.MindWave-Mobile-Dev')"
            // or "=== cu.Bluetooth-Incoming-Port'"
            const itemName = items[i].toString()
            if(itemName.includes('cu.MindWaveMobile-DevA')){
                mw.connect(itemName)
                console.log('connecting to ', itemName)
                bluetoothDevicePaths.push(items[i])
            }
        }
    })
    return bluetoothDevicePaths
}
console.log('connecting to mindwave');
// const path = '/dev/cu.MindWaveMobile-DevA';
const path = '/dev';

const bluetoothDevicePaths = getBluetoothDevicePaths(path)

console.log(bluetoothDevicePaths.length)
// for (let i = 0; i<bluetoothDevicePaths.length;i++){
//     console.log('connecting to ', bluetoothDevicePaths[i])
//     mw.connect(path);
// }

// fs.readdir(path, function(err, items) {
//     console.log(items);
//     fs.writeFileSync('dev_directory.txt', items)
//     for (var i=0; i<items.length; i++) {
//         console.log(items[i]);
//     }
// });



io.on('connection', function(socket) {
    socket.on('getData', function() {
        console.log('data requested');
        socket.emit('data', outS);
    });
});
