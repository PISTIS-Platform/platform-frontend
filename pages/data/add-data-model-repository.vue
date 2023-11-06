<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { ref } from 'vue';
import { z } from 'zod';

//TODO: Discuss about different refs for each prop
const state = ref({
    title: '',
    version: undefined,
    description: '',
    data: null,
});

const isDragging = ref<boolean>(false);
const file = ref();
const uploadedState = ref<boolean>(false);
const uploaded = ref<boolean>();
const isValidFile = ref<boolean>(false);
const route = useRoute();

async function submit(/*event: FormSubmitEvent<any>*/) {
    // Do something with data
    console.log(state.value);
}

onMounted(() => {
    if (route.query.data) {
        const data = JSON.parse(route.query.data as any);
        state.value = data[0];
    }
});

const dataModelSchema = z.object({
    title: z.string().min(10, 'Must be at least 10 characters'),
    version: z
        .number({ invalid_type_error: 'Please enter a valid number' })
        .gte(0, 'Version must be 0 or a positive number'),
    description: z.string().min(20, 'Must be at least 20 characters'),
    data: z.any(),
});

//TODO: Example of z schema
// type DataModel = z.infer<typeof dataModelSchema>;

// const dataModel = ref<DataModel>({
//     title: '',
//     version: 0,
//     description: '',
//     data: null,
// });

function onChange() {
    //TODO: Check for maximum size
    uploadedState.value = false;
    state.value.title = file?.value?.files[0];
    if (state.value.title) isValidFile.value = true;
    else {
        isValidFile.value = false;
        state.value.title = '';
        file.value = null;
    }
}

function dragover(e: Event) {
    e.preventDefault();
    isDragging.value = true;
}

function dragleave() {
    isDragging.value = false;
}

function drop(e: any) {
    e.preventDefault();
    file.value = e.dataTransfer;
    onChange();
    isDragging.value = false;
}

// const uploadFile = async () => {

// };
</script>

<template>
    <div class="w-full h-full text-gray-700">
        <h1 class="text-2xl">
            {{ $t('data.dmRepository.upload') }}
            <UIcon class="box-content h-6 w-6" name="i-heroicons-information-circle" />
        </h1>
        <UCard class="mt-8">
            <div class="space-y-4 sm:space-y-5 sm:pt-10 w-full lg:w-1/2 lg:pr-4">
                <UForm :schema="dataModelSchema" :state="state" class="flex flex-col space-y-6" @submit="submit">
                    <UFormGroup :label="$t('data.dmRepository.select') + ':'" name="selectFile">
                        <div class="sm:col-span-2 sm:mt-0">
                            <div
                                class="flex max-w-lg justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6"
                                @dragover="dragover"
                                @dragleave="dragleave"
                                @drop="drop"
                            >
                                <div class="space-y-1 text-center flex flex-col items-center">
                                    <label
                                        for="file-upload"
                                        class="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                                    >
                                        <UIcon class="box-content h-8 w-8" name="i-heroicons-arrow-up-circle-solid" />
                                    </label>
                                    <div class="flex text-sm text-gray-600">
                                        <label
                                            for="file-upload"
                                            class="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                                        >
                                            <span v-if="!isDragging">{{ $t('data.dmRepository.select') }}</span>
                                            <input
                                                id="file-upload"
                                                ref="file"
                                                name="file-upload"
                                                type="file"
                                                class="sr-only"
                                                @change="onChange"
                                            />
                                        </label>
                                        <p v-if="!isDragging" class="pl-1">{{ $t('data.dmRepository.drag') }}</p>
                                    </div>
                                    <p v-if="!uploaded" class="text-xs text-gray-500 pt-4">
                                        {{ $t('data.dmRepository.noFile') }}
                                    </p>
                                    <p v-if="uploaded && isValidFile" class="text-xs text-gray-900 pt-4">
                                        {{ $t('data.dmRepository.fileName') }} {{ state.title }}
                                    </p>
                                    <p v-if="uploaded && !isValidFile" class="text-xs text-red-500 pt-4">
                                        {{ $t('data.dmRepository.invalid') }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </UFormGroup>
                    <UFormGroup :label="$t('data.dmRepository.formTitle')" required name="title">
                        <UInput v-model="state.title" />
                    </UFormGroup>
                    <UFormGroup :label="$t('data.dmRepository.formVersion')" required name="version">
                        <UInput v-model.number="state.version" type="numeric" />
                    </UFormGroup>
                    <UFormGroup :label="$t('data.dmRepository.formDescription')" required name="description">
                        <UTextarea v-model="state.description" />
                    </UFormGroup>
                    <div class="flex items-center justify-between">
                        <UButton
                            size="md"
                            color="gray"
                            variant="outline"
                            :label="$t('cancel')"
                            :trailing="false"
                            @click="$router.go(-1)"
                        />
                        <UButton
                            size="md"
                            color="primary"
                            variant="solid"
                            :label="$t('data.dmRepository.uploadButton')"
                            type="submit"
                        />
                    </div>
                </UForm>
            </div>
        </UCard>
    </div>
</template>
