// Provider index — import sendFeedback from here, never directly from discord.ts
// Tomorrow: swap discord.ts for slack.ts / telegram.ts / notion.ts without touching callers.
export { sendFeedback } from './discord';
