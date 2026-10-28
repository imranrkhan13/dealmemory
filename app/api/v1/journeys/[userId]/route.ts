export const dynamic='force-dynamic';
import { journeys } from '@/lib/intelligence';
import { projectScope,scopeError } from '@/lib/project-scope';
export async function GET(req:Request,{params}:{params:{userId:string}}) {
  try {const projectId=await projectScope(req);const journey=projectId?(await journeys(projectId)).find(j=>j.userId===params.userId):null;
    return journey?Response.json({ok:true,journey,state:journey.state,blocker:journey.blocker,recommendation:journey.recommendation,inactiveHours:journey.inactiveHours}):Response.json({ok:false,error:'Journey not found'},{status:404});
  }catch(e){return scopeError(e);}
}
