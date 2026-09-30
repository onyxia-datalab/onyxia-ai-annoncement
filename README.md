# onyxia-ai-annoncement

Onyxia plugin announcing the AI feature:

- a dot on the "My account" item of the left bar, until the user visits the AI tab;
- a "New" badge on the AI tab of the account page, during the first visit;
- a "New" badge on the "AI Assistant" group of the launcher, until the user opens it;
- a notice above that group, linking to the AI tab, that the user can dismiss.

What the user has seen is stored in `localStorage`. The plugin does nothing after
`ANNOUNCEMENT_END_DATE` (see `src/main.ts`).

## Development

```bash
git clone https://github.com/InseeFrLab/onyxia
cd onyxia/web
yarn
git clone https://github.com/onyxia-datalab/onyxia-ai-annoncement onyxia-ai-announcement
cd onyxia-ai-announcement
npm install
npm run dev
# OPTIONAL: Check if the code is sound, typewise:
npm run typecheck
```

> NOTE: `npm run dev` overwrites `web/.env.local.yaml` with `./.env.local.yaml`.

The account tab badge relies on the `data-onyxia-anchor="account-tab-<id>"` attribute,
make sure the Onyxia version you target has it.

## Production Build

```bash
npm install
npm run build # Generate ./onyxia-ai-announcement.zip
```

`apps/onyxia/values.yaml`

```yaml
onyxia:
    web:
        env:
            CUSTOM_RESOURCES: "<https url to onyxia-ai-announcement.zip>"
            CUSTOM_HTML_HEAD: |
                <script src="%PUBLIC_URL%/custom-resources/js/index.mjs?v=1" type="module"></script>
```
