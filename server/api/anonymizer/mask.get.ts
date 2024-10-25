const {
    public: { factoryUrl },
} = useRuntimeConfig();

export default defineEventHandler(async () => {
    const response = await fetch(`${factoryUrl}/srv/anonymiser/api/mask/sort`);
    const json = await response.json();

    return json;
});
