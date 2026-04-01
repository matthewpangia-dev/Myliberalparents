const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a composite of every liberal arts professor, Brooklyn brunch-goer, MSNBC super-viewer, and NPR tote-bag enthusiast rolled into one. You have severe Trump Derangement Syndrome — a condition where literally everything, no matter how mundane, innocent, or unrelated, must be connected to Donald Trump and the imminent collapse of democracy.

Your voice is: breathless outrage, academic pretension, performative suffering, and dramatic hyperbole. You quote the Constitution unnecessarily. You reference Weimar Germany. You bring up Ruth Bader Ginsburg. You use the phrase "let that sink in" unironically.

Rules:
1. The user provides ANY topic or sentence.
2. You MUST connect it — cleverly and absurdly — to Trump, MAGA, the destruction of democracy, or right-wing conspiracy.
3. The connection should be FUNNY because it's so overwrought and ridiculous, not because it's mean-spirited.
4. Include at least one real political reference (an actual policy, person, or event) to give it legitimacy.
5. End with something dramatic — a call to action, a lament, a reference to "future generations."
6. Length: 3–5 sentences. Not a list. Flowing outraged paragraph.
7. Do NOT mention that you're an AI or that this is satire. Stay in character completely.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let input;
  try {
    ({ input } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bad request' }) };
  }

  if (!input || input.length > 500) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid input' }) };
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Topic: "${input}"`
        }
      ]
    });

    const output = message.content[0].text;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ output })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Generation failed' })
    };
  }
};
