import { TallyClient } from "../client.js";
import { Paginated } from "../types.js";

export interface Webhook {
  id: string;
  formId?: string;
  url?: string;
  eventTypes?: string[];
  isEnabled?: boolean;
  [k: string]: unknown;
}

export interface WebhookEvent {
  id: string;
  status?: string;
  attempts?: number;
  [k: string]: unknown;
}

export interface CreateWebhookInput {
  formId: string;
  url: string;
  eventTypes: string[];
  isEnabled?: boolean;
  signingSecret?: string;
}

export interface UpdateWebhookInput {
  formId?: string;
  url?: string;
  eventTypes?: string[];
  isEnabled?: boolean;
  signingSecret?: string;
}

export const list = (c: TallyClient, p: { page?: number; limit?: number } = {}) =>
  c.request<Paginated<Webhook>>("/webhooks", { query: p });

export const create = (c: TallyClient, body: CreateWebhookInput) =>
  c.request<Webhook>("/webhooks", { method: "POST", body });

export const update = (c: TallyClient, id: string, body: UpdateWebhookInput) =>
  c.request<Webhook>(`/webhooks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });

export const remove = (c: TallyClient, id: string) =>
  c.request<void>(`/webhooks/${encodeURIComponent(id)}`, { method: "DELETE" });

export const listEvents = (
  c: TallyClient,
  id: string,
  p: { page?: number } = {},
) =>
  c.request<Paginated<WebhookEvent>>(
    `/webhooks/${encodeURIComponent(id)}/events`,
    { query: p },
  );

export const retryEvent = (c: TallyClient, id: string, eventId: string) =>
  c.request<WebhookEvent>(
    `/webhooks/${encodeURIComponent(id)}/events/${encodeURIComponent(eventId)}`,
    { method: "POST" },
  );
