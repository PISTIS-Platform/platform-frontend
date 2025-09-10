<template>
    <Typography variant="by-heading-4"> {{ $t('monetization.header') }} </Typography>
    <div v-if="isObject(data)" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <p>
            <strong>{{ $t('monetization.transferable') }}:</strong> {{ data.purchase_offer[0].transferable || '-' }}
        </p>

        <p>
            <strong>{{ $t('monetization.type') }}:</strong> {{ data.purchase_offer[0].type || '-' }}
        </p>

        <p>
            <strong>{{ $t('monetization.exclusive') }}:</strong>
            {{ data.purchase_offer[0].is_exclusive ? 'Yes' : 'No' || '-' }}
        </p>

        <p>
            <strong>{{ $t('monetization.termination-date') }}:</strong> {{ data.purchase_offer[0].term_date || '-' }}
        </p>

        <p>
            <strong>{{ $t('monetization.price') }}:</strong> {{ data.purchase_offer[0].price || '-' }} €
        </p>

        <div v-if="data.downloads && data.downloads.length">
            <strong>{{ $t('monetization.downloads') }}:</strong>
            <ul>
                <li v-for="(dl, index) in data.downloads" :key="index">
                    {{ dl.frequency || '-' }}: {{ dl.downloads || '-' }}
                </li>
            </ul>
        </div>

        <div v-if="data.purchase_offer[0].personal_data_terms && data.purchase_offer[0].personal_data_terms.length">
            <strong>{{ $t('monetization.personal-data-terms') }}:</strong>
            <ul>
                <li v-for="(term, index) in data.purchase_offer[0].personal_data_terms" :key="index">
                    <span>{{ term.personal_data_terms || '-' }}</span>
                </li>
            </ul>
        </div>

        <div v-if="data.purchase_offer[0].license">
            <strong>{{ $t('monetization.license') }}:</strong>
            <a :href="data.purchase_offer[0].license.resource" target="_blank" rel="noopener noreferrer">{{
                data.purchase_offer[0].license.label || '-'
            }}</a>
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

const _props = defineProps({
    data: {
        type: Object,
        required: true,
    },
});

const isObject = (value) => {
    return value && typeof value === 'object' && !Array.isArray(value);
};
</script>

<style scoped>
p,
div {
    padding-top: 1rem;
}
</style>
