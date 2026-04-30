# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Run dev server (port 8080, not 3000)
pnpm run dev

# Run dev server with a specific .env file
pnpm run dev --dotenv .env.local

# Build for production
pnpm run build

# Lint (ESLint for .js, .ts, .vue files)
pnpm run lint
```

No test suite is currently set up in this project.

**Pre-commit hook**: Husky runs `lint-staged`, which auto-fixes ESLint issues on staged `.js`, `.ts`, `.vue`, `.json`, and `.html` files before each commit.

## Architecture Overview

This is a **Nuxt 3 SPA** (SSR disabled) for the PISTIS data marketplace platform. It uses Keycloak for authentication.

### Key architectural patterns

**`pistisMode`**: Many features operate in two modes — `factory` (local/private data) or `cloud` (marketplace). The mode is passed as `?pm=factory` or `?pm=cloud` URL query param, read in pages via `route.query.pm`, and consumed via `useApiService(pistisMode)` in `services/apiService.ts`, which switches the `baseUrl` accordingly. Some pages also persist it in a Pinia store via `store.setPistisMode(pistisMode)`. The SDK layer uses it to toggle between monetization-based (cloud) and standard (factory) licensing display.

**Server-side API proxy**: The Nuxt Nitro server (`server/routes/api/`) acts as a proxy for backend calls, injecting auth tokens. The server middleware at `server/middleware/auth.ts` guards all `/api` routes and sets `event.context.session` (contains `token` and `orgId`). Auth tokens are stored server-side (filesystem by default, or Redis when `STORAGE_DRIVER=redis`) via `server/utils/tokenStorage.ts`.

Nitro handler pattern:
```ts
export default defineEventHandler(async (event) => {
  const session = event.context.session
  return $fetch(backendUrl, {
    headers: { Authorization: `Bearer ${session?.token}` },
  })
  // throw createError({ statusCode: 400, statusMessage: '...' }) for errors
})
```

**Authentication flow**: `@sidebase/nuxt-auth` with Keycloak. The global client middleware (`middleware/auth.global.ts`) enforces authentication and validates session `orgId`. The auth session is refreshed periodically (every 60s). PISTIS-specific token info (user roles, group attributes like `country`, `type`, `size`, `domain`) is nested under a `pistis` key in the JWT. The session handler (`server/routes/_auth/[...].ts`) stores tokens server-side keyed by `${userId}-${timestamp}` to support concurrent sessions; token refresh occurs in the `session` JWT callback when the token is expired.

**SDK layer** (`sdk/index.ts`): Wraps `@piveau/sdk-core` and `@piveau/sdk-vue` to create PISTIS-specific search composables (`useDcatApSearch`, `useDcatApCatalogSearch`) over the DCAT-AP data model.

### Directory structure

| Path | Purpose |
|------|---------|
| `layouts/default.vue` | Main nav (primary-700 blue bar). Shared — coordinate with Suite5 before modifying. |
| `components/ShellLayout.vue` | Secondary nav (white bar) used within sub-pages. |
| `pages/` | File-based routing. Each top-level section (e.g. `catalog`, `data`, `marketplace`) has a `catalog.vue` entry and a `catalog/` folder for sub-pages. |
| `components/` | Auto-imported globally without path prefix (no `import` needed, no path-based prefix). |
| `composables/` | Auto-imported composables (`useAlertMessage`, `useConfirmationDialog`, etc.). |
| `store/` | Pinia stores (`useUserStore`, `useMessagesStore`, `useAnonymizerStore`). |
| `services/apiService.ts` | Composable returning URL builders for all backend services (search, repo, wallet, enrichment, etc.). |
| `interfaces/` | TypeScript interfaces for shared data shapes. |
| `server/routes/api/` | Nitro API handlers (proxied backend calls with auth injection). |
| `server/routes/_auth/` | `@sidebase/nuxt-auth` handler. |
| `server/utils/tokenStorage.ts` | Token storage abstraction (filesystem or Redis). |
| `sdk/` | Project-specific SDK wrapping piveau libraries. |
| `i18n.config.ts` | All UI translations (English only currently). Use `$t('key.subkey')` in templates. |
| `tailwind.config.ts` | Custom `primary` (pistis indigo) and `secondary` (orange) color palettes. |
| `app.config.ts` | App name and NuxtUI theme config (`primary: 'pistis'`, `gray: 'zinc'`). |

### State & data fetching

- **Pinia** for global state (user info, messages/notifications, anonymizer settings, data enrichment).
- **TanStack Vue Query** (`@tanstack/vue-query`) for server-state/data fetching in components. Configured with `staleTime: 0` (always refetch on mount) — do not assume cached data will be reused.
- **`useFetch`** (Nuxt built-in) for simple server calls, typically to the Nitro API routes.

### UI components

- **NuxtUI** (`@nuxt/ui`) is the primary component library — use `U`-prefixed components (`UButton`, `UModal`, `UIcon`, etc.).
- **PrimeVue** is also installed for certain components.
- **Headless UI** (`@headlessui/vue`) for accessible primitives (dropdowns, disclosures).
- **Heroicons** + Iconify icon sets (`fa6-regular`, `formkit`) via `i-heroicons-*` / `i-fa6-regular-*` in `UIcon`.
- Toast notifications: use `useAlertMessage()` composable (wraps `useToast()` from NuxtUI) — exposes `showSuccessMessage`, `showErrorMessage`, `showInfoMessage`.
- Confirmation dialogs: use `useConfirmationDialog()` composable (wraps `vue3-promise-dialog`).
- Generic table logic (sorting, filtering, pagination): `useTable<T>()` composable in `composables/table.ts`.

### Environment variables

Copy `.env.example` to `.env.local` and populate:

```
AUTH_ORIGIN=http://localhost:8080
NUXT_APP_URL=http://localhost:8080
NUXT_AUTH_SECRET=<random string>
NUXT_KEYCLOAK_CLIENT_ID=pistis-test-only
NUXT_KEYCLOAK_CLIENT_SECRET=DYuAlXn8kC1SVzFiYgApfjcodZhdxreL
NUXT_KEYCLOAK_ISSUER=https://auth.pistis-market.eu/auth/realms/PISTIS
```

Runtime config public keys (`factoryUrl`, `cloudUrl`, `orgId`, `orgLogo`, `catalogName`, `pistisMarketplaceCatalog`) are set via env vars and accessed with `useRuntimeConfig().public.*`. Server-only keys include `prometheusUrl`, `walletAlias`, `factoryName`, `organisationFullname`, `pistisMode`, and `piveauHubRepoXApiKey`.
