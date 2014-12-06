'use strict';

var util = require('util');
var stream = require('stream');
var _ = require('lodash');



function SocketSerialPort(options) {
  this.client = options.client;
  this.receiveTopic = options.receiveTopic;
  this.transmitTopic = options.transmitTopic;

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

  if (!Buffer.isBuffer(data)) {
    data = new Buffer(data);
  }

  this.client.emit(this.transmitTopic, {buffer: data});
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
  this.client = options.client;
  this.receiveTopic = options.receiveTopic;
  this.transmitTopic = options.transmitTopic;

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

    this.client.emit(this.transmitTopic, {buffer: data});
  });


  this.client.on(self.receiveTopic, function(data){
    try{
      if(topic === self.receiveTopic){
        console.log('received', topic, data);
        serialWrite(data);
      }
    }catch(exp){
      console.log('error on message', exp);
      //self.emit('error', 'error receiving message: ' + exp);
    }
  });


}


module.exports = {
  SerialPort: SocketSerialPort,
  bindPhysical: bindPhysical
};
