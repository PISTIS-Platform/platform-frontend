const { baseDevelopUrl } = useRuntimeConfig();

export default defineEventHandler(async () => {
    const response = await fetch(`${baseDevelopUrl}/anonymiser/api/k-anon/hierarchy/interval`);
    const json = await response.json();

    return json['results'];
});
