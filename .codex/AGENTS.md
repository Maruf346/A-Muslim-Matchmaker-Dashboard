# Frontend Developer Instructions & Coding Standards

This guide outlines the coding standards, styling conventions, layout systems, and developers' instructions for modifying or adding files to the **Matchmaking CRM Dashboard** frontend.

---

## 1. Code Style & TypeScript Standards

- **Strict Typing**: Define clear types/interfaces for all props, states, API payloads, and mock data. Avoid using `any`.
- **Naming Conventions**:
  - Components and Pages: Use PascalCase (e.g., `UserDetail.tsx`, `RootLayout.tsx`).
  - Hooks: Use camelCase starting with `use` (e.g., `useAuth.ts`).
  - Constants and static datasets: UPPER_SNAKE_CASE (e.g., `GENDER_OPTIONS` in `src/app/data/filterChoices.ts`).
- **File Structure**: Each React component file should contain one primary component. Keep helper sub-render functions below the main component, or extract them into `/src/app/components/ui/` if they are reused.

---

## 2. Design System & Styling (Tailwind CSS v4 + MUI)

The dashboard uses a hybrid layout combining **Tailwind CSS v4** and **MUI (Material UI)** components.

### Tailwind CSS v4 Rules
- **CSS Import**: Tailwind CSS v4 is configured using `@import "tailwindcss"` in `src/styles/tailwind.css`.
- **No v3 directives**: Never write `@tailwind base;`, `@tailwind components;`, or `@tailwind utilities;`.
- **Sources configuration**: Include files under tailwind analysis using `@source '../**/*.{js,ts,jsx,tsx}';` inside `tailwind.css`. Do NOT look for `tailwind.config.js` since Tailwind v4 processes directives inline.
- **Theme Variables**: Color rules are customized in `default_shadcn_theme.css` and mapped using CSS variables. Always use Tailwind utility classes mapping to these variables:
  - Backgrounds: `bg-background`, `bg-card`, `bg-muted`
  - Text: `text-foreground`, `text-primary`, `text-muted-foreground`
  - Borders: `border-border`
  - Rounded corners: `rounded-lg` (maps to `--radius` variable)

### MUI Customization Guidelines
- Use `@mui/material` elements primarily for form controls, select dropdowns, tables, and popovers where accessibility and structure are critical.
- Stylize MUI components by combining them with Tailwind utility classes or custom `sx` prop declarations.
- Avoid nesting arbitrary CSS selectors in global CSS files to customize MUI. Use the MUI theme engine or inline `sx` styles.

---

## 3. Routing & State Management

- **Router**: The application uses React Router v7 browser routes declared in `src/app/routes.tsx`.
- **Layouts**: Wrap child pages within `RootLayout.tsx` which provides the sidebar navigation dashboard outline.
- **Authentication Checks**: Protect components by reading session state or tokens (`localStorage.getItem("amm_auth") === "true"`). Redirect unauthorized requests to `/login`.
- **Forms**: Use stateless input handlers or `react-hook-form` for complex validation flows. Ensure errors are displayed cleanly near their fields.

---

## 4. Working with Mock Data

During local development, components read static state arrays from `src/app/data/*`.
- When adding new data columns or profile attributes, first update the mocks in `mockUsers.ts` or `mockLeads.ts` to ensure UI components don't crash.
- When ready to hook components up to the Django backend, replace mock imports with fetch requests or query client state, utilizing environment variables for the endpoint domain.
- Keep data options and choice labels in sync with `src/app/data/filterChoices.ts`.
