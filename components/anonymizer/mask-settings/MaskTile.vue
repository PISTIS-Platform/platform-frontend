<script setup lang="ts">
import {
    type ConfigEmit,
    type FakerSettings,
    type HashSettings,
    type LocationSettings,
    type MaskDetail,
    type RangeSettings,
} from '~/interfaces/mask-settings';
import { useAnonymizerStore } from '~/store/anonymizer';

import Delete from './Delete.vue';
import Faker from './Faker.vue';
import Hash from './Hash.vue';
import Location from './Location.vue';
import None from './None.vue';
import Range from './Range.vue';

/**
 * Defines custom properties for the MaskTile component.
 * Accepted properties are:
 *  - column - name of the column.
 *  - masks - list of available masks.
 *  - default - name of the mask to display by default.
 */
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

/**
 * List of mask names.
 */
const maskNames: string[] = props.masks.map((mask) => mask.name);

/**
 * Defines and emit that occurs when the configuration of the MaskTile changes.
 */
const emit = defineEmits(['configChange']);

/**
 * Configuraton of the mask tile.
 */
const config = reactive<ConfigEmit>({
    mask: props.default,
    config: {
        name: props.column,
    },
});

/**
 * Reference to the anonymiser pinia store.
 */
const anonymizerStore = useAnonymizerStore();

/**
 * Listen for changes in the anonymiser pinia store state and update the mask tile accordingly
 */
anonymizerStore.$subscribe((mutation, state) => {
    const recommendation = state.metadata.recommendation[props.column];
    if (recommendation) {
        config.mask = state.metadata.recommendation[props.column] as string;
        config.config = {
            name: props.column,
        };
    }
});

/**
 * list of all possible mask settings components.
 */
const maskMap: {
    [key: string]: typeof Delete | typeof Faker | typeof Hash | typeof Location | typeof None | typeof Range;
} = {
    delete: Delete,
    faker: Faker,
    hash: Hash,
    location: Location,
    none: None,
    range: Range,
};

/**
 * Get a mask component from the mask map
 *
 * @param maskName name of the mask
 * @return the mask settings component
 */
function loadMaskComponent(maskName: string) {
    return maskMap[maskName];
}

/**
 * Update the MaskTile's current configuration.
 *
 * @param settings Settings object to merge. All keys from the settings object will be added to the configuration
 */
function updateConfig(settings: LocationSettings | RangeSettings | HashSettings | FakerSettings) {
    Object.assign(config.config, settings);
}

/**
 * Clear the configuration of all irrelevant keys.
 */
function clearConfig() {
    var preservedField;

    switch (config.mask) {
        case 'faker':
            preservedField = 'replacer';
            break;

        case 'hash':
            preservedField = 'classification';
            break;

        case 'location':
            preservedField = 'isLat';
            break;

        case 'range':
            preservedField = 'interval';
            break;

        default:
            preservedField = 'none';
            break;
    }

    for (const [key] of Object.entries(config.config)) {
        if (key !== 'name' && key !== preservedField) {
            delete config.config[key];
        }
    }
}

/**
 * What for configuration changes and emit the changes.
 */
watch(config, () => {
    emit('configChange', config);
});

/**
 * Emit the configuration on initialisation.
 */
onMounted(() => {
    emit('configChange', config);
});
</script>

<template>
    <!--Container for displaying mask settings menus.-->
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
