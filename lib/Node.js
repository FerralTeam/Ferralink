const WebSocket = require("ws");

class FerralLinkNode {
  constructor(client, options) {
  this.client = client;
  this.options = options;
  this.url = `${this.secure ? "wss" : "ws"}://${this.options.host}:${this.options.port}/`;
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
if (!this.ws) {
 const main = {
 Authorization: this.options.password,
 "Num-Shards": this.client.shards || 1,
 "User-Id": this.client.user,
  "Client-Name": "FerralLink",
};
this.ws = new WebSocket(this.url, { main });
this.ws.on("open", this.#open.bind(this));
this.ws.on("error", this.#error.bind(this));
this.ws.on("message", this.#message.bind(this));
this.ws.on("close", this.#close.bind(this));
} else this.ws.close();
}
  
disconnect() {
    if (!this.Connected) return;

    this.ws?.removeAllListeners();
    this.ws?.close();
    this.ws = null;
    this.isConnected = false;
  }
  
  
  
}
