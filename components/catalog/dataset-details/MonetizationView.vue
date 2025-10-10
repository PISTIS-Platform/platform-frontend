<script setup>
import { defineProps } from 'vue';

const props = defineProps({
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

const items = computed(() => {
    const tabs = [];

    if (props.data?.purchase_offer?.[0]) {
        tabs.push({
            label:
                props.data.purchase_offer[0].type === 'one-off'
                    ? 'One-off Purchase'
                    : props.data.purchase_offer[0].type === 'subscription'
                      ? 'Subscription'
                      : 'NFT',
            slot: 'purchase',
        });
    }

    if (props.data?.investment_offer?.[0]) {
        tabs.push({ label: 'Investment', slot: 'investment' });
    }

    return tabs;
});

const licenseOpen = ref(false);
</script>

<template>
    <UModal v-model="licenseOpen" :ui="{ width: 'sm:max-w-5xl', overlay: { background: 'bg-gray-800/75' } }">
        <LicenseViewer :asset-id="data.purchase_offer[0].license.resource.split('/').at(-1)" />
    </UModal>
    <UTabs
        :items="items"
        :ui="
            items.length === 1
                ? { list: { base: 'hidden' } }
                : {
                      list: {
                          base: '!w-fit bg-primary-100', // Replace the default full-width with width-fit-content
                      },
                  }
        "
    >
        <template #purchase>
            <div v-if="isObject(data)" class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 mt-4">
                <SummaryBox :title="$t('monetization.type')">
                    <template #text>
                        {{ data.purchase_offer[0].type }}
                    </template>
                </SummaryBox>

                <SummaryBox :title="$t('monetization.transferable')">
                    <template #text>
                        {{ data.purchase_offer[0].transferable || '-' }}
                    </template>
                </SummaryBox>

                <SummaryBox :title="$t('monetization.exclusive')">
                    <template #text>
                        {{ data.purchase_offer[0].is_exclusive ? 'Yes' : 'No' || '-' }}
                    </template>
                </SummaryBox>

                <SummaryBox :title="$t('duration')">
                    <template #text>
                        {{ data.purchase_offer[0].duration || '-' }}
                    </template>
                </SummaryBox>

                <SummaryBox :title="$t('perpetual')">
                    <template #text>
                        {{ data.purchase_offer[0].perpetual || '-' }}
                    </template>
                </SummaryBox>

                <SummaryBox v-if="data.purchase_offer[0].license" :title="$t('monetization.license')">
                    <template #text>
                        <span class="text-primary-500 cursor-pointer" @click="licenseOpen = !licenseOpen">{{
                            data.purchase_offer[0].license.label || '-'
                        }}</span>
                    </template>
                </SummaryBox>

                <SummaryBox v-if="data.purchase_offer[0].update_frequency" title="Data Updated">
                    <template #text>
                        {{ data.purchase_offer[0].update_frequency }}
                    </template>
                </SummaryBox>

                <SummaryBox v-if="data.downloads && data.downloads.length">
                    <template #text>
                        <ul>
                            <li v-for="(dl, index) in data.downloads" :key="index">
                                {{ dl.frequency || '-' }}: {{ dl.downloads || '-' }}
                            </li>
                        </ul>
                    </template>
                </SummaryBox>

                <SummaryBox
                    v-if="data.purchase_offer?.[0]?.personal_data_terms?.[0]?.contains_personal_data === true"
                    :title="$t('monetization.personal-data-terms')"
                    class="md:col-span-3"
                >
                    <template #text>
                        <ul>
                            <li v-for="(term, index) in data.purchase_offer[0].personal_data_terms" :key="index">
                                <span>{{ term.personal_data_terms || '-' }}</span>
                            </li>
                        </ul>
                    </template>
                </SummaryBox>
            </div>
        </template>
        <template #investment>
            <div v-if="isObject(data)" class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                <SummaryBox :title="$t('monetization.price-per-share')">
                    <template #text>{{ data.investment_offer[0].price_per_share || '-' }}</template>
                </SummaryBox>

                <SummaryBox :title="$t('monetization.available-shares')">
                    <template #text>{{ data.investment_offer[0].available_shares || '-' }}</template>
                </SummaryBox>

                <SummaryBox :title="$t('monetization.termination-date')">
                    <template #text>{{ formatDate(data.investment_offer[0].term_date) }}</template>
                </SummaryBox>

                <SummaryBox :title="$t('monetization.total-shares')">
                    <template #text>{{ data.investment_offer[0].total_shares || '-' }}</template>
                </SummaryBox>

                <SummaryBox :title="$t('monetization.percentage-offer')">
                    <template #text>{{ data.investment_offer[0].percentage_offer || '-' }}</template>
                </SummaryBox>

                <SummaryBox :title="$t('monetization.max-shares')">
                    <template #text>{{ data.investment_offer[0].max_shares || '-' }}</template>
                </SummaryBox>

                <SummaryBox :title="$t('monetization.is-active')">
                    <template #text>{{ data.investment_offer[0].is_active || '-' }}</template>
                </SummaryBox>
            </div>
        </template>
    </UTabs>
</template>
