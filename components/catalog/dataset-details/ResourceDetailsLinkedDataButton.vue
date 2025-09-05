<template>
    <AppLink :to="createLinkedDataURL()" target="_blank" is-tooltip="true">
        {{ text }}
    </AppLink>
</template>

<script>
// Import components used in template
// import config from '@/pages/catalog/config/appConfig';
const route = useRoute();
const pistisMode = route.query.pm;
const config = useRuntimeConfig();

let hubUrl = '';
if (pistisMode === 'factory') {
    hubUrl = config.public.factoryUrl + '/srv/repo/';
} else {
    hubUrl = config.public.cloudUrl + '/srv/repo/';
}

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
