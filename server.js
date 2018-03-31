const express = require('express');
const Mindwave = require('mindwave');
const kefir = require('kefir');
const mw = new Mindwave();
const fs = require('fs');

let nodeModules = {};

fs.readdirSync('node_modules').filter(function(x){
  return ['.bin'].indexOf(x) === -1;
}).forEach(function(mod){
  nodeModules[mod] = 'commonjs ' + mod;
})

const app = express();

const server = require('http').Server(app);

const io = require('socket.io')(server);

app.use(express.static(__dirname + '/dist'));
// app.use(sendViewMiddleware);


// app.get('/', function(req, res) {
//     res.sendView('/dist/index.html')
// });


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
    asProp('meditation'),
    asProp('attention')
    // waveS,
]).map(toObj)

outS.log();

console.log('connecting to mindwave');
mw.connect('/dev/cu.MindWaveMobile-DevA');

io.on('connection', function(socket) {
    socket.on('getData', function() {
        console.log('data requested');
        socket.emit('data', outS);
    });
});

function sendViewMiddleware(req, res, next) {
    res.sendView = function(view) {
        return res.sendFile(__dirname + view);
    }
    next();
}
