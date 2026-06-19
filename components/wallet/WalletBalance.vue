<script setup lang="ts">
defineProps<{
    label: string;
    icon: string;
    amount?: number;
    pending: boolean;
    valueClass: string;
    badgeColor: string;
    badgeLabel: string;
    badgeClass?: string;
}>();
</script>

<template>
    <UCard class="flex-1">
        <div class="flex flex-col gap-2 h-full">
            <div class="flex items-center gap-2 text-gray-500 text-sm">
                <UIcon :name="icon" class="w-5 h-5" />
                {{ label }}
            </div>
            <USkeleton v-if="pending" class="h-9 w-32" />
            <span v-else class="text-3xl font-bold" :class="valueClass">
                {{ amount?.toLocaleString() ?? 'N/A' }}
            </span>
            <UBadge :color="badgeColor" variant="soft" class="w-fit mt-auto" :class="badgeClass">
                {{ badgeLabel }}
            </UBadge>
        </div>
    </UCard>
</template>
