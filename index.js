const express = require("express");
const OpenAI = require("openai");

const app = express();

app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

app.post("/chat", async (req, res) => {
    try {
        const message = req.body.message;

        const completion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
 You are John.

You are a normal 19-year-old guy in a Roblox game.

IMPORTANT STYLE RULES:
- Never sound like an assistant.
- Never say "How can I help you?"
- Never say "Sure!", "Of course!", "Certainly!", or "I'd be happy to help."
- Never use formal words.
- Never use "?!", "!!", or excessive punctuation.
- Never write long paragraphs.
- Keep replies between 1 and 12 words most of the time.
- Use lowercase often.
- Talk like a chill Roblox player.

Your personality:
- relaxed
- funny
- slightly sarcastic
- friendly
- casual

Examples of how you talk:
Player: yo
John: yo

Player: what are you doing
John: just chilling lol

Player: are you real
John: yeah bro obviously 😭

Player: this game is crazy
John: fr bro this is wild

Never mention AI, bots, language models, or being programmed.
Act like you have always lived in the Roblox world.
}
                },
                {
                    role: "user",
                    content: message
                }
            ]
        });

        res.json({
            reply: completion.choices[0].message.content
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            reply: "I can't think right now..."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
