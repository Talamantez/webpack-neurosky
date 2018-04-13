let DataListener = function(message, callback){
  var self = this;
  self.socket = io('http://127.0.0.1:4000');
  self.socket.on(message, function(data){
      if(callback && data){
        callback(data)
      }
  });
}

export default DataListener
