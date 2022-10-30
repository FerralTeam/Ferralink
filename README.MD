<p align="center"><img src="https://media.discordapp.net/attachments/936271538196451379/1035586844617883708/feralink_tape.png?width=705&height=134"><p>

[![Vaivhab and Cørg1 - Discord](https://img.shields.io/badge/Server_Support-5865F2?style=for-the-badge&logo=discord&logoColor=FFFFFF)](https://discord.gg/7M6yGBTn79)
[![Youtube - Vaibhab](https://img.shields.io/badge/Cørg1-F72424?style=for-the-badge&logo=youtube)](https://www.youtube.com/channel/UCnkviocxvPGS_80aNjJrCkQ)
<br>

# 🎶 FerraLink


A Simple but powerful Lavalink Client for your JavaScript Discord Bot!

<br>
<center>
"A little project made by Vaibhav and with help of Corgi made this package to make more easy the way of make Music Bots"
</center>

# 🔨 Requirements 

* Node.js >= 16.9.0 or Latest
* Discord.js >= 14.6.0

# How to Install FerraLink

> 1. Go to console and write this `npm i ferralink`
> 
> 2. Having a Host with Lavalink Client (Recommended) or using it in Localhost 
>
> 3. Do not forget Giving the `Intents` for `Voice Channels`

# How to Setup our FerraLink

## 1. Declaring FerraLink

```js
const { FerralLink } = require("FerralLink");
```


## 2. Defining your Nodes

> 1. *This setp depends if you have any Hosting to get your Lavalink Server.*
> 
> 2. *The password is from your `application.yml`.*

```js
const nodes = [{
  host: 'localhost',
  password: 'youshallpass',
  port: 1234,
  secure: false,
  name: 'lavalink'
}];
```


## 3. Set the Initilizer of FerraLink

*Creating in a way like the code example you can import the bot and nodes.*

```js
client.FerralLink = new FerralLink(client, nodes);
```

## 4. Launch FerraLink

> *Inside of the **Ready** event we have to call the FerralLink Variable to initialize the client.*

```js
client.on("ready", () => {
    client.FerralLink.init(client);
});
```


## 5. Define the Manager

> *After of initializing the Node, you have to put the `client.FerralLink` in a variable to make the events.*

```js
const manager = client.FerralLink;
```

## 6. Getting the Events

> *There's some events to use to your next Music Bot.*

<center>

| **Event Name** 	|   **Elements**  	|           **Description**           	|
|:--------------:	|:---------------:	|:-----------------------------------:	|
|   nodeConnect  	|      _node_     	|    Event of the node connection.    	|
|   trackStart   	| _player, track_ 	| Event of the current starting song. 	|
</center>