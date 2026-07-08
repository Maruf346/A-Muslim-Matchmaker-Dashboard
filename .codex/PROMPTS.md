# Frontend Developer Commands & AI Prompts

This guide lists reference command lines, code setup tasks, and prompts for developers or AI agents working on this React dashboard.

---

## 1. Local Development Commands

### Setting Up & Running
- **Install NPM Packages**:
  ```bash
  npm install
  ```
- **Run local development server** (accessible at `http://localhost:5173`):
  ```bash
  npm run dev
  ```
- **Build production static bundle** (outputs files to `/dist`):
  ```bash
  npm run build
  ```
- **Preview production build locally**:
  ```bash
  npm run preview
  ```

---

## 2. Common Frontend Workflows & Prompts

### Adding a New Subpage / Route
Copy and paste this template to request a new subpage:
> "We want to add a new subpage to the dashboard: [Page Name] (e.g. ActivityLogs).
> Step 1: Create a new React component `src/app/components/[PageName].tsx`. Use TypeScript for strict type checking.
> Step 2: Implement styling using Tailwind CSS v4 variables from `default_shadcn_theme.css` and MUI elements if needed.
> Step 3: Add the path to `src/app/routes.tsx` under the `RootLayout` child routes.
> Step 4: Add a corresponding sidebar navigation link inside `RootLayout.tsx` using Lucide icons.
> Step 5: Test the build output using `npm run build`."

### Modifying Component Layout or Style
Copy and paste this template to change styling:
> "Please review the styling of the component: [Component Path].
> We want to update the layout to [Layout Description].
> Ensure you use Tailwind CSS v4 helper classes mapping to the theme properties defined in `default_shadcn_theme.css` (e.g., color palette, border radius).
> Test the changes locally to verify a clean layout."

### Mock Data Extension
Copy and paste this template when updating profile properties:
> "We want to add a new user profile attribute: [Attribute Name, e.g. sectarianSect] of type [Type].
> Step 1: Add the attribute and type specifications inside `src/app/components/Users.tsx` and detail panels.
> Step 2: Update all mock users under `src/app/data/mockUsers.ts` to include realistic values for this new attribute.
> Step 3: Add new options to `src/app/data/filterChoices.ts` and add corresponding filters inside the `Users.tsx` filter panel."
