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

const idTokenInfo = await getDecodedAccessToken(token.value?.id_token); // decode token
const accessTokenInfo = await getDecodedAccessToken(token.value?.access_token); // decode token
</script>

<template>
    <div class="w-full h-full">
        <div class="flex flex-col w-full mt-8 p-6">
            <hr style="height: 50px" />
            <h1>Decompiled ID Token</h1>
            <pre>{{ idTokenInfo }}</pre>
            <hr style="height: 50px" />
            <h1>Decompiled Access Token (for account audience)</h1>
            <pre>{{ accessTokenInfo }}</pre>
        </div>
    </div>
</template>
