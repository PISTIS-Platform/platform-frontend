import { getToken } from '#auth';

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    let user;
    let org;

    if (token) {
        user = {
            name: token.name,
            email: token.email,
            roles: token.pistis.user.role,
        };

        org = {
            name: token.orgName,
            country: token.pistis.group.country,
            size: token.pistis.group.size,
            domain: token.pistis.group.domain,
            type: token.pistis.group.type,
        };
    } else {
        return null;
    }

    return {
        user,
        org,
    };
});
