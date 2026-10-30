import { requireAuth } from './auth';
import { prisma } from './db';
export async function ownedProject(ownerId:string, projectId?:string|null) {
  return prisma.project.findFirst({where:{ownerId,...(projectId?{id:projectId}:{})},orderBy:[{createdAt:'desc'},{id:'desc'}],select:{id:true}});
}
export async function projectScope(req: Request) {
  const { userId } = await requireAuth();
  const rawRequested = new URL(req.url).searchParams.get('projectId');
  const requested =
    rawRequested && rawRequested !== 'null' && rawRequested !== 'undefined' && rawRequested.trim() !== ''
      ? rawRequested.trim()
      : null;
  const project = await ownedProject(userId, requested);
  if (requested && !project) {
    // Check if the requested project is a foreign project belonging to another user
    const foreignProject = await prisma.project.findUnique({
      where: { id: requested },
      select: { ownerId: true },
    });
    if (foreignProject && foreignProject.ownerId !== userId) {
      throw Object.assign(new Error('Forbidden'), { status: 403 });
    }

    // If requested was a stale/placeholder id, fallback to user's default owned project
    const fallback = await ownedProject(userId, null);
    if (fallback) return fallback.id;

    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }
  return project?.id ?? null;
}
export function scopeError(e:unknown) {
  console.error('[scopeError]', e);
  const status = (e as { status?: number })?.status;
  const message = e instanceof Error ? e.message : 'Unable to load project data';
  return Response.json(
    {
      ok: false,
      error: status === 401 ? 'Authentication required' : status === 403 ? 'Forbidden' : (message || 'Unable to load project data'),
    },
    { status: status === 401 || status === 403 ? status : 500 }
  );
}
