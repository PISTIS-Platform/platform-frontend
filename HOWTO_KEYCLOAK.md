# How to integrate with Keycloak

## Keycloak parameters
An example Keycloak configuration that can be used is:
```
CLIENT_ID = ape-ui
CLIENT_SECRET = 4vTp8l1Y4O8Z3EPemDxtuB0iv4Cy8CPu
ISSUER = https://auth.pistis.isi.gr/auth/realms/PISTIS-EXAMPLE
```
Together with a random string for securing cookies the entire configuration, i.e. `.env.local` should look like:
```
AUTH_ORIGIN = http://localhost:8080

NUXT_APP_URL = http://localhost:8080
NUXT_AUTH_SECRET = b*BDZVh8gi3Hh7nbKqfSz*H6Zh5G9Z3qDXy$2!43JNZwPn4m3m!WdD%p%
NUXT_KEYCLOAK_CLIENT_ID = ape-ui
NUXT_KEYCLOAK_CLIENT_SECRET = 4vTp8l1Y4O8Z3EPemDxtuB0iv4Cy8CPu
NUXT_KEYCLOAK_ISSUER = https://auth.pistis.isi.gr/auth/realms/PISTIS-EXAMPLE
```

Then, you need to start the project with: `pnpm run dev --dotenv .env.local`

## Nuxt configuration
Edit file [nuxt.config.ts](nuxt.config.ts) to enable Keycloak:
```
auth.globalAppMiddleware.isEnable: true
```

## Sample user to test
A demo user to test is:
```
Username: user
Password: user
```

## Token contents
An example menu [Token contents](http://localhost:8080/example/token) has been created to decode and visualize JWT contents.

To use the decode function, you need to install `jwt-decode`
```
pnpm install jwt-decode
```



## Changelog to be reviewed by S5

### .env.example
```
AUTH_ORIGIN = http://localhost:8080/_auth
```
to remove `/_auth`

### server/api/token
File: [token.get.ts](server/api/token.get.ts) existed in previous versions.

Please review [token.vue](pages/example/token.vue) if this is the correct way


### server/routes/_auth/[..].ts

File: [[..].ts](server/routes/_auth/%5B...%5D.ts)
added:
```
access_token?: string;
```
in JWT interface, and:
```
token.access_token = account.access_token;
```
to get access to original keycloak's access token.

