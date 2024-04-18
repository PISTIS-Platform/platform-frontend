<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

import {
    ConfigEmit,
    FakerSettings,
    HashSettings,
    LocationSettings,
    MaskDetail,
    RangeSettings,
} from '~/interfaces/mask-settings';
import { useAnonymizerStore } from '~/store/anonymizer';

//get default and masks from anonymizerStore instead
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

const maskNames: string[] = props.masks.map((mask) => mask.name);

//Should emit current mask and config
const emit = defineEmits(['configChange']);

const config = reactive<ConfigEmit>({
    mask: props.default,
    config: {
        name: props.column,
    },
});

const anonymizerStore = useAnonymizerStore();

//For updating mask recommendations after an obfuscation
anonymizerStore.$subscribe((mutation, state) => {
    const recommendation = state.metadata.recommendation[props.column];
    if (recommendation) {
        config.mask = state.metadata.recommendation[props.column] as string;
        config.config = {
            name: props.column,
        };
    }
});

//Mask name maps to the component names found in mask-settings
//Used to dynamically load mask components by name
function loadMaskComponent(maskName: string) {
    maskName = formatName(maskName);
    return defineAsyncComponent(() => import(/* @vite-ignore */ `./${maskName}.vue`));
}

function formatName(maskName: string): string {
    return maskName[0].toUpperCase() + maskName.slice(1);
}

function updateConfig(settings: LocationSettings | RangeSettings | HashSettings | FakerSettings) {
    Object.assign(config.config, settings);
}

function clearConfig() {
    for (const [key] of Object.entries(config.config)) {
        if (key !== 'name') {
            delete config.config[key];
        }
    }
}

watch(config, () => {
    emit('configChange', config);
});

onMounted(() => {
    emit('configChange', config);
});
</script>

<template>
    <div class="flex flex-col gap-2 min-w-[17rem] border p-2 rounded-md shadow-md bg-pistis-50">
        <h3 class="text-md font-bold">{{ props.column }}</h3>
        <USelect v-model="config.mask" :options="maskNames" @change="clearConfig" />
        <div class="min-h-[8rem] border w-full p-2 rounded-md bg-white">
            <component
                :is="loadMaskComponent(config.mask)"
                :column="props.column"
                @settings-change="(settings: any) => updateConfig(settings)"
            />
        </div>
    </div>
</template>
