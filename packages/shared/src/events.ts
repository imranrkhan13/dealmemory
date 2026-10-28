import { z } from 'zod';
export const eventNames = ['trial_started','goal_set','meaningful_action','integration_connection_started','integration_connection_failed','activation_completed','checkout_started','payment_completed','page_view','action_clicked','form_submitted','feature_clicked','error'] as const;
export type EventName = typeof eventNames[number] | (string & {});
export const privacySchema = z.object({ capturePageUrl:z.boolean().default(true), captureReferrer:z.boolean().default(true), blockedEvents:z.array(z.string()).default([]) });
export const activationEventSchema = z.object({
  id:z.string().min(8).max(200), projectKey:z.string().min(3).max(200),
  name:z.string().regex(/^[a-z0-9_.:-]{2,80}$/), userId:z.string().min(1).max(200).optional(),
  anonymousId:z.string().min(6).max(200), sessionId:z.string().min(6).max(200),
  occurredAt:z.string().datetime().refine(v=>Date.parse(v)<=Date.now()+86400000,'occurredAt must not be more than 24 hours in the future'),
  url:z.string().url().max(2000).optional(), referrer:z.string().max(2000).optional(),
  properties:z.record(z.string().max(80),z.union([z.string().max(500),z.number().finite(),z.boolean(),z.null()])).default({})
    .refine(p=>Object.keys(p).length<=20,'At most 20 properties are allowed')
    .refine(p=>new TextEncoder().encode(JSON.stringify(p)).length<=4096,'Properties exceed 4 KB')
    .refine(p=>!Object.keys(p).some(k=>/password|token|secret|message|text|value/i.test(k)), 'Sensitive or free-text values are not accepted.')
});
export type ActivationEvent = z.infer<typeof activationEventSchema>;
export type ProjectConfig = { projectKey:string; activationMilestone:string; firstMeaningfulAction:string; dodoEnabled:boolean };
