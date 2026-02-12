<script setup lang="ts">
const searchTypeValue = defineModel<string>('search-type');
</script>

<template>
    <div class="pr-4">
        <input v-model="searchTypeValue" type="radio" name="search-type" value="metadata" checked /> Metadata
    </div>
    <div class="pr-4"><input v-model="searchTypeValue" type="radio" name="search-type" value="data" /> Data</div>
    <div><input v-model="searchTypeValue" type="radio" name="search-type" value="openDataPortal" /> EU Data Portal</div>
</template>
