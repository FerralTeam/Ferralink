const sessionEndpoint = "[Ferralink] -> Session endpoint missing.";
const noSessionID = "[Ferralink] -> Session ID missing.";

class Connection {
  constructor (player) {
    this.player = player;
    this.sessionId = null;
    this.sessionId = null;
    this.muted = false;
    this.deafened = false;
    this.voiceServer = null;
}
setServersUpdate(data){
if (!data.endpoint) {this.player.client.emit(`error`, player, sessionEndpoint);
return;
}
this.voiceServer = data;
if (!this.sessionId) {
this.player.client.emit('error', noSessionID);
return;
}
this.player.node.send({
  op: "voiceUpdate",
  guildId: this.player.guildId,
  sessionId: this.sessionId,
  event: data 
  });
}
setStateUpdate(data) {
const { session_id, channel_id, self_deaf, self_mute } = data;
if (this.player.channelId && (channel_id && this.player.channelId !== channel_id)) { 
this.player.setVoiceChannel(channel_id);
}
this.deafened = self_deaf;
this.muted = self_mute;
this.sessionId = session_id || null;
    }
}
module.exports = Connection;