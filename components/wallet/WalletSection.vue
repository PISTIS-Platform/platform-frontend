<script setup lang="ts">
withDefaults(
    defineProps<{
        title: string;
        icon: string;
        iconWrapperClass?: string;
        iconClass?: string;
        open: boolean;
    }>(),
    {
        iconWrapperClass: 'bg-primary-100',
        iconClass: 'text-primary-600',
    },
);

defineEmits<{ toggle: [] }>();
</script>

<template>
    <div class="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <button
            class="flex w-full items-center gap-3 py-3 px-4 transition-colors duration-150"
            :class="open ? 'bg-primary-50 hover:bg-primary-100' : 'bg-white hover:bg-primary-50'"
            @click="$emit('toggle')"
        >
            <div class="rounded-lg p-2" :class="iconWrapperClass">
                <UIcon :name="icon" class="w-5 h-5" :class="iconClass" />
            </div>
            <span class="font-semibold text-gray-800 flex-1 text-left">{{ title }}</span>
            <UIcon
                name="i-heroicons-chevron-up-20-solid"
                class="w-5 h-5 text-primary-600 transition-transform duration-200"
                :class="{ 'rotate-180': !open }"
            />
        </button>

        <div v-if="open" class="p-6">
            <slot />
        </div>
    </div>
</template>
