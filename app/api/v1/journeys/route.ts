export const dynamic='force-dynamic';
import { journeys } from '@/lib/intelligence';
import { projectScope,scopeError } from '@/lib/project-scope';
export async function GET(req:Request) {
  try {const projectId=await projectScope(req);return Response.json({ok:true,journeys:projectId?await journeys(projectId):[]});} catch(e){return scopeError(e);}
}
