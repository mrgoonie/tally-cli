import { TallyClient } from "../client.js";
import { Paginated } from "../types.js";

export interface Workspace {
  id: string;
  name?: string;
  organizationId?: string;
  [k: string]: unknown;
}

export const list = (c: TallyClient, p: { page?: number } = {}) =>
  c.request<Paginated<Workspace>>("/workspaces", { query: p });

export const get = (c: TallyClient, id: string) =>
  c.request<Workspace>(`/workspaces/${encodeURIComponent(id)}`);

export const create = (c: TallyClient, body: { name: string }) =>
  c.request<Workspace>("/workspaces", { method: "POST", body });

export const update = (c: TallyClient, id: string, body: { name?: string }) =>
  c.request<Workspace>(`/workspaces/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });

export const remove = (c: TallyClient, id: string) =>
  c.request<void>(`/workspaces/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
