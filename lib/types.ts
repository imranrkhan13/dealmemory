export type PlanStatus = 'trial' | 'activated' | 'checkoutstarted' | 'paid';
export type EventType = 'goalset' | 'githubconnectionstarted' | 'githuboauthfailed' | 'githubconnected' | 'architecturemapgenerated' | 'checkoutstarted' | 'paymentcompleted';
export type MemoryCategory = 'goal' | 'setupstate' | 'blocker' | 'progress' | 'objection' | 'purchasecontext';
export type TrialUser = { id: string; name: string; email?: string; planStatus: PlanStatus; goal?: string; activationMilestone: 'firstarchitecture_map'; githubConnected: boolean; firstMapGenerated: boolean; currentBlocker?: string; checkoutUrl?: string; createdAt: string; updatedAt: string };
export type ProductEvent = { id: string; userId: string; type: EventType; detail: string; createdAt: string };
export type MemoryItem = { category: MemoryCategory; content: string; source: 'usermessage' | 'productevent'; createdAt: string };
export type Store = { user: TrialUser; events: ProductEvent[]; memories: MemoryItem[] };
