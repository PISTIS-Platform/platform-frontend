import { jwtDecode } from 'jwt-decode';

export default defineEventHandler(async (event) => {
    const session = event.context.session;
    const query = getQuery(event);

    if (!session?.token) return;

    const tokenData = jwtDecode(session?.token);

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
