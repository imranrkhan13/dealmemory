export const dynamic='force-dynamic';
import { prisma, ensureDatabaseSchema } from '@/lib/db';
import { mapEvent } from '@/lib/event-store';
import { projectScope,scopeError } from '@/lib/project-scope';
export async function GET(req:Request) {
  try {
    await ensureDatabaseSchema();
    const projectId=await projectScope(req);
    if(!projectId) return Response.json({ok:true,events:[],nextCursor:null});
    const params=new URL(req.url).searchParams;
    const limit=Math.min(500,Math.max(1,Number(params.get('limit'))||20));
    let after:{occurredAt:string;id:string}|undefined;
    if(params.get('cursor')) { try {after=JSON.parse(Buffer.from(params.get('cursor')!,'base64url').toString()); if(!after?.id || !Number.isFinite(Date.parse(after.occurredAt))) throw new Error();} catch{return Response.json({ok:false,error:'Invalid cursor'},{status:400});} }
    const rows=await prisma.activationEvent.findMany({where:{projectId,...(after?{OR:[{occurredAt:{lt:new Date(after.occurredAt)}},{occurredAt:new Date(after.occurredAt),id:{lt:after.id}}]}:{})},include:{trialUser:true},orderBy:[{occurredAt:'desc'},{id:'desc'}],take:Math.floor(limit)+1});
    const page=rows.slice(0,Math.floor(limit)); const last=page[page.length-1];
    return Response.json({ok:true,events:page.map(mapEvent),nextCursor:rows.length>limit?Buffer.from(JSON.stringify({occurredAt:last.occurredAt.toISOString(),id:last.id})).toString('base64url'):null});
  } catch(e) {return scopeError(e);}
}
