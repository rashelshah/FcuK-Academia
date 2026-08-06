import type { FeedbackPayload, FeedbackPriority, FeedbackType } from '../types';

// ─── Discord Color Map ────────────────────────────────────────────────────────

const TYPE_COLORS: Record<FeedbackType, number> = {
  bug: 0xff5c5c,         // red
  feature: 0x5865f2,     // indigo
  incorrect_data: 0xff9900, // amber
  general: 0x57f287,    // green
};

const PRIORITY_EMOJI: Record<FeedbackPriority, string> = {
  HIGH: '🔴 HIGH',
  MEDIUM: '🟡 MEDIUM',
  LOW: '🟢 LOW',
};

const TYPE_EMOJI: Record<FeedbackType, string> = {
  bug: '🐞',
  feature: '💡',
  incorrect_data: '📊',
  general: '❤️',
};

const TYPE_LABEL: Record<FeedbackType, string> = {
  bug: 'Bug Report',
  feature: 'Feature Suggestion',
  incorrect_data: 'Incorrect Data',
  general: 'General Feedback',
};

const SEP = '━━━━━━━━━━━━━━━━━━━━━━━━';

// ─── Embed Builder ────────────────────────────────────────────────────────────

export function buildDiscordEmbed(
  payload: FeedbackPayload,
  feedbackId: string,
  priority: FeedbackPriority
) {
  const { feedbackType, selectedPresets, customMessage, diagnostics } = payload;

  const title = `${TYPE_EMOJI[feedbackType]} ${TYPE_LABEL[feedbackType]} · ${feedbackId}`;
  const description = [
    `**Priority**: ${PRIORITY_EMOJI[priority]}`,
    SEP,
    selectedPresets.length > 0
      ? `**Preset**: ${selectedPresets.join(', ')}`
      : null,
    customMessage
      ? `**Description**:\n> ${customMessage.replace(/\n/g, '\n> ')}`
      : null,
    SEP,
    `**App**: \`${diagnostics.appVersion}\` · **Theme**: \`${diagnostics.theme}\``,
    `**Platform**: \`${diagnostics.platform}\` · **Browser**: \`${diagnostics.browser}\``,
    `**OS**: \`${diagnostics.os}\` · **Viewport**: \`${diagnostics.viewportSize}\``,
    `**Route**: \`${diagnostics.route}\``,
    diagnostics.pwaInstalled ? `**PWA**: Installed` : null,
    SEP,
    `**Submitted**: ${diagnostics.timestamp}`,
    `**Timezone**: ${diagnostics.timezone}`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    embeds: [
      {
        title,
        description,
        color: TYPE_COLORS[feedbackType],
        footer: {
          text: `FcuK Academia · ${process.env.NEXT_PUBLIC_APP_ENV ?? 'production'} · ${diagnostics.userAgent.slice(0, 80)}`,
        },
      },
    ],
  };
}

// ─── Provider: sendFeedback ────────────────────────────────────────────────────

export async function sendFeedback(
  payload: FeedbackPayload,
  feedbackId: string,
  priority: FeedbackPriority
): Promise<{ ok: boolean; status: number }> {
  const webhookUrl = process.env.DISCORD_FEEDBACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('[feedback] DISCORD_FEEDBACK_WEBHOOK_URL not set — skipping dispatch');
    return { ok: true, status: 200 };
  }

  const embed = buildDiscordEmbed(payload, feedbackId, priority);

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(embed),
  });

  return { ok: res.ok, status: res.status };
}
