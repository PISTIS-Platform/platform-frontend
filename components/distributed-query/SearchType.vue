<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const searchTypeValue = computed({
    get(): string {
        const pm = route.query.pm;
        const type = route.query.type;

        if (pm === 'openData') return 'openDataPortal';
        if (pm === 'cloud' && type === 'metadata') return 'metadata';
        if (pm === 'cloud' && type === 'data') return 'data';

        return 'metadata';
    },

    set(value: string) {
        if (value === 'openDataPortal') {
            router.push({
                path: '/marketplace/open-data-portal/openDataPortal',
                query: { pm: 'openData' },
            });
        } else {
            router.push({
                path: '/marketplace',
                query: {
                    pm: 'cloud',
                    type: value,
                },
            });
        }
    },
});
</script>

<template>
    <div class="flex">
        <div class="pr-4">
            <input v-model="searchTypeValue" type="radio" name="search-type" value="metadata" /> Metadata
        </div>
        <div class="pr-4"><input v-model="searchTypeValue" type="radio" name="search-type" value="data" /> Data</div>
        <div>
            <input v-model="searchTypeValue" type="radio" name="search-type" value="openDataPortal" /> EU Data Portal
        </div>
    </div>
</template>
