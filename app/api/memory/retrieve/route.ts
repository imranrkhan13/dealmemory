export const dynamic='force-dynamic';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { ownedProject,scopeError } from '@/lib/project-scope';
import { retrieveSupermemory } from '@/lib/memory';
const schema=z.object({projectId:z.string().min(1).max(200),externalUserId:z.string().min(1).max(200)}).strict();
export async function POST(req:Request) {
  try {
    const {userId}=await requireAuth();
    const parsed=schema.safeParse(await req.json().catch(()=>null));
    if(!parsed.success) return Response.json({ok:false,error:'Invalid memory request'},{status:400});
    const data=parsed.data;
    if(!await ownedProject(userId,data.projectId)) return Response.json({ok:false,error:'Forbidden'},{status:403});
    const provider=await retrieveSupermemory(data.projectId,data.externalUserId);
    return Response.json({ok:true,provider,results:provider.results});
  }catch(e){if((e as any)?.status)return scopeError(e);return Response.json({ok:false,error:'Memory provider unavailable'},{status:502});}
}
