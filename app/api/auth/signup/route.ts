export const dynamic='force-dynamic';
import { randomUUID } from 'node:crypto';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signupSchema } from '@/lib/auth';
const schema=signupSchema;
// Best-effort only: per-process throttle is not durable across serverless instances.
const attempts=new Map<string,{count:number;until:number}>();
export async function POST(req:Request) {
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const now=Date.now();
  for(const [id,entry] of Array.from(attempts)) if(entry.until<now) attempts.delete(id);
  const entry=attempts.get(ip) || {count:0,until:now+60000};
  if(++entry.count>20 || attempts.size>10000) return Response.json({ok:false,error:'Please try again later'},{status:429});
  attempts.set(ip,entry);
  const parsed=schema.safeParse(await req.json().catch(()=>null));
  if(!parsed.success)return Response.json({ok:false,error:parsed.error.issues[0].message},{status:400});
  const {email,password,name}=parsed.data;
  const passwordHash=await hash(password,10);
  try {
    const result=await prisma.$transaction(async tx=>{
      const user=await tx.user.create({data:{email,name:name?.trim()||null,passwordHash}});
      const project=await tx.project.create({data:{ownerId:user.id,name:`${name?.trim()||email.split('@')[0]}'s Project`,slug:`project-${randomUUID()}`}});
      return {user:{id:user.id,email:user.email,name:user.name},project:{id:project.id,name:project.name,slug:project.slug}};
    });
    return Response.json({ok:true,...result});
  }catch(e){
    // Same status/message for existing accounts; client sign-in proves credentials.
    if((e as {code?:string}).code==='P2002')return Response.json({ok:true});
    console.error('signup_failed');return Response.json({ok:false,error:'Unable to create account'},{status:500});
  }
}
