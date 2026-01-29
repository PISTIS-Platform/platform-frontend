<script setup lang="ts">
const { data: session } = useAuth();
const token = ref(session.value?.token);

const isDeleting = ref(false);
const deleteSuccess = ref(false);
const deleteError = ref(false);

const deleteInfo = ref<any>(null);

const props = defineProps({
    datasetId: {
        type: String,
    },
    catalog: {
        type: String,
    },
    distributions: {
        type: Array,
    },
});

const router = useRouter();

const {
    data: isPublishedOnMarketplace,
    status,
    error,
} = useAsyncData(() =>
    $fetch(`/api/datasets/is-on-marketplace`, {
        query: { id: props.datasetId },
    }),
);

const dist = ref([]);
watchEffect(() => {
    dist.value = props.distributions;
});

const isPublished = computed(() => isPublishedOnMarketplace.value === true);

const canDelete = computed(() => status.value === 'success' && error.value === null && isPublished.value === false);

const showConfirmationWindow = ref(false);

const openConfirmationWindow = () => {
    showConfirmationWindow.value = true;
    deleteError.value = false;
};

const confirmDelete = async () => {
    if (!canDelete.value) {
        deleteError.value = true;
        return;
    }

    isDeleting.value = true;

    try {
        const response = await $fetch('/api/catalog/delete-dataset', {
            method: 'DELETE',
            query: { datasetId: props.datasetId },
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });

        deleteInfo.value = response.info;
        deleteSuccess.value = true;

        setTimeout(() => {
            showConfirmationWindow.value = false;
            router.back();
        }, 3500);
    } catch (err) {
        console.error('DELETE ERROR:', err);
        deleteError.value = true;
    } finally {
        isDeleting.value = false;
    }
};
</script>

<template>
    <div v-if="props.catalog === 'my-data'">
        <UButton
            v-if="!isPublished && canDelete"
            variant="solid"
            color="red"
            icon="i-heroicons-trash"
            @click="openConfirmationWindow"
        >
            Delete dataset
        </UButton>
        <UTooltip v-else text="Dataset has been published and cannot be deleted.">
            <UButton :disabled="true" color="red" icon="i-heroicons-trash"> Delete dataset </UButton>
        </UTooltip>
        <UModal v-model="showConfirmationWindow" :ui="{ width: 'max-w-none w-[500px]' }">
            <div v-if="!deleteSuccess">
                <h2 class="text-lg font-semibold p-4">Delete dataset?</h2>

                <p class="px-4">Are you sure you want to delete this dataset? This action cannot be undone.</p>
                <br />
                <p class="px-4">The following distribution(s) will also be deleted:</p>
                <ul class="px-10">
                    <li v-for="distribution in dist" :key="distribution.id" class="list-disc">
                        <span class="font-bold text-xs">({{ distribution.format.id }})</span>
                        {{ distribution.title?.en }}
                    </li>
                </ul>

                <div class="flex justify-end space-x-4 p-4">
                    <UButton variant="solid" color="gray" @click="showConfirmationWindow = false">Cancel</UButton>
                    <UButton variant="solid" color="red" @click="confirmDelete">Delete</UButton>
                </div>
                <div v-if="isDeleting" class="flex justify-end text-gray-600 px-4 pb-4">
                    <div class="animate-spin rounded-full h-5 w-5 border-t-2"></div>
                    <p class="text-sm italic pl-2">Deleting dataset and distributions...</p>
                </div>
                <p v-if="deleteError" class="italic text-red-400 px-4 pb-4 text-sm text-right">
                    Something went wrong, please try again.
                </p>
            </div>
            <div v-else class="p-6 text-center">
                <div class="flex justify-center items-center">
                    <h2 class="text-lg font-semibold text-green-600">Dataset successfully deleted</h2>
                    <UIcon name="i-heroicons-check-circle" class="text-xl text-green-500" />
                </div>
                <div v-if="deleteInfo" class="mt-4 text-left text-sm">
                    <p class="font-semibold mb-1">Deleted distributions:</p>
                    <ul class="list-disc pl-5">
                        <li v-for="d in deleteInfo.distributions" :key="d.id">
                            <span class="font-medium">{{ d.title }}</span>
                        </li>
                    </ul>
                    <p class="font-semibold mb-1 mt-3">Dataset was also removed from:</p>
                    <ul v-if="deleteInfo.metricsDeleted" class="list-disc pl-5">
                        <li>
                            <span class="font-medium">Metrics</span>
                        </li>
                    </ul>
                    <ul v-if="deleteInfo.dataQualityDeleted" class="list-disc pl-5">
                        <li>
                            <span class="font-medium">Data Quality</span>
                        </li>
                    </ul>
                </div>
                <p class="text-gray-600 mt-2">You will be redirected...</p>
            </div>
        </UModal>
    </div>
    <div v-else>
        <UTooltip text="This is an acquired dataset and cannot be deleted.">
            <UButton :disabled="true" color="red" icon="i-heroicons-trash"> Delete dataset </UButton>
        </UTooltip>
    </div>
</template>
