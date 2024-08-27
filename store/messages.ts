import { defineStore } from 'pinia';

import type { Message } from '~/interfaces/message';

export const useMessagesStore = defineStore('MessagesStore', {
    state: (): { messages: Message[] } => ({
        messages: [
            {
                id: '1',
                userId: '2',
                organizationId: '3',
                message: 'Your notification text goes here.',
                isHidden: false,
                createdAt: new Date(),
                readAt: null,
            },
            {
                id: '2',
                userId: '2',
                organizationId: '3',
                message:
                    'Sit ad dolor sint. Qui laboris Lorem elit velit. Incididunt nulla nisi ipsum et aliquip nulla fugiat ullamco. Quis sit elit exercitation mollit elit ut sint. Et id dolore velit cillum. Commodo fugiat proident elit irure exercitation deserunt sint. Nulla velit consectetur sit mollit ex.',
                isHidden: false,
                createdAt: new Date(),
                readAt: null,
            },
            {
                id: '3',
                userId: '2',
                organizationId: '3',
                message: 'Your notification text goes here.',
                isHidden: true,
                createdAt: new Date(),
                readAt: null,
            },
            {
                id: '4',
                userId: '2',
                organizationId: '3',
                message: 'Your notification text goes here.',
                isHidden: false,
                createdAt: new Date(),
                readAt: new Date(),
            },
        ],
    }),
    getters: {
        getMessages(): Message[] {
            return this.messages;
        },
    },
    actions: {
        addMessage(message: Message): void {
            this.messages.push(message);
        },
        setMessages(messages: Message[]): void {
            this.messages = messages;
        },
        hideMessage(messageId: string | number): void {
            const foundMessage = this.messages.find((message: Message) => message.id === messageId);
            if (!foundMessage) return;
            foundMessage.isHidden = true;
        },
        markAsRead(messageId: string | number): void {
            const foundMessage = this.messages.find((message: Message) => message.id === messageId);
            if (!foundMessage) return;
            foundMessage.readAt = new Date();
        },
    },
});
