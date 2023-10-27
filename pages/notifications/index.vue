<script setup lang="ts">
import { DummyNotifications } from './notifications-dummy-data';

let fakeData = DummyNotifications.sort((a, b) => (a.isUnread === b.isUnread ? 0 : b.isUnread ? -1 : 1));

function isUread(id) {
    console.log(id, 'readed');
}

function remove(id) {
    console.log(id);
}
</script>

<template>
    <div class="w-full h-full text-gray-700">
        <Heading :title="$t('notifications.title')" />

        <!-- Notifications Info -->
        <div
            v-for="notification in fakeData"
            :key="notification.id"
            class="flex flex-col md:flex-row gap-6 lg:gap-8 w-full mt-8"
        >
            <UCard
                :class="
                    notification.isUnread === false
                        ? `relative border w-full ring-2 ring-primary-500`
                        : `relative w-full rounded-md`
                "
            >
                <div class="flex flex-row justify-between">
                    <div class="flex gap-2 left-6 order-first">
                        <h3 class="text-base xl:text-xl font-bold">
                            {{ notification.title }}
                        </h3>
                        <UIcon
                            :name="
                                notification.type === 'personal'
                                    ? 'i-heroicons-user-circle-20-solid'
                                    : notification.type === 'dataset'
                                    ? 'i-heroicons-document-arrow-down-20-solid'
                                    : 'i-heroicons-currency-dollar-20-solid'
                            "
                            class="ml-2 h-6 w-6"
                        />
                    </div>
                    <div class="flex gap-2 right-2 order-last">
                        <UTooltip
                            :text="
                                notification.isUnread === true ? $t('notifications.unread') : $t('notifications.read')
                            "
                        >
                            <UIcon
                                :name="
                                    notification.isUnread === true
                                        ? `i-heroicons-envelope-20-solid`
                                        : `i-heroicons-check-20-solid`
                                "
                                class="h-6 w-6 cursor-pointer"
                                @click="isUread(notification.id)"
                            />
                        </UTooltip>
                        <UTooltip :text="$t('notifications.delete')">
                            <UIcon
                                name="i-heroicons-x-mark-20-solid"
                                class="h-6 w-6 cursor-pointer"
                                @click="remove(notification.id)"
                            />
                        </UTooltip>
                    </div>
                </div>
                <div class="w-full mt-6 pr-20 text-l truncate">{{ notification.description }}</div>
            </UCard>
        </div>
    </div>
</template>
