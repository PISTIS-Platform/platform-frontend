<script setup lang="ts">
//TODO: API call to get notifications here
//TODO: Possibly read information from API call that will happen to get the notifications for the icon
import dayjs from 'dayjs';

import { useMessagesStore } from '~/store/messages';

const messagesStore = useMessagesStore();

// const { status, signIn, signOut, data: session } = useAuth();

const { data: wsData, send } = useWebSocket(`ws://${location.host}/api/messages`);

const notifications = computed(() => messagesStore.getMessages);

const getAllNotifications = () => {
    send(
        JSON.stringify({
            //TODO: Get user id
            action: 'getAllNotifications',
            // userId: session.value.user?.userId,
        }),
    );
};

watch(wsData, (newValue) => {
    if (!newValue) return;
    const message = JSON.parse(newValue);
    if (Array.isArray(message)) {
        messagesStore.setMessages(message);
        return;
    }
});

const markAsRead = (id: string | number) => {
    send(
        JSON.stringify({
            action: 'markAsRead',
            notificationId: id,
            //TODO: Get user id
            // userId: session.value.user?.userId,
        }),
    );
    getAllNotifications();
};

const hide = (id: string | number) => {
    send(
        JSON.stringify({
            action: 'hide',
            notificationId: id,
            //TODO: Get user id
            // userId: session.value.user?.userId,
        }),
    );
    getAllNotifications();
};

const shownNotifications = computed(() => notifications.value.filter((not) => !not.isHidden));
</script>

<template>
    <div class="justify-start h-full items-center px-8 max-w-7xl mx-auto w-full">
        <PageContainer>
            <SubHeading :title="$t('notifications.title')" />
            <div class="flex flex-col gap-6 mt-6 w-full">
                <UCard
                    v-for="notification in shownNotifications"
                    :key="notification.id"
                    :class="['w-full relative pb-6 pt-4', notification.readAt ? 'opacity-60' : '']"
                >
                    {{ notification.message }}
                    <div class="flex items-center justify-end w-full text-xs absolute top-2 right-2 text-gray-500">
                        {{ dayjs(notification.createdAt).format('DD/MM/YYYY HH:mm') }}
                    </div>
                    <div class="w-full flex justify-end gap-4 absolute bottom-2 right-2">
                        <UButton color="red" variant="soft" @click="hide(notification.id)">{{
                            $t('notifications.hide')
                        }}</UButton>
                        <UButton v-if="!notification.readAt" color="gray" @click="markAsRead(notification.id)">{{
                            $t('notifications.markRead')
                        }}</UButton>
                    </div>
                </UCard>
                <UAlert
                    v-if="!shownNotifications.length"
                    icon="ic:outline-info"
                    color="primary"
                    variant="soft"
                    :description="$t('notifications.noNotifications')"
                />
            </div>
        </PageContainer>
    </div>
</template>
