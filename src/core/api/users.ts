import { TallyClient } from "../client.js";

export interface User {
  id: string;
  email?: string;
  name?: string;
  [k: string]: unknown;
}

export const me = (c: TallyClient) => c.request<User>("/users/me");

export const listOrgUsers = (c: TallyClient, orgId: string) =>
  c.request<User[]>(`/organizations/${encodeURIComponent(orgId)}/users`);

export const removeOrgUser = (c: TallyClient, orgId: string, userId: string) =>
  c.request<void>(
    `/organizations/${encodeURIComponent(orgId)}/users/${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );
