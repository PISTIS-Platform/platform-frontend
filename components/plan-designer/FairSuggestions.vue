<script setup lang="ts">
const props = defineProps({
    modelValue: {
        type: Object as PropType<{
            overallRating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
            dataQuality: number;
            technical: number;
            business: number;
            legal: number;
            privacy: number;
        }>,
        required: true,
    },
    loadingValuation: {
        type: Boolean,
        required: true,
    },
});

const computedColor = computed(() => {
    switch (props.modelValue.overallRating) {
        case 'A':
        case 'B':
            return 'bg-green-500';
        case 'C':
        case 'D':
            return 'bg-yellow-500';
        case 'E':
        case 'F':
            return 'bg-red-500';
        default:
            return 'bg-gray-500';
    }
});

//TODO: Include emits for updating the oneOffPrice and subscriptionPrice here when there is an API call
// setInterval(() => {
//     receivedValuation.value = false;
// }, 10000);
</script>

<template>
    <UCard class="bg-secondary-50 border border-secondary-500">
        <template #header>
            <div class="flex justify-between gap-4 items-start">
                <div class="flex items-center gap-8">
                    <UIcon name="ri:price-tag-3-fill" class="w-10 h-10 text-gray-500 -mr-4" />
                    <SubHeading :title="$t('data.designer.fairTitle')" :info="$t('data.designer.fairInfo')" />
                </div>
                <a href="" class="text-xs text-primary-500 underline">{{ $t('learnMore') }}</a>
            </div>
        </template>
        <div v-if="loadingValuation">
            <UProgress animation="carousel" />
        </div>
        <div v-else class="space-y-5">
            <div class="flex items-center gap-4">
                <span class="w-28 whitespace-nowrap">{{ $t('data.designer.overallRating') }}:</span>
                <div
                    :class="[
                        'h-7 w-7 flex items-center justify-center text-white rounded-full font-bold',
                        computedColor,
                    ]"
                >
                    {{ modelValue.overallRating }}
                </div>
            </div>

            <div class="flex items-center gap-2 divide-x-2">
                <div
                    v-for="(key, idx) in Object.keys(modelValue).slice(1)"
                    :key="key"
                    class="flex items-start gap-4 whitespace-nowrap"
                    :class="idx === 0 ? '' : 'pl-2'"
                >
                    <div>{{ $t(`data.designer.${key}`) }}:</div>
                    <span class="font-bold">{{ modelValue[key] }}</span>
                </div>
            </div>
        </div>
    </UCard>
</template>
