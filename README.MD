<p align="center"><img src="https://media.discordapp.net/attachments/936271538196451379/1035586844617883708/feralink_tape.png?width=705&height=134"><p>

[![Vaivhab and Cørg1 - Discord](https://img.shields.io/badge/Server_Support-5865F2?style=for-the-badge&logo=discord&logoColor=FFFFFF)](https://discord.gg/7M6yGBTn79)
[![Youtube - Vaibhab](https://img.shields.io/badge/Cørg1-F72424?style=for-the-badge&logo=youtube)](https://www.youtube.com/channel/UCnkviocxvPGS_80aNjJrCkQ)
<br>

# 🎶 FerraLink


A Simple but powerful Lavalink Client for your JavaScript Discord Bot!
<br>
<br>
<center>
"A little project made by Vaibhav and with help of Corgi made this package to make more easy the way of make Music Bots"
</center>

# 🔨 Requirements 

<br>
<br>

* Node.js >= 16.9.0 or Latest
* Discord.js >= 14.6.0

<br>
<br>

# How to Install FerraLink

<br>
<br>

> 1. Go to console and write this `npm i ferralink`
> 
> 2. Having a Host with Lavalink Client (Recommended) or using it in Localhost 
>
> 3. Do not forget Giving the `Intents` for `Voice Channels`

<br>
<br>

# How to Setup our FerraLink

<br>
<br>

## 1. Declaring FerraLink

<br>

```js
const { FerralLink } = require("FerralLink");
```

<br>

## 2. Defining your Nodes

<br>

```js
const Nodes = [{
  host: 'localhost',
  password: 'youshallpass',
  port: 1234,
  secure: false,
  name: 'lavalink'
}];
```

<br>

## 3. Set the Initilizer of FerraLink

<br>

```js
client.FerralLink = new FerralLink(client, nodes);
```
<br>

## 4. Launch FerraLink

<br>

```js
client.on("ready", () => {
    client.FerralLink.init(client);
});
```

<br>

## 5. Define the Manager

<br>

> *After of initializing the Node, you have to put the `client.FerralLink` in a variable to make the events*

<br>

```js
const manager = client.FerralLink;
```

<br>

## 6. Getting the Events

<br>

<center>

| **Event Name** 	|   **Elements**  	|           **Description**           	|
|:--------------:	|:---------------:	|:-----------------------------------:	|
|   nodeConnect  	|      _node_     	|    Event of the node connection.    	|
|   trackStart   	| _player, track_ 	| Event of the current starting song. 	|
</center>