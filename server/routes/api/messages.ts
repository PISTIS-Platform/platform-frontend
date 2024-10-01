import { io, type Socket } from 'socket.io-client';

import { getToken } from '#auth';

const { wsUrl } = useRuntimeConfig();
const sockets = new Map<string, Socket>();

export default defineWebSocketHandler({
    async open(peer) {
        console.log('CONNECTED FROM FE TO NITRO');
        if (sockets.has(peer.id)) return;
        const token = await getToken({ event: peer.ctx });
        sockets.set(
            peer.id,
            io(wsUrl, {
                extraHeaders: {
                    Authorization: `Bearer ${token?.access_token}`,
                },
            }),
        );
        sockets.get(peer.id)?.on('connect', () => {
            console.log('Connected to NestJS WS');
        });
        sockets.get(peer.id)?.on('disconnect', () => {
            console.log('Disconnected from NestJS WS');
        });
        sockets.get(peer.id)?.on('connect_error', (error) => {
            console.log('ERROR CONNECTING TO WS FROM NITRO: ', error);
        });
        //listens to messages from Websocket, specifically 'onMessage'
        sockets.get(peer.id)?.on('onMessage', (...args) => {
            peer.send(JSON.stringify(args[0]));
        });
    },
    close(peer) {
        sockets.get(peer.id)?.disconnect();
        sockets.delete(peer.id);
    },
    error(peer, error) {
        console.log('error on WS', peer, error);
    },
    //sends message to BE which is listening for it
    message(peer, message) {
        const messageObject = JSON.parse(message.text());

        console.log('SENDING MESSAGE', messageObject.action);
        sockets.get(peer.id)?.emit(messageObject.action, {
            userId: messageObject.userId,
            notificationId: messageObject?.notificationId,
        });
    },
});
