const { serverApiUrl } = useRuntimeConfig();

export const apiGet = async (resource: string, params?: string) => {
    let response;

    params = params && params.length > 0 ? `/?${params}` : '';

    try {
        response = await $fetch(`${serverApiUrl}/${resource}${params}`);
    } catch (error) {
        throw error;
    }

    return response;
};

export const apiPost = async (resource: string, body: Record<string, unknown>) => {
    let response;

    try {
        response = await $fetch(`${serverApiUrl}/${resource}`, {
            method: 'POST',
            body,
        });
    } catch (error) {
        throw error;
    }

    return response;
};

export const apiPut = async (resource: string, body: Record<string, unknown>) => {
    let response;

    try {
        response = await $fetch(`${serverApiUrl}/${resource}`, {
            method: 'PUT',
            body,
        });
    } catch (error) {
        throw error;
    }

    return response;
};

export const apiPatch = async (resource: string) => {
    let response;

    try {
        response = await $fetch(`${serverApiUrl}/${resource}`, {
            method: 'PATCH',
        });
    } catch (error) {
        throw error;
    }

    return response;
};

export const apiDelete = async (resource: string, body: Record<T, T>) => {
    let response;

    try {
        response = await $fetch(`${serverApiUrl}/${resource}`, {
            method: 'DELETE',
            body,
        });
    } catch (error) {
        throw error;
    }

    return response;
};
