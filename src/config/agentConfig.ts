import OpenAI from "openai";
import { systemPrompt, Task, tools } from "./Tasks";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export const client = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY, // This is the default and can be omitted
});

export async function LLM(userPrompt: string) {

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: systemPrompt,
    },

    {
      role: "user",
      content: userPrompt,
    },
  ];

  {
    for (let i = 0; i < 5; i++) {
      try {
        const res = await client.chat.completions.create({
          model: "gpt-4o",
          messages,
          tools,
        });
 
        
        if (res.choices[0].finish_reason == "tool_calls") {
          const toolsToBeCalled = res.choices[0].message.tool_calls;
          
          if (!toolsToBeCalled) return;

          for (const tool of toolsToBeCalled) {
            //call the function
            const name = tool.function.name;
            const toolId = tool.id;

            const args = JSON.parse(tool.function.arguments);
            const func = await Task[name](args);

            messages.push({
              role: "assistant",
              content: null,
              tool_calls: toolsToBeCalled,
            });

            // Push the tool response message to the messages array
            messages.push({
              role: "tool",
              tool_call_id: toolId,
              content: JSON.stringify(func),
            });
          }
        }

        if (res.choices[0].finish_reason == "stop") {
          return res.choices[0].message.content;
        }
      } catch (error: any) {
        console.log("🚀 ~ LLM ~ error:", error.error);
        throw new Error(error);
      }
    }
  }
}
