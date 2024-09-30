import { io, type Socket } from 'socket.io-client';

import { getToken } from '#auth';

const { wsUrl } = useRuntimeConfig();
const sockets = new Map<string, Socket>();

export default defineWebSocketHandler({
    async open(peer) {
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
        //listens to messages from Websocket, specifically 'onMessage'
        sockets.get(peer.id)?.on('onMessage', (...args) => {
            peer.send(JSON.stringify(args[0]));
        });
    },
    close(peer) {
        sockets.get(peer.id)?.disconnect();
        sockets.delete(peer.id);
    },
    //sends message to BE which is listening for it
    message(peer, message) {
        const messageObject = JSON.parse(message.text());

        sockets.get(peer.id)?.emit(messageObject.action, {
            userId: messageObject.userId,
            notificationId: messageObject?.notificationId,
        });
    },
});
