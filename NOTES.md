# Project notes

The AI key comes from the server-only `getKey()` helper in `server/getKey.js`.

When a request fails, show `error.message` to the user and log `error.fix` on the server. Do not retry in a loop. If OpenAI reports the cached key as invalid, call `invalidateKey()` and let the next request call `getKey()` for a fresh key.

The MindDo-issued key can use these OpenAI models:

- `gpt-4o`
- `gpt-4o-2024-08-06`
- `gpt-4o-2024-11-20`
- `gpt-4o-mini`
- `gpt-4o-mini-2024-07-18`
- `gpt-5.6-luna`

The model with “luna” in its name is `gpt-5.6-luna`.

## Version 1 status

Done: enter a vitamin or mineral deficiency, see sample food ideas, search by nutrient using the nutrient buttons, and ask the real AI a safe food question. The AI runs on the server with `getKey()` and `gpt-5.6-luna`; the key never goes to the page.

MVP checks:

1. Enter “Vitamin B12” and select Add nutrient. It appears as a saved nutrient and shows “Vitamin B12 was saved on this computer.” Empty or duplicate entries show a helpful message.
2. Select Vitamin C or Vitamin D. Food cards appear.
3. Use the nutrient buttons to search by vitamin type.
4. Ask “What foods are rich in vitamin C?” and wait for the answer; the button shows “Thinking…” while it waits.

Saves on this computer only for now. Data is kept in browser localStorage in `src/storage.js`.

Start the project with:

```bash
pnpm start
```

## Maybe Later

- Select multiple vitamin deficiencies for tailored recommendations.
- View health benefits of suggested foods.
- See a description of each recommended food.
- Bookmark favorite food suggestions.
- Find foods that are easy to prepare.
- Check common allergies related to recommended foods.
- Learn about the importance of vitamins for health.
- Get tips on incorporating suggested foods into meals.
- Share favorite foods with friends through a link.
- Provide feedback on food suggestions.
- View foods to avoid for deficiencies.
- Read general safety tips regarding vitamin intake.
