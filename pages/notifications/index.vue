<script setup lang="ts">
import dayjs from 'dayjs';
import * as R from 'ramda';

import type { Message } from '~/interfaces/message';
import { useMessagesStore } from '~/store/messages';

const messagesStore = useMessagesStore();

const { status } = useFetch('/api/notifications', {
    onResponse({ response }) {
        messagesStore.setMessages(response._data[0]);
    },
});

const notifications = computed(() => messagesStore.getMessages);

const shownNotifications = computed(() => notifications.value.filter((not) => !not.isHidden));

const transformedUnreadNotifications = computed(() =>
    shownNotifications.value.map((notification: Message) => ({
        ...notification,
        createdAt: dayjs(notification.createdAt).format('YYYY/MM/DD HH:mm:ss'),
    })),
);

const sortByCreatedAt = R.sortWith([R.descend(R.prop('createdAt'))]);

const sortedNotifications = computed<Message[]>(() => sortByCreatedAt(transformedUnreadNotifications.value));

const markAsRead = async (id: string | number) => {
    await $fetch(`/api/notifications/markAsRead`, {
        method: 'POST',
        body: {
            notificationId: id,
        },
    });
    messagesStore.markAsRead(id);
};

const hide = async (id: string | number) => {
    await $fetch(`/api/notifications/hide`, {
        method: 'POST',
        body: {
            notificationId: id,
        },
    });
    messagesStore.hideMessage(id);
};
</script>

<template>
    <div class="justify-start h-full items-center px-8 max-w-7xl mx-auto w-full">
        <PageContainer>
            <div v-if="status === 'success'" class="flex flex-col gap-6 mt-2 w-full">
                <UCard
                    v-for="notification in sortedNotifications"
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
            <div v-else class="w-full flex items-center justify-center">
                <UIcon name="svg-spinners:180-ring-with-bg" class="w-12 h-12" />
            </div>
        </PageContainer>
    </div>
</template>
