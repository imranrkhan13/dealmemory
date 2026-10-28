export const dynamic='force-dynamic';
import { prisma } from '@/lib/db';
import { projectScope,scopeError } from '@/lib/project-scope';
export async function GET(req:Request) {
  try {const projectId=await projectScope(req);const [count,latest]=projectId?await Promise.all([prisma.activationEvent.count({where:{projectId}}),prisma.activationEvent.findFirst({where:{projectId},orderBy:{occurredAt:'desc'},select:{occurredAt:true}})]):[0,null];
    return Response.json({ok:true,ingestion:count?'connected':'awaiting_events',eventCount:count,latestEvent:latest?.occurredAt??null,supermemory:Boolean(process.env.SUPERMEMORY_API_KEY),dodo:Boolean(process.env.DODO_API_KEY)});
  }catch(e){return scopeError(e);}
}
