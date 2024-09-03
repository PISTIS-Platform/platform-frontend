import { io, type Socket } from 'socket.io-client';

import { getToken } from '#auth';

const { wsUrl } = useRuntimeConfig();
const sockets = new Map<string, Socket>();

export default defineWebSocketHandler({
    async open(peer) {
        if (sockets.has(peer.id)) return;
        console.log('opened WS', peer.id);
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
        //sockets.get(peer.id)?.emit('join', 'test_room_' + peer.id);
        //listens to messages, specifically 'onMessage'
        sockets.get(peer.id)?.on('onMessage', (...args) => {
            peer.send(JSON.stringify(args[0]));
        });
    },
    close(peer) {
        console.log('closed WS', peer);
        sockets.get(peer.id)?.disconnect();
        sockets.delete(peer.id);
    },
    error(peer, error) {
        console.log('error on WS', peer, error);
    },
    //when user uses send('blah') from FE it goes through here
    //sends message on 'newMessage' to BE which is listening for it
    message(peer, message) {
        console.log('message on WS', peer, message);

        const messageObject = JSON.parse(message.text());

        sockets.get(peer.id)?.emit(messageObject.action, {
            userId: messageObject.userId,
            notificationId: messageObject?.notificationId,
        });
    },
});
