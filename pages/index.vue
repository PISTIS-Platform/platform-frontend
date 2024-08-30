<script lang="ts" setup>
definePageMeta({
    middleware: 'auth',
    auth: false,
    layout: 'home',
});

const { status, signIn } = useAuth();

const runtimeConfig = useRuntimeConfig();

const orgName = computed(() => runtimeConfig.public?.orgName || 'My Organisation');
const orgLogo = computed(() => runtimeConfig.public?.orgLogo || '');

const callbackUrl = '/home';
</script>

<template>
    <div class="w-full h-screen bg-primary-950">
        <div class="flex flex-col flex-1 max-w-7xl mx-auto">
            <nav aria-label="Global" class="relative flex flex-row sm:items-center justify-between py-6">
                <!-- Left Menu -->
                <div class="flex flex-row space-x-10 items-center gap-2">
                    <div class="sm:w-full md:w-auto">
                        <NuxtLink :to="'/'" class="flex-shrink-0">
                            <img class="h-12 w-36 sm:h-16 sm:w-60" src="/img/PISTIS_logo_white.png" alt="PISTIS logo" />
                        </NuxtLink>
                    </div>
                    <NuxtLink
                        v-if="status === 'authenticated'"
                        :to="'/home/'"
                        class="flex-shrink-0 rounded-md mt-2 px-4 py-2 text-base font-medium text-white bg-primary-950 border border-white hover:primary-text-950 hover:bg-primary-900 cursor-pointer transition-all"
                        >Home</NuxtLink
                    >
                </div>
            </nav>

            <div class="flex flex-col items-center justify-center w-full gap-12 mt-12">
                <h2 class="text-white font-semibold text-center tracking-wide text-2xl xl:text-4xl">
                    {{ orgName }} PISTIS Data Factory
                </h2>
                <p class="font-normal text-center tracking-wider text-sm lg:text-base text-white max-w-4xl">
                    PISTIS allows member organisations to sell and buy data, opening up new revenue streams through the
                    monetisation of data assets. Using the PISTIS infrastructure, organisations can improve the quality
                    of their in-house data, and place them on the market, though different revenue mechanisms to enjoy
                    monetary benefits via secure and privacy aware data sharing modes.
                </p>

                <!-- Organization logo -->
                <div class="flex justify-center items-center">
                    <img v-if="orgLogo" class="w-44 h-20" :src="`/img/${orgLogo}`" alt="Pistis Organisation Logo" />
                </div>

                <!-- Sign In button -->
                <div v-if="status !== 'authenticated'" class="flex">
                    <button
                        class="inline-flex items-center px-4 py-2 text-lg font-medium text-primary-800 bg-white border border-transparent rounded-md hover:primary-text-950 hover:bg-gray-100 cursor-pointer transition-all"
                        @click="signIn('keycloak', { callbackUrl })"
                    >
                        Enter Factory
                    </button>
                </div>
            </div>

            <!-- end of whole content section -->
        </div>
    </div>
</template>
