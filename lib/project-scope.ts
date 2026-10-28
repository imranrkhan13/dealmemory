import { requireAuth } from './auth';
import { prisma } from './db';
export async function ownedProject(ownerId:string, projectId?:string|null) {
  return prisma.project.findFirst({where:{ownerId,...(projectId?{id:projectId}:{})},orderBy:[{createdAt:'desc'},{id:'desc'}],select:{id:true}});
}
export async function projectScope(req:Request) {
  const {userId}=await requireAuth();
  const requested=new URL(req.url).searchParams.get('projectId');
  const project=await ownedProject(userId,requested);
  if(requested && !project) throw Object.assign(new Error('Forbidden'),{status:403});
  return project?.id ?? null;
}
export function scopeError(e:unknown) {
  const status=(e as {status?:number})?.status;
  return Response.json({ok:false,error:status===401?'Authentication required':status===403?'Forbidden':'Unable to load project data'}, {status:status===401||status===403?status:500});
}
