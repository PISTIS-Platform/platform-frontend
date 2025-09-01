import { jwtDecode } from 'jwt-decode';

import { getToken } from '#auth';

export default defineEventHandler(async (event) => {
    const token = await getToken({ event });
    const query = getQuery(event);

    if (!token) return;

    const tokenData = jwtDecode(token?.access_token);

    if (query.page === 'profile') {
        return {
            user: {
                name: tokenData.name,
                email: tokenData.email,
                roles: tokenData.pistis.user.role,
            },
            org: {
                name: tokenData.group[0].replace(/^\//, ''),
                country: tokenData.pistis.group.country,
                size: tokenData.pistis.group.size,
                domain: tokenData.pistis.group.domain,
                type: tokenData.pistis.group.type,
            },
        };
    } else {
        return {
            user: { sub: tokenData.sub, orgName: tokenData.group[0].replace(/^\//, '') },
        };
    }
});
