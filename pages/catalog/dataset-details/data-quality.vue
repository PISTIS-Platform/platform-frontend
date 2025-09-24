<!-- eslint-disable prettier/prettier -->
<template>
    <div class="text-gray-800">
        <!-- Main Content -->
        <main class="container mx-auto p-1">
            <div class="flex justify-between">
                <!-- Back Button -->
                <button class="-ml-6 mt-[10px] px-4 py-1 cursor-pointer" @click="router.back()">
                    <Typography
                        variant="paragraph-1"
                        class="flex items-center gap-2 text-primary hover:text-primary-hover"
                    >
                        <PhCaretLeft />
                        <span>back</span>
                    </Typography>
                </button>
            </div>
            <!-- Title Section -->
            <h3 class="mt-5 text-4xl text-primary-600 font-semibold">{{ title }}</h3>
            <h5 class="mb-5 text-lg">
                <span class="italic">by</span> <span class="font-semibold">{{ subtitle }}</span>
            </h5>

            <section class="mb-10">
                <h3 class="text-2xl font-semibold text-gray-700 mb-2">Metadata quality</h3>
                <p class="text-gray-600 mb-6">
                    The Metadata Quality Assurance is intended to help data providers and data portals to check their
                    metadata against various indicators.
                    <!-- For information on which metrics we use for indicator
                    measurements, please have a look at our
                    <a href="#" class="text-purple-600 hover:underline">methodology page</a>. -->
                </p>

                <!-- Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        v-for="card in relevantMetrics"
                        :key="card.title"
                        :class="` bg-gray-200 border border-gray-500 p-6 rounded-lg shadow-lg`"
                    >
                        <!-- :class="`${card.bg} ${card.text} p-6 rounded-lg shadow-lg`" -->
                        <h4 class="text-xl font-semibold text-pistis-700 mb-4">{{ card.title }}</h4>
                        <ul class="space-y-3 text-sm">
                            <li v-for="line in card.items" :key="line.title" class="flex justify-between items-center">
                                <span class="wrap-anywhere">{{ Object.keys(line)[0] }}</span>
                                <span class="metadata-value bg-pistis-300 font-bold">{{
                                    line[Object.keys(line)[0]]
                                }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- Distribution Quality Section -->
            <section class="mb-10">
                <h3 class="text-2xl font-semibold text-gray-700 mb-2">Distribution Metadata Quality</h3>
                <p class="text-gray-600 mb-6">
                    The following lists the quality measurement of all distributions of the dataset.
                    <!-- For more information, see our
                    <NuxtLink to="/methodology" class="text-purple-600 hover:underline">methodology page</NuxtLink>. -->
                </p>

                <div class="space-y-4">
                    <!-- NUXT ACCORDIOUNS -->
                    <UAccordion :items="items" type="multiple">
                        <template #item>
                            <div class="p-4 text-gray-700">
                                <div class="accordion-content p-4 text-sm text-gray-600">
                                    <div class="space-y-5">
                                        <!-- Accessibility Details -->
                                        <div>
                                            <h5 class="text-md font-semibold text-gray-700 mb-2">Accessibility</h5>
                                            <ul class="space-y-2 pl-2">
                                                <li class="flex justify-between items-center">
                                                    <span>Download URL</span>
                                                    <span class="distribution-metadata-value">yes</span>
                                                </li>
                                                <li class="flex justify-between items-center">
                                                    <span>Most frequent accessURL status code</span>
                                                    <span class="distribution-metadata-value">200</span>
                                                </li>
                                                <li class="flex justify-between items-center">
                                                    <span>Most frequent downloadURL status code</span>
                                                    <span class="distribution-metadata-value">200</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <!-- Reusability Details -->
                                        <div>
                                            <h5 class="text-md font-semibold text-gray-700 mb-2">Reusability</h5>
                                            <ul class="space-y-2 pl-2">
                                                <li class="flex justify-between items-center">
                                                    <span>License information</span>
                                                    <span class="distribution-metadata-value">no</span>
                                                </li>
                                                <!-- Add more mock reusability metrics if needed -->
                                            </ul>
                                        </div>
                                        <!-- Contextuality Details -->
                                        <div>
                                            <h5 class="text-md font-semibold text-gray-700 mb-2">Contextuality</h5>
                                            <ul class="space-y-2 pl-2">
                                                <li class="flex justify-between items-center">
                                                    <span>File size</span>
                                                    <span class="distribution-metadata-value">yes</span>
                                                </li>
                                                <li class="flex justify-between items-center">
                                                    <span>Rights</span>
                                                    <span class="distribution-metadata-value">no</span>
                                                </li>
                                                <li class="flex justify-between items-center">
                                                    <span>Modification date</span>
                                                    <span class="distribution-metadata-value">yes</span>
                                                </li>
                                                <li class="flex justify-between items-center">
                                                    <span>Date of issue</span>
                                                    <span class="distribution-metadata-value">yes</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <!-- Interoperability Details -->
                                        <div>
                                            <h5 class="text-md font-semibold text-gray-700 mb-2">Interoperability</h5>
                                            <ul class="space-y-2 pl-2">
                                                <li class="flex justify-between items-center">
                                                    <span>Format</span>
                                                    <span class="distribution-metadata-value">yes</span>
                                                </li>
                                                <li class="flex justify-between items-center">
                                                    <span>Media type</span>
                                                    <span class="distribution-metadata-value">yes</span>
                                                </li>
                                                <li class="flex justify-between items-center">
                                                    <span>Format/Media type from vocabulary</span>
                                                    <span class="distribution-metadata-value">yes</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </UAccordion>
                </div>
            </section>

            <!-- Distribution Quality Section -->
            <section class="mb-10">
                <h3 class="text-2xl font-semibold text-gray-700 mb-2">Distribution Data Quality</h3>
                <p class="text-gray-600 mb-6">
                    The following lists the quality measurement of all distributions of the dataset.
                    <!-- For more information, see our
                    <NuxtLink to="/methodology" class="text-purple-600 hover:underline">methodology page</NuxtLink>. -->
                </p>

                <div class="space-y-4">
                    <!-- NUXT ACCORDIOUNS -->
                    <UAccordion :items="items" type="multiple">
                        <template #item>
                            <div class="p-4 text-gray-700">
                                <div class="accordion-content p-3 text-sm text-gray-500">
                                    <div class="space-y-5">
                                        <!-- Accuracy Details -->
                                        <div>
                                            <h5 class="text-md font-semibold text-gray-700 mb-2">Accuracy</h5>
                                            <ul class="space-y-2 pl-2">
                                                <li class="flex justify-between items-center">
                                                    <span>ExpectColumnValuesToBeInSet (Type Object)</span>
                                                    <span class="distribution-metadata-value">0.97</span>
                                                </li>
                                                <li class="flex justify-between items-center">
                                                    <span>ExpectColumnValuesToBeInSet (Disponibilité)</span>
                                                    <span class="distribution-metadata-value">1.0</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <!-- Consistency Details -->
                                        <div>
                                            <h5 class="text-md font-semibold text-gray-700 mb-2">Consistency</h5>
                                            <ul class="space-y-2 pl-2">
                                                <li class="flex justify-between items-center">
                                                    <span>ExpectColumnValuesToMatchRegexList (N° Voie Pair)</span>
                                                    <span class="distribution-metadata-value">0.95</span>
                                                </li>
                                                <li class="flex justify-between items-center">
                                                    <span>ExpectColumnValuesToMatchRegexList (N° Voie Impair)</span>
                                                    <span class="distribution-metadata-value">0.93</span>
                                                </li>
                                                <!-- Add more mock reusability metrics if needed -->
                                            </ul>
                                        </div>
                                        <!-- Completeness Details -->
                                        <div>
                                            <h5 class="text-md font-semibold text-gray-700 mb-2">Completeness</h5>
                                            <ul class="space-y-2 pl-2">
                                                <li class="flex justify-between items-center">
                                                    <span>ExpectColumnValuesToNotBeNull (Modèle)</span>
                                                    <span class="distribution-metadata-value">0.99</span>
                                                </li>
                                                <li class="flex justify-between items-center">
                                                    <span>ExpectColumnValuesToNotBeNull (N° Voie Pair)</span>
                                                    <span class="distribution-metadata-value">0.18</span>
                                                </li>
                                                <li class="flex justify-between items-center">
                                                    <span>ExpectColumnValuesToNotBeNull (N° Voie Impair)</span>
                                                    <span class="distribution-metadata-value">0.20</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <!-- Uniqueness Details -->
                                        <div>
                                            <h5 class="text-md font-semibold text-gray-700 mb-2">Uniqueness</h5>
                                            <ul class="space-y-2 pl-2">
                                                <li class="flex justify-between items-center">
                                                    <span>ExpectColumnValuesToBeUnique (Identifiant)</span>
                                                    <span class="distribution-metadata-value">1.0</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <!-- Validity Details -->
                                        <div>
                                            <h5 class="text-md font-semibold text-gray-700 mb-2">Validity</h5>
                                            <ul class="space-y-2 pl-2">
                                                <li class="flex justify-between items-center">
                                                    <span>ExpectTableColumnsToMatchSet</span>
                                                    <span class="distribution-metadata-value">1.0</span>
                                                </li>
                                                <li class="flex justify-between items-center">
                                                    <span>ExpectTableRowCountToEqual</span>
                                                    <span class="distribution-metadata-value">1.0</span>
                                                </li>
                                                <li class="flex justify-between items-center">
                                                    <span>ExpectTableColumnCountToEqual</span>
                                                    <span class="distribution-metadata-value">1.0</span>
                                                </li>
                                                <li class="flex justify-between items-center">
                                                    <span>ExpectColumnValuesToBeOfType (Type Object)</span>
                                                    <span class="distribution-metadata-value">1.0</span>
                                                </li>
                                                <li class="flex justify-between items-center">
                                                    <span>ExpectColumnValuesToBeOfType (Modèle)</span>
                                                    <span class="distribution-metadata-value">1.0</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </UAccordion>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

import { getMetricsData } from '~/components/catalog/dataset-details/DataQualityService';
import PhCaretLeft from '~icons/ph/caret-left';

const router = useRouter();
const route = useRoute();

const { datasetId, title, subtitle } = route.query;

const metricData = ref({});
const relevantMetrics = ref([]);

const loadData = async () => {
    try {
        const response = await getMetricsData(datasetId);
        metricData.value = response.result.results[0][0];
        relevantMetrics.value = [
            {
                title: 'Accessibility',
                items: metricData.value.accessibility,
            },
            {
                title: 'Contextuality',
                items: metricData.value.contextuality,
            },
            {
                title: 'Interoperability',
                items: metricData.value.interoperability,
            },
            {
                title: 'Reusability',
                items: metricData.value.reusability,
            },
        ];
    } catch (error) {
        console.error('Loading data failed:', error);
    }
};

// MockItems
const items = [
    // {
    //     label: 'dist.csv',
    //     icon: 'i-lucide-box',
    // },
    // {
    //     label: 'dist.zip',
    //     icon: 'i-lucide-box',
    // },
    // {
    //     label: 'dist.json',
    //     icon: 'i-lucide-box',
    // },
];

onMounted(() => {
    loadData();
});
</script>

<style scoped>
/* Metadata highlights */
.wrap-anywhere {
    overflow-wrap: anywhere;
}

.metadata-value {
    background-color: #c5c8ff;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid #a2a4ff;
    min-width: 60px;
    text-align: center;
}
.metadata-value-yellow {
    background-color: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #374151;
}
.distribution-metadata-value {
    background-color: #c5c8ff;
    /* color: #5b21b6; */
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid #a2a4ff;
    min-width: 50px;
    text-align: center;
    font-weight: 500;
}
</style>
