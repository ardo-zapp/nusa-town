import * as WebSocket from 'ws';

export class WebSocketServerWrapper extends WebSocket.Server {
	constructor(options: any, callback?: () => void) {
		super(options, callback);

		this.on('connection', (socket: WebSocket) => {
			socket.binaryType = 'arraybuffer';
		});
	}
}
