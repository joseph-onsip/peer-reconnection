'use strict';

var proxyProperty = require('./proxyProperty');

var RTCPeerConnection = RTCPeerConnection || webkitRTCPeerConnection || mozRTCPeerConnection;

module.exports = PeerReconnection;
module.exports.proxiedProperties = proxiedProperties;
module.exports.proxiedEventHandlers = proxiedEventHandlers;

/*
 * A PeerReconnection behaves like the RTCPeerConnection backing it,
 * but has a _reconnect method that rebuilds the RTCPeerConnection from scratch.
 */
function PeerReconnection (configuration) {
  this._configuration = configuration;
  this._RTCPeerConnection = null;

  var proxyHelper = proxyProperty.bind(null, this, this._getRTCPeerConnection.bind(this));
  proxiedProperties.forEach(proxyHelper.bind(null, false));
  proxiedEventHandlers.forEach(proxyHelper.bind(null, true));

  this._reconnect();
}

PeerReconnection.prototype._getRTCPeerConnection = function _getRTCPeerConnection () {
  return this._RTCPeerConnection;
};

PeerReconnection.prototype._reconnect = function _reconnect () {
  var oldConnection = this._RTCPeerConnection;

  this._RTCPeerConnection = new RTCPeerConnection(this._configuration);

  if (oldConnection) {
    // move local streams over
    oldConnection.getLocalStreams().forEach(function (stream) {
      oldConnection.removeStream(stream);
      this.addStream(stream);
    }.bind(this));

    // move event handlers over
    proxiedEventHandlers.forEach(function (eventHandler) {
      this[eventHandler] = oldConnection[eventHandler];
      oldConnection[eventHandler] = null;
    }.bind(this));
  }
};

// https://w3c.github.io/webrtc-pc/archives/20141205/webrtc.html#interface-definition
var proxiedProperties = [
  'createOffer',
  'createAnswer',
  'setLocalDescription',
  'localDescription',
  'setRemoteDescription',
  'remoteDescription',
  'signalingState',
  'updateIce',
  'addIceCandidate',
  'iceGatheringState',
  'iceConnectionState',
  'getConfiguration',
  'getLocalStreams',
  'getRemoteStreams',
  'getStreamById',
  'addStream',
  'removeStream',
  'close',
  // https://w3c.github.io/webrtc-pc/archives/20141205/webrtc.html#rtcpeerconnection-interface-extensions
  'createDataChannel',
];
// these are listed separately since they are settable
var proxiedEventHandlers = module.exports.proxiedEventHandlers = [
  'onnegotiationneeded',
  'onicecandidate',
  'onsignalingstatechange',
  'onaddstream',
  'onremovestream',
  'oniceconnectionstatechange',
  'onicegatheringstatechange',
];
