import { LLM } from "@/config/agentConfig";

export async function POST(req: Request) {
  const {userContext} = await req.json();


  const res = await LLM(JSON.stringify(userContext));

  return Response.json(res);
}
