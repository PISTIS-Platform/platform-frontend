const { anonymizerApiUrl } = useRuntimeConfig();

export default defineEventHandler(async () => {
    const response = await fetch(`${anonymizerApiUrl}/api/dataset/preview`);
    const json = await response.json();

    return json;
});
