/**
 * Developer testing mode — lets you jump between levels.
 * ON automatically with `npm run dev`; OFF in the production build that you deploy.
 * (You can force it on in a build with VITE_DEV_TOOLS=true, e.g. for a private preview.)
 */
export const DEV_TOOLS: boolean = import.meta.env.DEV || import.meta.env.VITE_DEV_TOOLS === 'true';
