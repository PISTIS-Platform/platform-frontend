<template>
    <AppLink :to="createLinkedDataURL()" target="_blank" is-tooltip="true">
        {{ text }}
    </AppLink>
</template>

<script>
const route = useRoute();
const pistisMode = route.query.pm;
import { useApiService } from '~/services/apiService';

const { getRepoUrl } = useApiService(pistisMode);

const hubUrl = getRepoUrl();

import AppLink from './AppLink.vue';
// Import glue-config.js

export default {
    name: 'ResourceDetailsLinkedDataButton',
    components: {
        AppLink,
    },
    props: {
        text: {
            type: String,
            default: '',
        },
        format: {
            type: String,
            default: '',
            required: true,
        },
        resourcesId: {
            type: String,
            default: '',
            required: true,
        },
        resources: {
            type: String,
            default: '',
            required: true,
        },
    },
    data() {
        return {};
    },
    computed: {},
    methods: {
        createLinkedDataURL() {
            if (this.resources === 'distributions') {
                return `${hubUrl}distributions/${this.resourcesId}.${this.format}`;
            }
            if (this.resources === 'datasets') {
                return `${hubUrl}datasets/${this.resourcesId}.${this.format}?useNormalizedId=true&locale=${this.$route.query.locale}`;
            }
            if (this.resources === 'catalogues') {
                return `${hubUrl}catalogues/${this.resourcesId}.${this.format}`;
            }
            return '';
        },
    },
};
</script>

<style lang="scss" scoped></style>
