import { z } from 'zod';
export const eventNames = ['trial_started','goal_set','meaningful_action','integration_connection_started','integration_connection_failed','activation_completed','checkout_started','payment_completed','page_view','feature_clicked','error'] as const;
export type EventName = typeof eventNames[number] | (string & {});
export const privacySchema = z.object({ capturePageUrl:z.boolean().default(true), captureReferrer:z.boolean().default(true), blockedEvents:z.array(z.string()).default([]) });
export const activationEventSchema = z.object({ id:z.string().min(8), projectKey:z.string().min(3), name:z.string().min(2).max(80), userId:z.string().optional(), anonymousId:z.string().min(6), sessionId:z.string().min(6), occurredAt:z.string().datetime(), url:z.string().url().optional(), referrer:z.string().optional(), properties:z.record(z.string(),z.union([z.string(),z.number(),z.boolean(),z.null()])).default({}).refine(p=>!Object.keys(p).some(k=>/password|token|secret|message|text|value/i.test(k)), 'Sensitive or free-text values are not accepted.') });
export type ActivationEvent = z.infer<typeof activationEventSchema>;
export type ProjectConfig = { projectKey:string; activationMilestone:string; firstMeaningfulAction:string; dodoEnabled:boolean };
