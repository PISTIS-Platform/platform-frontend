<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

import { MaskDetail } from '~/interfaces/mask-settings';

const props = defineProps({
    column: {
        type: String,
        default: 'No Column Name!',
    },
    masks: {
        type: Array<MaskDetail>,
        default: [],
    },
    default: {
        type: String,
        default: 'none',
    },
});

const currentMask = ref<string>(props.default);
const availableMasks = props.masks.map((mask) => mask.name);

//Mask name maps to the component names found in mask-settings
//Used to dynamically load mask components by name
function loadMaskComponent(maskName: string) {
    maskName = formatName(maskName);
    return defineAsyncComponent(() => import(`./${maskName}.vue`));
}

function formatName(maskName: string): string {
    return maskName[0].toUpperCase() + maskName.slice(1);
}
</script>

<template>
    <div class="flex flex-col gap-2 min-w-[17rem] border p-2 rounded-md shadow-md bg-pistis-50">
        <h3 class="text-md font-bold">{{ props.column }}</h3>
        <USelect v-model="currentMask" :options="availableMasks"></USelect>
        <div class="min-h-[8rem] border w-full p-2 rounded-md bg-white">
            <component :is="loadMaskComponent(currentMask)"></component>
        </div>
    </div>
</template>
