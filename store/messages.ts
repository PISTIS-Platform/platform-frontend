import { defineStore } from 'pinia';

import type { Message } from '~/interfaces/message';

export const useMessagesStore = defineStore('MessagesStore', {
    state: (): { messages: Message[] } => ({
        messages: [],
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
