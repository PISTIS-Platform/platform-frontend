<script lang="ts" setup>
definePageMeta({
    middleware: 'auth',
    auth: false,
    layout: 'home',
});

const { status, signIn } = useAuth();

const callbackUrl = '/home';
</script>

<template>
    <div class="w-full h-screen bg-white">
        <nav
            aria-label="Global"
            class="relative flex flex-row sm:items-center justify-between px-8 sm:px-8 2xl:px-36 py-6"
        >
            <!-- Left Menu -->
            <div class="flex flex-row space-x-10 items-center gap-2">
                <div class="sm:w-full md:w-auto">
                    <NuxtLink :to="'/'" class="flex-shrink-0">
                        <img class="h-12 w-36 sm:h-16 sm:w-60" src="/img/PISTIS_logo.png" alt="PISTIS logo" />
                    </NuxtLink>
                </div>
                <NuxtLink
                    v-if="status === 'authenticated'"
                    :to="'/home/'"
                    class="flex-shrink-0 rounded-md border border-primary-600 text-primary-600 text-base hover:border hover:bg-primary-600 hover:text-white py-2 px-4 mt-2 transition-all"
                    >Home</NuxtLink
                >
            </div>

            <!-- Sign In button -->
            <div v-if="status !== 'authenticated'" class="flex">
                <button
                    class="inline-flex items-center px-4 py-2 text-base font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-800 cursor-pointer transition-all"
                    @click="signIn('keycloak', { callbackUrl })"
                >
                    Sign In
                </button>
            </div>
        </nav>

        <div
            class="flex flex-col sm:flex-row items-center justify-center sm:justify-between w-full gap-12 sm:gap-12 2xl:gap-0 px-8 sm:px-16 2xl:px-48 mt-20"
        >
            <div class="relative flex flex-col items-center sm:items-start justify-center space-y-6">
                <h2 class="text-primary-600 text-center sm:text-left tracking-wide font-bold text-4xl xl:text-5xl">
                    PISTIS - Your sharing data platform
                </h2>

                <p
                    class="font-normal text-center sm:text-left tracking-wide text-lg lg:text-xl max-w-2xl sm:max-w-4xl text-primary-600"
                >
                    PISTIS allows member organisations to sell and buy data, opening up new revenue streams through the
                    monetisation of data assets. Using the PISTIS infrastructure, organisations can improve the quality
                    of their in-house data, and place them on the market, though different revenue mechanisms to enjoy
                    monetary benefits via secure and privacy aware data sharing modes.
                </p>

                <!-- Pistis website redirect button -->
                <div class="flex gap-4 text-sm font-normal lg:text-lg lg:font-medium">
                    <NuxtLink target="_blank" :to="'https://www.pistis-project.eu/'" class="flex-shrink-0">
                        <button
                            class="inline-flex items-center px-4 py-2 text-base font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-800 cursor-pointer transition-all"
                        >
                            Find out more
                        </button></NuxtLink
                    >
                </div>
            </div>
            <img
                class="w-96 h-80 sm:w-56 sm:h-60 2xl:w-96 2xl:h-80 rounded-full"
                src="/img/data-share.png"
                alt="Data Share image"
            />
        </div>
    </div>
</template>
