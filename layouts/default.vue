<script lang="ts" setup>
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    ChevronDownIcon,
    UserCircleIcon,
    XMarkIcon,
} from '@heroicons/vue/24/outline';
import { useRoute } from 'vue-router';

import { useMessagesStore } from '~/store/messages';

const route = useRoute();

const messagesStore = useMessagesStore();

const { t } = useI18n();

const { status, signIn, signOut, data: session } = useAuth();

useHead({
    htmlAttrs: { class: 'min-h-full bg-gray-100' },
    bodyAttrs: { class: 'h-full' },
});

const navigation = ref([
    { name: 'home.home', to: '/home', target: '_self', icon: '', external: false },
    { name: 'data.data', to: '/data', target: '_self', icon: '', external: false },
    {
        name: 'catalog.catalog',
        to: {
            path: '/my-data/catalog',
        },
        target: '_self',
        icon: '',
    },
    {
        name: 'marketplace.marketplace',
        to: {
            path: '/marketplace',
        },
        target: '_self',
        icon: '',
    },
    {
        name: 'dataAnalytics.title',
        to: '/data-analytics',
        target: '_self',
        icon: '',
        external: false,
    },
]);

const userNavigation: { name: string; href: string }[] = [
    {
        name: t('user.account'),
        href: '/account',
    },
    {
        name: t('user.systemMonitor'),
        href: '/monitoring',
    },
];

const notificationCount = ref(0);

const { refresh } = useFetch('/api/notifications/count', {
    onResponse({ response }) {
        notificationCount.value = response._data;
    },
});

const computedNotifications = computed(() => messagesStore.getMessages);

watch(
    computedNotifications,
    () => {
        refresh();
    },
    { deep: true },
);
const notificationsNumberText = computed(() => (notificationCount.value > 9 ? '9+' : notificationCount.value));
function isActive(item: any) {
    const targetPath = typeof item.to === 'string' ? item.to : item.to.path;
    const currentPath = route.path;
    return currentPath.split('/')[1] === targetPath.split('/')[1].replace('/', '');
}
</script>

<template>
    <div class="h-full flex flex-col">
        <Disclosure v-slot="{ open }" as="nav" class="bg-primary-700 sticky top-0 z-50">
            <div class="mx-auto max-w-7xl">
                <div class="flex h-16 items-center justify-between">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <img class="h-8 w-28" src="/img/PISTIS_logo_white.png" alt="PISTIS logo" />
                        </div>
                        <div class="hidden md:block">
                            <div v-if="status === 'authenticated'" class="ml-10 flex items-baseline space-x-4">
                                <NuxtLink
                                    v-for="item in navigation"
                                    :key="item.name"
                                    :to="item.to"
                                    :target="item.target"
                                    :external="item.external"
                                    :class="[
                                        'text-white hover:bg-primary-600 hover:bg-opacity-75 rounded-md px-3 py-2 text-sm font-medium',
                                        isActive(item) ? 'bg-primary-800' : '',
                                    ]"
                                >
                                    {{ $t(item.name) }}
                                    <UIcon :name="item.icon" class="w-4 h-4 text-white-500" />
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                    <div class="hidden md:block">
                        <div class="ml-4 flex items-center md:ml-6">
                            <UButton
                                type="button"
                                class="flex gap-1 items-center relative rounded-full bg-primary-70 h-10 p-1.5 text-primary-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 mr-1"
                                to="/notifications"
                            >
                                <span class="absolute -inset-1.5" />
                                <span class="sr-only">View notifications</span>
                                <div
                                    v-if="notificationCount >= 1"
                                    class="bg-red-500 rounded-full w-5 h-5 text-xs flex items-center justify-center absolute top-0 z-20 -right-0.5"
                                >
                                    {{ notificationsNumberText }}
                                </div>
                                <UIcon name="i-heroicons-bell" class="h-7 w-7" aria-hidden="true" />
                            </UButton>

                            <!-- Profile dropdown -->
                            <Menu v-if="status === 'authenticated'" as="div" class="relative ml-3">
                                <div>
                                    <MenuButton
                                        class="relative flex gap-2 text-primary-200 max-w-xs items-center rounded-full bg-primary-700 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                                    >
                                        <span class="absolute -inset-1.5" />
                                        <span class="sr-only">Open user menu</span>
                                        <UAvatar :src="session?.user?.image" class="bg-primary-200" size="md" />
                                        <div class="text-primary-100">
                                            {{ session?.user?.name }}
                                        </div>
                                        <ChevronDownIcon class="w-4 h-4 text-primary-300" />
                                    </MenuButton>
                                </div>
                                <MenuItems
                                    class="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                >
                                    <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                                        <a
                                            :href="item.href"
                                            :class="[
                                                active ? 'bg-primary-100' : '',
                                                'block px-4 py-2 text-sm text-gray-700',
                                            ]"
                                            >{{ $t(item.name) }}</a
                                        >
                                    </MenuItem>
                                    <MenuItem v-slot="{ active }">
                                        <a
                                            href="javascript:void(0)"
                                            :class="[
                                                'block px-4 py-2 text-sm text-gray-700',
                                                active ? 'bg-primary-100 ' : undefined,
                                            ]"
                                            @click="signOut({ callbackUrl: '/' })"
                                        >
                                            {{ $t('user.signOut') }}
                                        </a>
                                    </MenuItem>
                                </MenuItems>
                            </Menu>
                            <UButton v-else @click="signIn('keycloak')">
                                <ArrowRightOnRectangleIcon class="h-4 w-4" />
                                <span class="text-sm whitespace-nowrap">{{ $t('user.signIn') }}</span>
                            </UButton>
                        </div>
                    </div>
                    <div class="-mr-2 flex md:hidden">
                        <!-- Mobile menu button -->
                        <DisclosureButton
                            class="relative inline-flex items-center justify-center rounded-md bg-primary-700 p-2 text-primary-200 hover:bg-primary-500 hover:bg-opacity-75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                        >
                            <span class="absolute -inset-0.5" />
                            <span class="sr-only">Open main menu</span>
                            <Bars3Icon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
                            <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
                        </DisclosureButton>
                    </div>
                </div>
            </div>

            <DisclosurePanel class="md:hidden">
                <div class="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                    <DisclosureButton
                        v-for="item in navigation"
                        :key="item.name"
                        as="a"
                        :href="item.to"
                        active-class="bg-primary-700 text-white"
                        :class="[
                            'text-white hover:bg-primary-500 hover:bg-opacity-75',
                            'block rounded-md px-3 py-2 text-base font-medium',
                        ]"
                        >{{ $t(item.name) }}</DisclosureButton
                    >
                </div>
                <div class="border-t border-primary-700 pb-3 pt-4">
                    <div v-if="status === 'authenticated'" class="flex items-center px-5">
                        <div class="flex-shrink-0">
                            <UserCircleIcon class="text-primary-200 w-8 h-8" />
                        </div>
                        <div class="ml-3">
                            <div class="text-base font-medium text-white">{{ session?.user?.name }}</div>
                            <div class="text-sm font-medium text-primary-300">{{ session?.user?.email }}</div>
                        </div>
                        <UButton
                            type="button"
                            class="flex gap-1 items-center relative rounded-full bg-primary-70 h-10 p-1.5 text-primary-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                            to="/notifications"
                        >
                            <span class="absolute -inset-1.5" />
                            <span class="sr-only">View notifications</span>
                            <div
                                v-if="notificationCount >= 1"
                                class="bg-red-500 rounded-full w-5 h-5 text-xs flex items-center justify-center absolute top-0 z-20 -right-0.5"
                            >
                                {{ notificationsNumberText }}
                            </div>
                            <UIcon name="i-heroicons-bell" class="h-7 w-7" aria-hidden="true" />
                        </UButton>
                    </div>
                    <UButton v-else class="ml-5" @click="signIn('keycloak')">
                        <ArrowRightOnRectangleIcon class="h-4 w-4" />
                        <span class="text-sm whitespace-nowrap">{{ $t('user.signIn') }}</span>
                    </UButton>
                    <div class="mt-3 space-y-1 px-2">
                        <DisclosureButton
                            v-for="item in userNavigation"
                            :key="item.name"
                            as="a"
                            :href="item.href"
                            class="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-primary-500 hover:bg-opacity-75"
                        >
                            {{ $t(item.name) }}</DisclosureButton
                        >
                    </div>
                </div>
            </DisclosurePanel>
        </Disclosure>
        <main v-if="status === 'authenticated'" class="flex flex-col flex-1 overflow-y-auto text-gray-700">
            <slot />
        </main>
        <footer class="bg-primary-900 flex p-4 text-xs justify-center align-center">
            <div class="flex w-full max-w-[1210px] gap-4">
                <img class="w-12 h-8" src="/img/eu_flag.jpeg" alt="PISTIS logo" />
                <p class="text-white">
                    This project has received funding from the European Union under Grant Agreement n° 101093016. Views
                    and opinions expressed are however those of the author(s) only and do not necessarily reflect those
                    of the European Union or the European Commission. Neither the European Union nor the granting
                    authority can be held responsible for them.
                </p>
            </div>
        </footer>
    </div>
</template>

<style>
#__nuxt {
    height: 100%;
}
</style>
