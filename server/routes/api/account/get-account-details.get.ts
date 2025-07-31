import { getToken } from '#auth';

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });

    if (!token) return;

    return {
        user: {
            name: token.name,
            email: token.email,
            roles: token.pistis.user.role,
        },
        org: {
            name: token.orgName,
            country: token.pistis.group.country,
            size: token.pistis.group.size,
            domain: token.pistis.group.domain,
            type: token.pistis.group.type,
        },
    };
});
