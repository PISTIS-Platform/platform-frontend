<script setup lang="ts">
//TODO: API call to get notifications here
//TODO: Possibly read information from API call that will happen to get the notifications for the icon
import dayjs from 'dayjs';

import { useMessagesStore } from '~/store/messages';

const messagesStore = useMessagesStore();

const notifications = computed(() => messagesStore.getMessages);

const markAsRead = (id: string | number) => {
    //TODO: Send API call to mark notification as Read if stored
    //TODO: Refresh list upon doing so and set in store
    messagesStore.markAsRead(id);
};

const hide = (id: string | number) => {
    //TODO: Send API call to mark notification as hidden if stored
    //TODO: Refresh list upon doing so and set in store
    messagesStore.hideMessage(id);
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
