export const dynamic='force-dynamic';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { ownedProject,scopeError } from '@/lib/project-scope';
import { writeSupermemory } from '@/lib/memory';
import { getPlanState } from '@/lib/billing';
const schema=z.object({projectId:z.string().min(1).max(200),externalUserId:z.string().min(1).max(200),content:z.string().min(2).max(500),category:z.enum(['goal','setupstate','blocker','progress','objection','purchasecontext']).default('progress')}).strict();
export async function POST(req:Request) {
  try {
    const {userId}=await requireAuth();
    const parsed=schema.safeParse(await req.json().catch(()=>null));
    if(!parsed.success) return Response.json({ok:false,error:'Invalid memory request'},{status:400});
    const data=parsed.data;
    if(!await ownedProject(userId,data.projectId)) return Response.json({ok:false,error:'Forbidden'},{status:403});
    const plan=await getPlanState(userId);
    if(!plan.isPro) return Response.json({ok:false,code:'pro_required',error:'Semantic memory is part of the Growth Pro plan.'},{status:402});
    const provider=await writeSupermemory(data.projectId,data.externalUserId,{category:data.category,content:data.content,source:'usermessage',createdAt:new Date().toISOString()});
    return Response.json({ok:true,provider});
  }catch(e){if((e as any)?.status)return scopeError(e);return Response.json({ok:false,error:'Memory provider unavailable'},{status:502});}
}
