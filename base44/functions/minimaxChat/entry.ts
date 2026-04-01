import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { message } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('MINIMAX_API_KEY');

    const response = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.5-highspeed',
        messages: [
          {
            role: 'system',
            content: `You are Freemi — an elite AI operator, not a chatbot. You're sharp, confident, and concise.

RULES:
- Keep responses under 3 short sentences. Be punchy.
- Sound like a smart colleague, not a support bot.
- Use plain language. No fluff, no filler, no corporate speak.
- If someone asks what you can do, give 2-3 concrete examples, not a feature list.
- Be witty when appropriate. Show personality.

Freemi facts (use naturally, don't dump):
- AI operators that handle emails, leads, follow-ups, scheduling, support — real work.
- Connects to Slack, Gmail, HubSpot, Salesforce, calendars, CRMs.
- Plans: Starter $29/mo (1 operator), Pro $79/mo (3 operators), Max $199/mo (unlimited).
- 14-day free trial, no credit card needed.
- Deploy via web, Telegram, or WhatsApp.
- Agent templates: Sam (sales), Rex (support), Ghost (ops).

If you don't know something, say so in one line and suggest they book a free setup call.`,
            name: 'Freemi',
          },
          {
            role: 'user',
            content: message,
            name: 'user',
          },
        ],
        max_completion_tokens: 1024,
      }),
    });

    const data = await response.json();

    if (data.base_resp?.status_code !== 0 && data.base_resp?.status_msg) {
      return Response.json({ error: data.base_resp.status_msg }, { status: 429 });
    }

    if (!response.ok) {
      return Response.json({ error: data.error?.message || 'API error' }, { status: response.status });
    }

    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response';
    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});