<script lang="ts" setup>
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { Bars3Icon, BellIcon, ChevronDownIcon, UserCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline';

const route = useRoute();

const firstLevelRoutePath = route.fullPath.split('/')[1];

useHead({
    htmlAttrs: { class: 'min-h-full bg-gray-100' },
    bodyAttrs: { class: 'h-full' },
});

const user = {
    name: 'John Doe',
    email: 'john@doe.com',
};
const navigation = [
    { name: 'home.home', to: '/home' },
    { name: 'data.data', to: '/data' },
    { name: 'transactions.transactions', to: '/transactions' },
    { name: 'market.market', to: '/market' },
    { name: 'admin.services.title', to: '/manage-services' },
    { name: 'admin.resources.title', to: '/resources-monitor' },
];

const userNavigation = [
    { name: 'user.profile', href: '#' },
    { name: 'user.settings', href: '#' },
    { name: 'user.signOut', href: '#' },
];
</script>

<template>
    <div class="h-full flex flex-col">
        <Disclosure v-slot="{ open }" as="nav" class="bg-primary-700 sticky top-0 z-20">
            <div class="mx-auto px-8 max-w-6xl">
                <div class="flex h-16 items-center justify-between">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <img class="h-8 w-28" src="/img/PISTIS_logo_white.png" alt="PISTIS logo" />
                        </div>
                        <div class="hidden md:block">
                            <div class="ml-10 flex items-baseline space-x-4">
                                <NuxtLink
                                    v-for="item in navigation"
                                    :key="item.name"
                                    :to="item.to"
                                    class="text-white hover:bg-primary-600 hover:bg-opacity-75 rounded-md px-3 py-2 text-sm font-medium"
                                    active-class="bg-primary-800"
                                    >{{ $t(item.name) }}</NuxtLink
                                >
                            </div>
                        </div>
                        <div class="mt-1 md:hidden flex gap-4 justify-center items-center ml-4 text-white">
                            <span> • </span>
                            {{ $t(`${firstLevelRoutePath}.${firstLevelRoutePath}`) }}
                        </div>
                    </div>
                    <div class="hidden md:block">
                        <div class="ml-4 flex items-center md:ml-6">
                            <button
                                type="button"
                                class="relative rounded-full bg-primary-700 p-1 text-primary-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                                to="/notifications"
                            >
                                <span class="absolute -inset-1.5" />
                                <span class="sr-only">View notifications</span>
                                <BellIcon class="h-6 w-6" aria-hidden="true" />
                            </button>

                            <!-- Profile dropdown -->
                            <Menu as="div" class="relative ml-3">
                                <div>
                                    <MenuButton
                                        class="relative flex gap-2 text-primary-200 max-w-xs items-center rounded-full bg-primary-700 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                                    >
                                        <span class="absolute -inset-1.5" />
                                        <span class="sr-only">Open user menu</span>
                                        <UserCircleIcon class="text-primary-200 w-8 h-8" />
                                        <div>
                                            {{ user.name }}
                                        </div>
                                        <ChevronDownIcon class="w-4 h-4 text-primary-300" />
                                    </MenuButton>
                                </div>
                                <transition
                                    enter-active-class="transition ease-out duration-100"
                                    enter-from-class="transform opacity-0 scale-95"
                                    enter-to-class="transform opacity-100 scale-100"
                                    leave-active-class="transition ease-in duration-75"
                                    leave-from-class="transform opacity-100 scale-100"
                                    leave-to-class="transform opacity-0 scale-95"
                                >
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
                                    </MenuItems>
                                </transition>
                            </Menu>
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
                    <div class="flex items-center px-5">
                        <div class="flex-shrink-0">
                            <UserCircleIcon class="text-primary-200 w-8 h-8" />
                        </div>
                        <div class="ml-3">
                            <div class="text-base font-medium text-white">{{ user.name }}</div>
                            <div class="text-sm font-medium text-primary-300">{{ user.email }}</div>
                        </div>
                        <button
                            type="button"
                            class="relative ml-auto flex-shrink-0 rounded-full bg-primary-700 p-1 text-primary-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                        >
                            <span class="absolute -inset-1.5" />
                            <span class="sr-only">View notifications</span>
                            <BellIcon class="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
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
        <main class="flex flex-col flex-1 overflow-y-auto text-gray-700">
            <slot />
        </main>
        <footer class="bg-primary-900 h-12"></footer>
    </div>
</template>

<style>
#__nuxt {
    height: 100%;
}
</style>
