<template>
    <Typography variant="by-heading-4"> {{ $t('monetization.header') }} </Typography>
    <div>
        <TabView>
            <TabPanel v-if="offerType === 'purchase' || offerType === 'both'" header="Purchase Offer">
                <div v-if="isObject(data)" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <p>
                        <strong>{{ $t('monetization.price') }}:</strong> {{ data.purchase_offer[0].price || '-' }} €
                    </p>

                    <p>
                        <strong>{{ $t('monetization.transferable') }}:</strong>
                        {{ data.purchase_offer[0].transferable || '-' }}
                    </p>

                    <p>
                        <strong>{{ $t('monetization.type') }}:</strong> {{ data.purchase_offer[0].type || '-' }}
                    </p>

                    <p>
                        <strong>{{ $t('monetization.exclusive') }}:</strong>
                        {{ data.purchase_offer[0].is_exclusive ? 'Yes' : 'No' || '-' }}
                    </p>

                    <p>
                        <strong>{{ $t('monetization.termination-date') }}:</strong>
                        {{ formatDate(data.purchase_offer[0].term_date) }}
                    </p>

                    <div v-if="data.purchase_offer[0].license">
                        <strong>{{ $t('monetization.license') }}: </strong>
                        <a :href="data.purchase_offer[0].license.resource" target="_blank" rel="noopener noreferrer">{{
                            data.purchase_offer[0].license.label || '-'
                        }}</a>
                    </div>

                    <div v-if="data.downloads && data.downloads.length">
                        <strong>{{ $t('monetization.downloads') }}:</strong>
                        <ul>
                            <li v-for="(dl, index) in data.downloads" :key="index">
                                {{ dl.frequency || '-' }}: {{ dl.downloads || '-' }}
                            </li>
                        </ul>
                    </div>

                    <div
                        v-if="
                            data.purchase_offer[0].personal_data_terms &&
                            data.purchase_offer[0].personal_data_terms.length
                        "
                    >
                        <strong>{{ $t('monetization.personal-data-terms') }}:</strong>
                        <ul>
                            <li v-for="(term, index) in data.purchase_offer[0].personal_data_terms" :key="index">
                                <span>{{ term.personal_data_terms || '-' }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </TabPanel>
            <TabPanel v-if="offerType === 'invest' || offerType === 'both'" header="Investment Offer">
                <div v-if="isObject(data)" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <p>
                        <strong>{{ $t('monetization.price-per-share') }}:</strong>
                        {{ data.investment_offer[0].price_per_share || '-' }}
                    </p>

                    <p>
                        <strong>{{ $t('monetization.available-shares') }}:</strong>
                        {{ data.investment_offer[0].available_shares || '-' }}
                    </p>

                    <p>
                        <strong>{{ $t('monetization.termination-date') }}:</strong>
                        {{ formatDate(data.investment_offer[0].term_date) }}
                    </p>

                    <p>
                        <strong>{{ $t('monetization.total-shares') }}:</strong>
                        {{ data.investment_offer[0].total_shares || '-' }}
                    </p>

                    <p>
                        <strong>{{ $t('monetization.percentage-offer') }}: </strong>
                        {{ data.investment_offer[0].percentage_offer || '-' }}
                    </p>

                    <p>
                        <strong>{{ $t('monetization.max-shares') }}: </strong>
                        {{ data.investment_offer[0].max_shares || '-' }}
                    </p>

                    <p>
                        <strong>{{ $t('monetization.is-active') }}: </strong>
                        {{ data.investment_offer[0].is_active || '-' }}
                    </p>
                </div>
            </TabPanel>
        </TabView>
    </div>
</template>

<script setup>
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import { defineProps } from 'vue';

const _props = defineProps({
    data: {
        type: Object,
        required: true,
    },
    offerType: {
        type: String,
        required: true,
    },
});

const isObject = (value) => {
    return value && typeof value === 'object' && !Array.isArray(value);
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
};
</script>

<style>
.p-tabview-title {
    @apply text-gray-400 text-xl hover:text-pistis-600;
}
[aria-selected='true'] .p-tabview-title {
    @apply text-gray-800 underline;
}
.p-tabview-panels {
    @apply p-1;
}
.p-tabview-nav-link {
    @apply pl-1 pt-5 pr-3 pb-2;
}
</style>
