<p align="center"><img src="https://media.discordapp.net/attachments/936271538196451379/1035586844617883708/feralink_tape.png?width=705&height=134"><p>

[![Vaivhab and Cørg1 - Discord](https://img.shields.io/badge/Server_Support-5865F2?style=for-the-badge&logo=discord&logoColor=FFFFFF)](https://discord.gg/7M6yGBTn79)
[![Npm - Feeralink](https://static.npmjs.com/338e4905a2684ca96e08c7780fc68412.png)](https://www.npmjs.com/package/ferra-link)
[![Youtube - Vaibhab](https://img.shields.io/badge/Cørg1-F72424?style=for-the-badge&logo=youtube)](https://www.youtube.com/channel/UCnkviocxvPGS_80aNjJrCkQ)
<br>

# 🎶 FerraLink

A Simple but powerful Lavalink Client for your JavaScript Discord Bot!

# 🔨 Requirements 

* Node.js >= 16.9.0 or Latest
* Discord.js >= 14.6.0

# 📦 How to Install FerraLink

> 1. Go to console and write this `npm i ferra-link`
> 
> 2. Having a Host with Lavalink Client (Recommended) or using it in Localhost 
>
> 3. Do not forget Giving the `Intents` for `Voice Channels`

# How to Setup our FerraLink

## 1. Declaring FerraLink

```js
const { FerraLink } = require("ferra-link");
```


## 2. Defining your Nodes

> 1. *This setp depends if you have any Hosting to get your Lavalink Server.*
> 
> 2. *The password is from your `application.yml`.*

```js
const nodes = [{
name: "Node",
url: "localhost:2333",
auth: "youshallpass",
secure: false
}];
```

## 3. Set the Initilizer of Ferralink

*Creating in a way like the code example you can import the bot and nodes.*

```js
client.FerraLink = new FerraLink(client, nodes, {
spotify: {
 playlistLimit: "Playlist search limit here", //default limit is 5 = 500.
 albumLimit: "Album search limit here", //default limit is 5 = 500.
 artistLimit: "Artist search limit here", //default limit is 5 = 500.
 searchMarket: "searchMarket(ISO code) here", //default searchMarket is US.
 clientID: "Your spotify clientId here",
 clientSecret: "Your spotify clientSecret here"
}
});
```

## 4. A small example to create play command.
```js
const player = await client.FerraLink.createPlayer({
guildId: message.guild.id,
voiceId: message.member.voice.channel.id,
textId: message.channel.id,
shardId: message.guild.shardId,
volume: 100,
deaf: true,
});

const resolve = await client.FerraLink.search(queue, { engine: "spsearch" }); // spsearch is work for search spotify tracks.
const { loadType, tracks, playlistInfo } = resolve;

if (loadType === "NO_MATCHES" || !tracks.length) return;

if (loadType === "PLAYLIST_LOADED") {
for (const track of tracks) {
player.queue.add(track);
}
if (!player.queue.current && !player.paused) await player.play();
message.channel.send({content: `Added ${player.queue.length} tracks from ${playlistInfo.name}`});
} else if (loadType === "SEARCH_RESULT" || loadType === "TRACK_LOADED") {
player.queue.add(tracks[0]);
if (!player.queue.current && !player.paused) await player.play();
message.channel.send({content: `Queued ${tracks[0].info.title}`});
} else return;
```

## 5. Getting the Events (shoukaku)

> *You can access event with the help of `client.FerraLink.shoukaku.on()....`.*

<center>

| **Event Name** 	|   **Elements**  	  |       **Description**         |
|:--------------:	|:------------------: |:----------------------------: |
|   ready 	      | name, resumed       | Event of the node connection. |
|   error         | name, error 	      | Event of the node error.      |
|   close         | name, code, reason  | Event of the node close.	    |
|   disconnect    | name, players, move | Event of the node disconnect.	|
|   debug         | name, reason	      | Event of the node debug.      |
</center>

## 6. Getting the Events (FerraLink)

> *You can access event with the help of `client.FerraLink.on()....`.*

<center>

| **Event Name** 	  |   **Elements**  |       **Description**         |
|:----------------: |:--------------: |:----------------------------: |
|   trackStart	    | player, track   | Event of the track start.     |
|   trackEnd        | player, track	  | Event of the track end.       |
|   queueEnd        | player          | Event of the queue end.	      |
|   PlayerClosed    | player, data    | Event of the player close.	  |
|   trackException  | player, data	  | Event of the track exception. |
|   PlayerUpdate    | player, data	  | Event of the player update.   |
|   trackStuck      | player, data	  | Event of the track stuck.     |
|   PlayerResumed   | player          | Event of the player resumed.  |
|   playerDestroy   | player	        | Event of the player destroyed.|
|   PlayerCreate    | player	        | Event of the player create.   |
</center>

## Contributors
> Deivu as the owner of [Shoukaku](https://github.com/Deivu/Shoukaku).
>
> vkamsingh, Corgi as the owner of [FerraLink](https://github.com/Cd-corgi/Ferralink).
>
> Prahar as the maintainer of [FerraLink Docs](https://github.com/Cd-corgi/Ferralink).
