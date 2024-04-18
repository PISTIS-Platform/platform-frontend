const { anonymizerApiUrl } = useRuntimeConfig();

export default defineEventHandler(async () => {
    const response = await fetch(`${anonymizerApiUrl}/api/k-anon/hierarchy/interval`);
    const json = await response.json();

    return json['results'];
});
