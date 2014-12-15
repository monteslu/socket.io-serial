'use strict';

var util = require('util');
var stream = require('stream');
var _ = require('lodash');



function SocketSerialPort(options) {
  this.client = options.client;
  this.receiveTopic = options.receiveTopic;
  this.transmitTopic = options.transmitTopic || this.receiveTopic;
  this.metaData = options.metaData || {};

  this.buffer = null;

  var self = this;

  this.client.on(this.receiveTopic, function(data){
    try{
      console.log('received', data);
      if(data.buffer){
        self.emit('data', data.buffer);
      }

    }catch(exp){
      console.log('error on message', exp);
      //self.emit('error', 'error receiving message: ' + exp);
    }
  });

}

util.inherits(SocketSerialPort, stream.Stream);


SocketSerialPort.prototype.open = function (callback) {
  this.emit('open');
  if (callback) {
    callback();
  }

};



SocketSerialPort.prototype.write = function (data, callback) {

  console.log('sending data:', data);

  var sendObj = _.clone(this.metaData);
  sendObj.buffer = data;

  this.client.emit(this.transmitTopic, sendObj);
};



SocketSerialPort.prototype.close = function (callback) {
  console.log('closing');
  if(callback){
    callback();
  }
};

SocketSerialPort.prototype.flush = function (callback) {
  console.log('flush');
  if(callback){
    callback();
  }
};

SocketSerialPort.prototype.drain = function (callback) {
  console.log('drain');
  if(callback){
    callback();
  }
};


function bindPhysical(options){
  var client = options.client;
  var serialPort = options.serialPort;
  var receiveTopic = options.receiveTopic;
  var transmitTopic = options.transmitTopic || receiveTopic;
  var metaData = options.metaData || {};

  function serialWrite(data){
    try{
      if(typeof data === 'string'){
        data = new Buffer(data, 'base64');
      }
      serialPort.write(data);
    }catch(exp){
      console.log('error reading message', exp);
    }
  }


  serialPort.on('data', function(data){
    console.log('sending data:', data);
    if (!Buffer.isBuffer(data)) {
      data = new Buffer(data);
    }

    var sendObj = _.clone(metaData);
    sendObj.buffer = data;

    client.emit(transmitTopic, sendObj);
  });


  client.on(receiveTopic, function(data){
    try{
      if(data.buffer){
        console.log('received', data);
        serialWrite(data.buffer);      }
    }catch(exp){
      console.log('error on receive', exp);
      //self.emit('error', 'error receiving message: ' + exp);
    }
  });


}


module.exports = {
  SerialPort: SocketSerialPort,
  bindPhysical: bindPhysical
};
