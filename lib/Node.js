const WebSocket = require("ws");

class FerralLinkNode {
  constructor(options) {
  this.options = options;
  this.ws = null;
  this.attempt = 0;
  this.reconnects = 0;
  this.isConnected = false;
  this.destroyed = null;
  this.stats = {
       players: 0,
       playingPlayers: 0,
       uptime: 0,
       memory: {
        free: 0,
        used: 0,
        allocated: 0,
        reservable: 0,
      },
       cpu: {
        cores: 0,
        systemLoad: 0,
        lavalinkLoad: 0,
      },
   };
} 
 
connect() {
}
  
  
  
}
