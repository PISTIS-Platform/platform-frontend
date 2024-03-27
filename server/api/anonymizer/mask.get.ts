const { anonymizerApiUrl } = useRuntimeConfig();

export default defineEventHandler(async () => {
    const response = await fetch(`${anonymizerApiUrl}/api/mask/sort`);
    const json = await response.json();

    return json;
});
