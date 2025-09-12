<script lang="ts" setup>
definePageMeta({
    middleware: 'auth',
    auth: false,
});
import DOMPurify from 'dompurify';

const route = useRoute();

const { data } = await useFetch(`/api/catalog/${route.params.assetId}`);

const searchString = 'http://pistis-market.eu/purchaseOffer';
//Search in data to find the index of the offer
const index = data.value.findIndex((item) => item['@id'] && item['@id'].includes(searchString));

const contractTerms = data.value[index]['https://www.pistis-project.eu/ns/voc#contractTerms'];

const urlDecodedString = decodeURIComponent(atob(contractTerms));
const content = DOMPurify.sanitize(urlDecodedString);
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
