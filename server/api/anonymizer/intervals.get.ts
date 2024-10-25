const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async () => {
    const response = await fetch(`${factoryUrl}/srv/anonymiser/api/k-anon/hierarchy/interval`);
    const json = await response.json();

    return json['results'];
});
