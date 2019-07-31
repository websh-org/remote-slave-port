# remote-slave-port
Slave port for async cross-iframe messaging. Load this in an iframe.

See remote-master-port for the other side of the channel (in the parent window).

The master port must innitiate the connection. 


## Synopsis
````bash
$ npm install @websh/remote-slave-port
````

````js
import { RemoteSlavePort } from "@websh/remote-slave-port";

// the master port in the parent window must use 
// the same channelId to establish a channel
const channelId = "my-channel"; 

const mySlavePort = new RemoteSlavePort(channelId);
````

## Methods

### `manifest( Object manifest )`
Register the slave's manifest. This will be sent to the master
on connection.

### `command( String command, Function( Object args ) fn )`
Register a command to be called from the master port.
Any value returned from the function will be sent back to the master port.
The function can be async.

### `on( String event, Function( Object data ) fn )`

Handle an event on the slave port. See Events.

### `trigger( String event, Object data )`
Trigger an event that will be sent to the master port

## TODO: Events
### `connected`
Triggered when connected.
### `disconnected`
Triggered when disconnected.
### `timeout`
Triggered when no connection request was received from the master.
