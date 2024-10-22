<script lang="ts" setup>
definePageMeta({
    middleware: 'auth',
    auth: false,
    layout: 'home',
});

const { status, signIn } = useAuth();

const runtimeConfig = useRuntimeConfig();

const orgLogo = computed(() => runtimeConfig.public?.orgLogo || '');

const callbackUrl = '/home';
</script>

<template>
    <div class="w-full h-screen flex flex-col">
        <div
            class="w-full flex-1 flex flex-col bg-primary-950 bg-cover"
            :style="{ backgroundImage: `url('/img/cover.jpeg')` }"
        >
            <div class="bg-primary-950/80 flex-1">
                <div class="flex flex-col flex-1 max-w-7xl mx-auto">
                    <nav aria-label="Global" class="relative flex flex-row sm:items-center justify-between py-6">
                        <!-- Left Menu -->
                        <div class="flex flex-row space-x-10 items-center gap-2">
                            <div class="sm:w-full md:w-auto">
                                <NuxtLink :to="'/'" class="flex-shrink-0">
                                    <img
                                        v-if="orgLogo"
                                        class="h-12 sm:h-14"
                                        :src="`/img/${orgLogo}`"
                                        alt="Factory Logo"
                                    />
                                </NuxtLink>
                            </div>
                            <NuxtLink
                                v-if="status === 'authenticated'"
                                :to="'/home/'"
                                class="flex-shrink-0 rounded-md px-4 py-2 text-lg font-medium text-white hover:primary-text-950 hover:border hover:border-white cursor-pointer transition-all"
                                >Home</NuxtLink
                            >
                        </div>
                        <!-- Right Menu - Pistis logo -->
                        <div class="flex justify-center items-center">
                            <img class="h-12" src="/img/PISTIS_logo_white.png" alt="PISTIS Logo" />
                        </div>
                    </nav>
                    <!-- Central Section/Main Content -->
                    <div class="flex flex-col items-center justify-center w-full gap-12 mt-32">
                        <h2 class="text-white font-semibold text-center tracking-wide text-2xl xl:text-4xl">
                            Data Factory
                        </h2>
                        <p class="font-light text-center tracking-wider text-sm lg:text-base text-white max-w-4xl">
                            PISTIS allows member organisations to sell and buy data, opening up new revenue streams
                            through the monetisation of data assets. Using the PISTIS infrastructure, organisations can
                            improve the quality of their in-house data, and place them on the market, though different
                            revenue mechanisms to enjoy monetary benefits via secure and privacy aware data sharing
                            modes.
                        </p>
                        <!-- Sign In button -->
                        <div v-if="status !== 'authenticated'" class="flex">
                            <button
                                class="inline-flex items-center px-4 py-2 text-lg font-medium text-primary-800 bg-white border border-transparent rounded-md hover:primary-text-950 hover:bg-neutral-100 cursor-pointer transition-all"
                                @click="signIn('keycloak', { callbackUrl })"
                            >
                                Enter Factory
                            </button>
                        </div>
                    </div>
                    <!-- end of whole content section -->
                </div>
            </div>
            <footer class="bg-primary-900 flex p-4 text-xs justify-center align-center">
                <div class="flex w-full max-w-[1210px] gap-4">
                    <img class="w-12 h-8" src="/img/eu_flag.jpeg" alt="PISTIS logo" />
                    <p class="text-white">
                        This project has received funding from the European Union under Grant Agreement n° 101093016.
                        Views and opinions expressed are however those of the author(s) only and do not necessarily
                        reflect those of the European Union or the European Commission. Neither the European Union nor
                        the granting authority can be held responsible for them.
                    </p>
                </div>
            </footer>
        </div>
    </div>
</template>
