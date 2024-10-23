<script setup lang="ts">
defineProps({
    steps: {
        type: Array<{ name: string; isActive: boolean }>,
        required: true,
    },
    selectedPage: {
        type: Number,
        required: true,
    },
});

const emit = defineEmits(['selectPage']);
</script>

<template>
    <nav aria-label="Progress">
        <ol role="list" class="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0 mb-8">
            <li
                v-for="(step, stepIdx) in steps"
                :key="step.name"
                class="relative md:flex md:flex-1 cursor-pointer"
                :class="step.isActive ? '' : 'pointer-events-none'"
                @click="emit('selectPage', stepIdx)"
            >
                <a v-if="selectedPage > stepIdx" class="group flex w-full items-center">
                    <span class="flex items-center px-6 py-4 text-sm font-medium">
                        <span
                            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white group-hover:bg-indigo-800"
                        >
                            <UIcon name="i-fa6-regular-circle-check" class="text-white h-5 w-5" />
                        </span>
                        <span class="ml-4 text-sm font-medium text-gray-900">{{ step.name }}</span>
                    </span>
                </a>
                <a
                    v-else-if="selectedPage === stepIdx"
                    class="flex items-center px-6 py-4 text-sm font-medium"
                    aria-current="step"
                >
                    <span
                        class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-indigo-600"
                    >
                        <span class="text-indigo-600">{{ stepIdx + 1 }}</span>
                    </span>
                    <span class="ml-4 text-sm font-medium text-indigo-600">{{ step.name }}</span>
                </a>
                <a v-else class="group flex items-center">
                    <span class="flex items-center px-6 py-4 text-sm font-medium">
                        <span
                            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400"
                        >
                            <span class="text-gray-500 group-hover:text-gray-900">{{ stepIdx + 1 }}</span>
                        </span>
                        <span class="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">{{
                            step.name
                        }}</span>
                    </span>
                </a>
                <template v-if="stepIdx !== steps.length - 1">
                    <!-- Arrow separator for lg screens and up -->
                    <div class="absolute right-0 top-0 hidden h-full w-5 md:block" aria-hidden="true">
                        <svg
                            class="h-full w-full text-gray-300"
                            viewBox="0 0 22 80"
                            fill="none"
                            preserveAspectRatio="none"
                        >
                            <path
                                d="M0 -2L20 40L0 82"
                                vector-effect="non-scaling-stroke"
                                stroke="currentcolor"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </div>
                </template>
            </li>
        </ol>
    </nav>
</template>
