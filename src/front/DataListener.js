import io from 'socket.io-client';

let DataListener = function(port, message, callback){
  var self = this;
  self.socket = io('http://127.0.0.1:' + port);
  self.socket.on(message, function(data){
      if(callback && data){
        callback(data)
      }
  });
}

export default DataListener
