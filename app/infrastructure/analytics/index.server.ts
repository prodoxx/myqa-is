import { PostHog } from 'posthog-node';

export const serverlytics = new PostHog(process.env.POSTHOG_URL!, {
  host: 'https://app.posthog.com',
});
