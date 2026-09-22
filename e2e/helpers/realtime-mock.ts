import { Page, WebSocketRoute } from '@playwright/test';

import type { VoteRow } from '../../src/app/core/models/vote.model';

type ChangeFilter = Record<string, string>;
type ClientMessage = [
  string | null,
  string,
  string,
  string,
  { config?: { postgres_changes?: ChangeFilter[] } },
];

const VOTE_COLUMNS = ['id', 'question_id', 'option_id'].map((name) => ({ name, type: 'uuid' }));

/** Gives every change filter of a join an id, the way the Realtime server answers it. */
function joinedChanges(message: ClientMessage): ChangeFilter[] {
  const [, , , , payload] = message;
  const filters = payload.config?.postgres_changes ?? [];
  return filters.map((filter, index) => ({ ...filter, id: String(index + 1) }));
}

/** Answers joins, leaves and heartbeats of the page with an ok. */
function answer(socket: WebSocketRoute, text: string, topics: Map<string, WebSocketRoute>): void {
  const message = JSON.parse(text) as ClientMessage;
  const [joinRef, ref, topic, event] = message;
  if (event === 'phx_join') topics.set(topic, socket);
  if (event === 'phx_leave') topics.delete(topic);
  const response = event === 'phx_join' ? { postgres_changes: joinedChanges(message) } : {};
  socket.send(JSON.stringify([joinRef, ref, topic, 'phx_reply', { status: 'ok', response }]));
}

/** Builds the message that tells the page about a new vote. */
function voteMessage(topic: string, vote: VoteRow): string {
  const data = {
    type: 'INSERT',
    schema: 'public',
    table: 'votes',
    commit_timestamp: new Date().toISOString(),
    columns: VOTE_COLUMNS,
    record: vote,
    old_record: {},
    errors: null,
  };
  return JSON.stringify([null, null, topic, 'postgres_changes', { ids: ['1'], data }]);
}

export interface RealtimeMock {
  pushVote: (vote: VoteRow) => void;
  openChannels: () => number;
}

/** Plays the Supabase Realtime server for the page. */
export async function mockRealtime(page: Page): Promise<RealtimeMock> {
  const topics = new Map<string, WebSocketRoute>();
  await page.routeWebSocket(/\/realtime\/v1\/websocket/, (socket) => {
    socket.onMessage((text) => answer(socket, String(text), topics));
  });
  return {
    /** Sends a new vote to every open channel of the page. */
    pushVote: (vote) => topics.forEach((socket, topic) => socket.send(voteMessage(topic, vote))),
    /** Returns how many channels the page has joined. */
    openChannels: () => topics.size,
  };
}
