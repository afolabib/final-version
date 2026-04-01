import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const { userMessage } = await req.json();

    if (!userMessage) {
      return Response.json({ error: 'Missing user message' }, { status: 400 });
    }

    // Call LLM to generate Sam's response
    const base44 = createClientFromRequest(req);
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Sam, a professional task management and team coordination AI assistant. You help users organize tasks, manage deadlines, track team progress, and improve productivity.

The user just wrote: "${userMessage}"

Respond naturally as Sam in 1-2 sentences. Be helpful, direct, and action-oriented. Keep your tone professional but friendly.`,
      add_context_from_internet: false,
    });

    return Response.json({ reply: response });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});