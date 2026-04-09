# AGENTS.md

- Prefer narrowing and null checks over broad `as` casts.

## UI Conventions

- Use functional components.
- Use hooks directly in components and custom hooks.
- Styles are mixed between inline objects and `StyleSheet`; follow the local file.
- Prefer theme colors from `useTheme()` over hardcoded colors when the screen is theme-aware.
- Reuse `scale()` from `src/theme/utils` where nearby code does.
- Respect safe-area insets for anchored UI.
- Preserve `LiquidGlassView` feature checks such as `isLiquidGlassSupported`.

## State And Data Flow

- Prefer extending existing Zustand stores over adding new state systems.
- Reuse the shared Axios client from `src/services/api.ts`.
- Do not duplicate base URLs or create one-off HTTP clients without a strong reason.

## Error Handling

- Preserve Crashlytics reporting in files that already use it.
- Do not silently swallow errors unless the caller already expects that behavior.

## Navigation And Localization

- Route typing lives in `src/navigation/RootNavigation.tsx` via global `ReactNavigation.RootParamList`.
- Update route typings when adding screens or params.
- Prefer translation keys over new hardcoded strings when a screen already uses `useTranslation()`.
- Keep localization resources in sync when adding user-facing copy.

## Code Conventions

- Don't write inline function in components, create the function on the body of the component.
