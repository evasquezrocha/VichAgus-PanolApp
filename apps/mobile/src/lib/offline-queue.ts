import type { MobileMutationInput } from "@panol/shared";

export type PendingMutation = MobileMutationInput & {
  state: "pending" | "sent" | "failed";
};

export interface OfflineQueueStore {
  list(): Promise<PendingMutation[]>;
  enqueue(mutation: PendingMutation): Promise<void>;
  markSent(clientMutationId: string): Promise<void>;
  clear(): Promise<void>;
}

export class MemoryOfflineQueueStore implements OfflineQueueStore {
  private items: PendingMutation[] = [];

  async list() {
    return [...this.items];
  }

  async enqueue(mutation: PendingMutation) {
    this.items = [...this.items, mutation];
  }

  async markSent(clientMutationId: string) {
    this.items = this.items.map((item) =>
      item.client_mutation_id === clientMutationId
        ? { ...item, state: "sent" }
        : item,
    );
  }

  async clear() {
    this.items = [];
  }
}
