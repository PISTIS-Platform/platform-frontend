<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { ref } from 'vue';
import { z } from 'zod';

import { ModelType } from '../../interfaces/model-type.enum';

const isDragging = ref<boolean>(false);
const file = ref();
const uploadedState = ref<boolean>(false);
const uploaded = ref<boolean>();
const isValidFile = ref<boolean>(false);
const route = useRoute();

async function submit(/*event: FormSubmitEvent<any>*/) {
    // Do something with data
    console.log(dataModelState);
}

const modelTypes = [
    {
        value: ModelType.DATAMODEL,
        name: ModelType.DATAMODEL,
    },
    {
        value: ModelType.METADATAMODEL,
        name: ModelType.METADATAMODEL,
    },
    {
        value: ModelType.MONETISATIONMODEL,
        name: ModelType.MONETISATIONMODEL,
    },
    {
        value: ModelType.PRETRAINEDAIMODEL,
        name: ModelType.PRETRAINEDAIMODEL,
    },
];

const dataModelSchema = z.object({
    title: z.string().min(10, 'Must be at least 10 characters'),
    version: z
        .number({ invalid_type_error: 'Please enter a valid number' })
        .gte(0, 'Version must be 0 or a positive number'),
    description: z.string().min(20, 'Must be at least 10 characters'),
    data: z.any(),
    type: z.enum(['Pre-trained AI model', 'Data Model', 'Monetisation Model', 'Metadata model']),
});

//Example of z schema
type DataModel = z.output<typeof dataModelSchema>;

const dataModelState = ref<DataModel>({
    title: '',
    version: 0,
    description: '',
    data: null,
    type: '' as ModelType,
});

function onChange() {
    //TODO: Check for maximum size
    uploadedState.value = false;
    dataModelState.value.title = file?.value?.files[0] ?? '';
    if (dataModelState.value.title) isValidFile.value = true;
    else {
        isValidFile.value = false;
        dataModelState.value.title = '';
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

//TODO: Data model repo schema is different. Removed query data loading
onMounted(() => {
    if (route.query.data) {
        const data = JSON.parse(route.query.data as any);
        console.log(data);
        // dataModelState.value = data;
    }
});
</script>

<template>
    <div class="w-full h-full space-y-6">
        <h1 class="text-2xl">
            {{ $t('data.dmRepository.upload') }}
            <UIcon class="box-content h-6 w-6" name="i-heroicons-information-circle" />
        </h1>
        <UCard class="flex flex-col">
            <div class="w-full">
                <UForm :schema="dataModelSchema" :state="dataModelState" class="space-y-5" @submit="submit">
                    <UFormGroup :label="$t('data.dmRepository.select') + ':'" name="selectFile">
                        <div class="">
                            <div
                                class="flex justify-center rounded-md border-2 border-dashed border-gray-300 py-5"
                                @dragover="dragover"
                                @dragleave="dragleave"
                                @drop="drop"
                            >
                                <div class="text-center flex flex-col items-center space-y-2">
                                    <label
                                        for="file-upload"
                                        class="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                                    >
                                        <UIcon class="box-content h-8 w-8" name="i-heroicons-arrow-up-circle-solid" />
                                    </label>
                                    <div class="flex text-sm text-gray-600 space-x-1">
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
                                        <p v-if="!isDragging" class="">{{ $t('data.dmRepository.drag') }}</p>
                                    </div>
                                    <p v-if="!uploaded" class="text-xs text-gray-500">
                                        {{ $t('data.dmRepository.noFile') }}
                                    </p>
                                    <p v-if="uploaded && isValidFile" class="text-xs text-gray-900">
                                        {{ $t('data.dmRepository.fileName') }} {{ dataModelState.title }}
                                    </p>
                                    <p v-if="uploaded && !isValidFile" class="text-xs text-red-500">
                                        {{ $t('data.dmRepository.invalid') }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </UFormGroup>
                    <div class="flex flex-1">
                        <UFormGroup class="w-2/4" :label="$t('data.dmRepository.formTitle')" required name="title">
                            <UInput v-model="dataModelState.title" />
                        </UFormGroup>
                        <UFormGroup
                            class="ml-2 w-1/4"
                            :label="$t('data.dmRepository.modelType')"
                            required
                            name="model_type"
                        >
                            <USelect v-model="dataModelState.type" :options="modelTypes" option-attribute="name" />
                        </UFormGroup>
                        <UFormGroup
                            class="ml-2 w-1/4"
                            :label="$t('data.dmRepository.formVersion')"
                            required
                            name="version"
                        >
                            <UInput v-model.number="dataModelState.version" type="numeric" />
                        </UFormGroup>
                    </div>
                    <UFormGroup :label="$t('data.dmRepository.formDescription')" required name="description">
                        <UTextarea v-model="dataModelState.description" :rows="4" />
                    </UFormGroup>
                    <div class="flex justify-between flex-1">
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
