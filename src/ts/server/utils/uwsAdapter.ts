import * as uWS from 'uWebSockets.js';
import { EventEmitter } from 'events';

interface UwsUserData {
    req: any;
    fakeSocket?: UwsAdapterSocket;
}

export class UwsAdapterServer extends EventEmitter {
    public uwsApp: uWS.TemplatedApp;
    public port: number | null = null;
    private options: any;
    private listenSocket: any = null;

    constructor(options: any) {
        super();
        this.options = options || {};
        const path = this.options.path || '/ws';

        // Buat uWS app baru, menggunakan HTTPS/SSL jika ada, tapi karena ini adapter, kita pakai HTTP
        this.uwsApp = uWS.App();

        this.uwsApp.ws(path, {
            compression: this.options.perMessageDeflate ? uWS.SHARED_COMPRESSOR : uWS.DISABLED,
            maxPayloadLength: 16 * 1024 * 1024,
            idleTimeout: 120,

            upgrade: (res, req, context) => {
                let isAborted = false;
                res.onAborted(() => {
                    isAborted = true;
                });

                // Simpan url dan header untuk digunakan ag-sockets yang butuh req.url
                const url = req.getUrl();
                const query = req.getQuery();
                const headers: any = {};

                req.forEach((key, value) => {
                    headers[key] = value;
                });

                let remoteAddress = new Uint8Array(res.getRemoteAddressAsText()).join('.');
                try {
                    const buffer = res.getRemoteAddressAsText();
                    remoteAddress = Buffer.from(buffer).toString('utf8');
                } catch(e) {}

                // Buat fake req object untuk ag-sockets
                const fakeReq = {
                    url: query ? `${url}?${query}` : url,
                    headers: headers,
                    connection: {
                        remoteAddress: remoteAddress
                    }
                };

                const secWebSocketKey = req.getHeader('sec-websocket-key');
                const secWebSocketProtocol = req.getHeader('sec-websocket-protocol');
                const secWebSocketExtensions = req.getHeader('sec-websocket-extensions');

                const info = { origin: '', secure: false, req: fakeReq };

                const proceedUpgrade = () => {
                    if (isAborted) return;
                    res.upgrade(
                        { req: fakeReq } as UwsUserData,
                        secWebSocketKey,
                        secWebSocketProtocol,
                        secWebSocketExtensions,
                        context
                    );
                };

                if (this.options.verifyClient) {
                    if (this.options.verifyClient.length >= 2) {
                        // verifyClient(info, callback) async form
                        res.onAborted(() => { isAborted = true; });
                        this.options.verifyClient(info, (result: boolean, code?: number, name?: string) => {
                            if (result) {
                                proceedUpgrade();
                            } else {
                                if (isAborted) return;
                                res.writeStatus(code ? `${code} ${name || 'Unauthorized'}` : '401 Unauthorized').end();
                            }
                        });
                        return; // Upgrade handled in callback
                    } else {
                        // verifyClient(info) sync form
                        const verifyResult = this.options.verifyClient(info);
                        if (!verifyResult) {
                            res.writeStatus('401 Unauthorized').end();
                            return;
                        }
                    }
                }

                proceedUpgrade();
            },

            open: (ws: uWS.WebSocket<UwsUserData>) => {
                const userData = ws.getUserData();
                const fakeSocket = new UwsAdapterSocket(ws);
                userData.fakeSocket = fakeSocket;
                this.emit('connection', fakeSocket, userData.req);
            },

            message: (ws: uWS.WebSocket<UwsUserData>, message: ArrayBuffer, isBinary: boolean) => {
                const userData = ws.getUserData();
                if (userData && userData.fakeSocket) {
                    if (isBinary) {
                        // ubah ArrayBuffer dari uWS ke Buffer untuk node
                        const buf = Buffer.from(message.slice(0));
                        userData.fakeSocket.emit('message', buf);
                    } else {
                        // Jika text frame, kirim sebagai string karena JSON parsing di ag-sockets membutuhkannya
                        const str = Buffer.from(message.slice(0)).toString('utf8');
                        userData.fakeSocket.emit('message', str);
                    }
                }
            },

            close: (ws: uWS.WebSocket<UwsUserData>, code: number, message: ArrayBuffer) => {
                const userData = ws.getUserData();
                if (userData && userData.fakeSocket) {
                    userData.fakeSocket.emit('close', code, message);
                }
            }
        });
    }

    // Dipanggil untuk start listening (dibutuhkan agar uWS aktif)
    listen(port: number, cb?: () => void) {
        this.uwsApp.listen(port, (token) => {
            if (token) {
                this.listenSocket = token;
                this.port = port;
                if (cb) cb();
            } else {
                console.error(`Failed to listen to port ${port} with uWebSockets.js`);
            }
        });
    }

    close(cb?: () => void) {
        if (this.listenSocket) {
            uWS.us_listen_socket_close(this.listenSocket);
            this.listenSocket = null;
        }
        if (cb) cb();
    }
}

export class UwsAdapterSocket extends EventEmitter {
    public readyState: number = 1; // 1 = OPEN
    public uwsSocket: uWS.WebSocket<UwsUserData>;

    constructor(uwsSocket: uWS.WebSocket<UwsUserData>) {
        super();
        this.uwsSocket = uwsSocket;
    }

    send(data: any, _options?: any, cb?: (err?: Error) => void) {
        if (this.uwsSocket) {
            try {
                // uWS .send(message, isBinary, compress)
                const isBinary = Buffer.isBuffer(data) || data instanceof Uint8Array || data instanceof ArrayBuffer;
                this.uwsSocket.send(data, isBinary, true); // true untuk compress
                if (cb) cb();
            } catch (e) {
                if (cb) cb(e);
            }
        }
    }

    terminate() {
        if (this.uwsSocket) {
            try {
                this.uwsSocket.close();
            } catch(e) {}
        }
    }

    close() {
        this.terminate();
    }
}

// Ekspor dalam bentuk yang sama seperti module 'ws'
export const Server = UwsAdapterServer;
