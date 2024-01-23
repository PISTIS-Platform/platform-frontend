<script setup lang="ts">
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const props = defineProps({
    selected: {
        type: String,
        required: true,
    },
    data: {
        type: Object,
        required: true,
    },
    options: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <Transition
        enter-active-class="duration-300 ease-out"
        enter-from-class="transform opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="duration-300 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="transform opacity-0"
    >
        <UCard>
            <template #header>
                <SubHeading :title="'Analytics for ' + selected" />
            </template>
            <div class="flex flex-col">
                <div class="flex flex-row justify-between">
                    <div class="w-full">
                        <h3>Resale</h3>
                        <Bar class="w-full h-full" :data="props.data" :options="options" />
                    </div>
                    <div class="w-full ml-4">
                        <h3 class="pl-4">Lineage</h3>
                        <Bar class="w-full h-full" :data="props.data" :options="options" />
                    </div>
                </div>
                <div class="flex flex-row mt-6 justify-between">
                    <div class="w-full">
                        <h3>Usage</h3>
                        <Bar class="w-full h-full" :data="props.data" :options="options" />
                    </div>
                    <div class="w-full ml-4">
                        <h3>Unique buyers</h3>
                        <Bar class="w-full h-full" :data="props.data" :options="options" />
                    </div>
                </div>
            </div>

            <div class="flex w-full justify-between mt-4">
                <UButton size="md" color="gray" variant="outline" :label="$t('cancel')" :trailing="false" />
            </div>
        </UCard>
    </Transition>
</template>
