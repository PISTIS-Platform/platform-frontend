const { baseDevelopUrl } = useRuntimeConfig();

export default defineEventHandler(async () => {
    const response = await fetch(`${baseDevelopUrl}/anonymiser/api/mask/sort`);
    const json = await response.json();

    return json;
});
