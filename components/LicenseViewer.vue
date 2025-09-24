<script setup lang="ts">
import DOMPurify from 'dompurify';

const props = defineProps({
    assetId: {
        type: String,
        required: true,
    },
});

const { data } = await useFetch<Record<string, any>>(`/api/catalog/${props.assetId}`);

const searchString = `http://pistis-market.eu/purchaseOffer`;

//Search in data to find the index of the offer
const index = computed<number>(() =>
    data.value
        ? data.value?.findIndex((item: Record<string, any>) => item['@id'] && item['@id'].includes(searchString))
        : null,
);

const contractTerms = computed<string | null>(() =>
    data.value ? data.value[index.value]['https://www.pistis-project.eu/ns/voc#contractTerms'] : null,
);

const urlDecodedString = computed(() => decodeURIComponent(atob(contractTerms.value || '')));
const content = computed(() => DOMPurify.sanitize(urlDecodedString.value));
</script>

<template>
    <div class="w-full h-full space-y-6">
        <PageContainer>
            <UCard class="w-full h-full space-y-6">
                <div class="text-gray-800 px-8 h-full">
                    <div class="prose lg:prose-sm prose-h2:text-center max-w-full" v-html="content"></div>
                    <!-- End of Document -->
                </div>
            </UCard>
        </PageContainer>
    </div>
</template>
