import { io, type Socket } from 'socket.io-client';

const { wsUrl } = useRuntimeConfig();
let socket: Socket;

export default defineWebSocketHandler({
    open(peer) {
        console.log('opened WS', peer);
        socket = io(wsUrl);
        socket.on('connect', () => {
            console.log('Connected to NestJS WS');
        });
        socket.on('disconnect', () => {
            console.log('Disconnected from NestJS WS');
        });
        //listens to messages, specifically 'onMessage'
        socket.on('onMessage', (...args) => {
            console.log('MESSAGE RECEIVED', new Date());
            peer.send(JSON.stringify(args[0]));
        });
    },
    close(peer) {
        console.log('closed WS', peer);
    },
    error(peer, error) {
        console.log('error on WS', peer, error);
    },
    //when user uses send('blah') from FE it goes through here
    //sends message on 'newMessage' to BE which is listening for it
    message(peer, message) {
        console.log('message on WS', peer, message);
        socket.emit('newMessage', {
            hello: 'there',
        });
    },
});
