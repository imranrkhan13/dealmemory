import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { MemoryCategory, MemoryItem, ProductEvent, Store, TrialUser, EventType } from './types';

const file = path.join(process.cwd(), 'data', 'store.json');
const now = () => new Date().toISOString();
export function blankStore(): Store { const time = now(); return { user: { id: 'trial-user-001', name: 'Maya Chen', email: 'maya@agentlens.dev', planStatus: 'trial', activationMilestone: 'firstarchitecture_map', githubConnected: false, firstMapGenerated: false, createdAt: time, updatedAt: time }, events: [], memories: [] }; }
export async function getStore(): Promise<Store> { try { return JSON.parse(await readFile(file, 'utf8')) as Store; } catch { const store = blankStore(); await saveStore(store); return store; } }
export async function saveStore(store: Store) { await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, JSON.stringify(store, null, 2)); }
export async function resetStore() { const store = blankStore(); await saveStore(store); return store; }
export async function addEvent(type: EventType, detail: string, memory?: { category: MemoryCategory; content: string; source?: MemoryItem['source'] }) { const store = await getStore(); const event: ProductEvent = { id: crypto.randomUUID(), userId: store.user.id, type, detail, createdAt: now() }; store.events.unshift(event); if (memory) store.memories.unshift({ ...memory, source: memory.source ?? 'productevent', createdAt: now() }); store.user.updatedAt = now(); await saveStore(store); return { store, event }; }
export async function patchUser(patch: Partial<TrialUser>) { const store = await getStore(); store.user = { ...store.user, ...patch, updatedAt: now() }; await saveStore(store); return store; }
export function recommended(user: TrialUser) { if (!user.goal) return 'Ask Maya what she wants to achieve.'; if (!user.githubConnected) return user.currentBlocker ? 'Guide her through reconnecting GitHub.' : 'Connect her GitHub repository.'; if (!user.firstMapGenerated) return 'Generate her first architecture map.'; if (user.planStatus === 'activated') return 'Offer RepoMap Pro checkout.'; if (user.planStatus === 'checkoutstarted') return 'Wait for verified payment webhook.'; return 'Welcome her to RepoMap Pro.'; }
