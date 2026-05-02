import { TallyClient } from "../client.js";

export interface Invite {
  id: string;
  email?: string;
  status?: string;
  [k: string]: unknown;
}

export interface CreateInviteInput {
  emails: string[];
  workspaceIds: string[];
  role?: string;
}

export const list = (c: TallyClient, orgId: string) =>
  c.request<Invite[]>(`/organizations/${encodeURIComponent(orgId)}/invites`);

export const create = (
  c: TallyClient,
  orgId: string,
  body: CreateInviteInput,
) =>
  c.request<Invite[]>(
    `/organizations/${encodeURIComponent(orgId)}/invites`,
    { method: "POST", body },
  );

export const cancel = (c: TallyClient, orgId: string, inviteId: string) =>
  c.request<void>(
    `/organizations/${encodeURIComponent(orgId)}/invites/${encodeURIComponent(inviteId)}`,
    { method: "DELETE" },
  );
