<script lang="ts" setup>
import { Disclosure } from '@headlessui/vue';

defineProps<{
    navigation: {
        name: string;
        to: string;
    }[];
}>();
</script>

<template>
    <div class="flex flex-col flex-1">
        <Disclosure as="nav" class="bg-white shadow-sm sticky top-0 z-40">
            <div class="mx-auto px-2 max-w-7xl">
                <div class="flex h-12 justify-start">
                    <div class="flex">
                        <div class="-my-px ml-6 flex space-x-8">
                            <NuxtLink
                                v-for="item in navigation"
                                :key="item.name"
                                :to="item.to"
                                exact-active-class="!border-primary-600 text-gray-900"
                                :class="[
                                    'border-transparent text-gray-500 hover:border-primary-600 hover:text-gray-700',
                                    'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                                ]"
                                >{{ $t(item.name) }}</NuxtLink
                            >
                        </div>
                    </div>
                </div>
            </div>
        </Disclosure>

        <div class="py-6 justify-center items-center px-8 flex flex-col flex-1 max-w-7xl mx-auto w-full">
            <slot />
        </div>
    </div>
</template>
