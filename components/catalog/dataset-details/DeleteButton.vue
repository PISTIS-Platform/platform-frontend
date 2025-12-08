<script setup lang="ts">
const deleteSuccess = ref(false);
const deleteError = ref(false);

const props = defineProps({
    datasetId: {
        type: String,
    },
    catalog: {
        type: String,
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

    try {
        await $fetch('/api/catalog/delete-dataset', {
            method: 'DELETE',
            query: { datasetId: props.datasetId },
        });

        deleteSuccess.value = true;

        setTimeout(() => {
            showConfirmationWindow.value = false;
            router.back();
        }, 1500);
    } catch (err) {
        console.error('DELETE ERROR:', err);
        deleteError.value = true;
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
            <UButton :disabled="true" color="red" icon="i-heroicons-trash">
                Delete dataset
            </UButton>
        </UTooltip>
        <UModal v-model="showConfirmationWindow" :ui="{ width: 'max-w-none w-[500px]' }">
            <div v-if="!deleteSuccess">
                <h2 class="text-lg font-semibold p-4">Delete dataset?</h2>

                <p class="px-4">Are you sure you want to delete this dataset? This action cannot be undone.</p>

                <div class="flex justify-end space-x-4 p-4">
                    <UButton variant="solid" color="gray" @click="showConfirmationWindow = false">Cancel</UButton>
                    <UButton variant="solid" color="red" @click="confirmDelete">Delete</UButton>
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
