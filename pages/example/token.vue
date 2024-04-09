<script setup lang="ts">
import { jwtDecode } from 'jwt-decode';

const headers = useRequestHeaders(['cookie']) as HeadersInit;
const { data: token } = await useFetch('/api/token', { headers });

function getDecodedAccessToken(at: any): any {
    try {
        return jwtDecode(at);
    } catch (Error) {
        return null;
    }
}

const tokenInfo = await getDecodedAccessToken(token.value?.access_token); // decode token
</script>

<template>
    <div class="w-full h-full">
        <div class="flex flex-col w-full mt-8 p-6">
            <hr style="height: 50px" />
            <h1>Keycloak JWT</h1>
            <code>{{ token.access_token }}</code>
            <hr style="height: 50px" />
            <h1>Decompiled JWT</h1>
            <pre>{{ tokenInfo }}</pre>
        </div>
    </div>
</template>
