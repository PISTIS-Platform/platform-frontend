# pistis-ui

Please make sure to have a look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.
For more details on Nuxt UI, see its [documentation](https://ui.nuxt.com/getting-started) as well.

## Setup

1. [Install pnpm](https://pnpm.io/installation) and [NodeJS 20](https://nodejs.org/en/download) on your machine if you don't have it already. For NodeJS, if you use [NVM](https://github.com/nvm-sh/nvm), `.nvmrc` is in place, so you can easily use `nvm use` to load the correct version.

2. Make sure to install the dependencies:

```bash
pnpm install
```

3. Launch the dev server (uses port `8080`, not the default `3000`).

```bash
pnpm run dev
```

4. Develop and see the changes take effect with hot reload.

## General Nuxt Folder Structure

### Layouts, Pages, Components, Composables

All folders are in the root directory and not within an `src` folder.

Layouts go in the `layouts` folder, pages go in the `pages` folder, components go in the `components` folder, and composables go in the `composables` folder.

This opinionated but fairly straightforward file structure enables you to use all the aforementioned items without needing to import them manually.

### Pinia Stores

Put all your Pinia store files in the `store` folder.

An example of how to set up getters and actions/setters is provided under `store/user.ts`.

### Images and assets

Anything within the `public` folder can be referenced without the folder prefix, e.g. if you have an image in `public/img/logo.png`, you only need to reference it as `/img/logo.png` in your code.

### Server

Nuxt comes with its own back-end which you can use to transform data before you bring them to the front-end.

Everything related to this goes into the `server` file, and it has its own folders for auto-imports which are not shared with the front-end.

You can learn more about this [here](https://nuxt.com/docs/guide/directory-structure/server).

### Nuxt Config

The majority of the configuration happens within `nuxt.config.ts` - you can learn more about it [here](https://nuxt.com/docs/guide/directory-structure/nuxt.config).

## Specific PISTIS Project Config

### Folder Structure

The main layout/menu (blue bar) exists under `layouts/default.vue`.
The secondary/shell layout/menu (white bar) is under `components/ShellLayout.vue`.
As these files will be utilized by everyone, to avoid code conflicts or conflicting opinions, please contact Suite5 for any requests/issues found.

The main pages (directories that correspond to the main menu
) are organized in their own folders under the `pages` directory. There is also a page named after the main link in the main `pages` directory.

The secondary pages (links that correspond to the secondary menu) are within their parent folder under `pages`.

For example, for the Home page, we have `pages/home/` and also a `home.vue` page under the main `pages` directory.

The secondary Home pages (essentially its sub-menu) are within the `pages/home` directory. One of them has to be named `index.vue` because it leads to the first page the user will see when clicking on Home on the main menu. The others can be named after the route they are given (e.g. `home/analytics.vue` will be under `/home/analytics`).

### Translations

Wherever you see a name that has the format of e.g. `home.wallet` it is a place where a translation will occur using the `i18n` package (documentation [here](https://i18n.nuxtjs.org/)).

You can invoke the translation using `$t` in your code, like `$t('home.dashboard')` will look for the `home` key in `i18n.config.ts` and then it will look for the `dashboard` key within that object, which it will translate to `Dashboard` in English (`en` key).

Within `messages` in `i18n.config.ts` the first-level keys correspond to language codes (e.g. `en` for English).

To use an additional language, copy the entire `en` object, give it a key corresponding to the other language (e.g. `el` for Greek), then translate the messages within the nested objects from the previous language into the new one.

### Authentication

The `@sidebase/nuxt-auth` package is used for authentication (documentation [here](https://sidebase.io/nuxt-auth/getting-started)).

The default provider set up is keycloak and the global auth middleware is currently disabled in `nuxt.config.ts`.
To enable it, change `globalAppMiddleware.isEnabled` from `false` to `true`.

You will also have to make a copy of `.env.example`, copy it to a file which you will name `.env`, and then give it the proper values. For more information about how environmental variables are used, see the [official documentation](https://nuxt.com/docs/guide/directory-structure/env).

### VS Code extensions

If you are working with VS Code for this project, the recommended extensions are [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), [Tailwind CSS Intellisense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) and [Vue Language Features (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

The minimum configuration (required for this) is pre-applied by `.vscode/settings.json`.

### Styles / Theming

[NuxtUI](https://ui.nuxt.com) and [TailwindCSS](https://tailwindcss.com) modules are pre-installed and pre-configured:

A Tailwind color palette has been created based on the primary blue/indigo color that PISTIS uses in its materials and logo.

This color palette is also in use by the Nuxt UI components. You don't need to make any further set up to use these - just remember to refer to the custom color as `primary` in custom Tailwind configs.

A `secondary` color has been set up to use Tailwind's orange.

The detailed primary color palette is listed in `tailwind.config.ts` if you need the hex codes for other visuals.

You can see the full set of pre-defined colours, fonts and classes (provided by TailwindCSS) visually at `http://localhost:8080/_tailwind/` (once you run `pnpm run dev`).
