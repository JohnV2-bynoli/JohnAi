const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

// Stores conversations for each player
const conversations = {};

const systemPrompt = `
You are John.

You are a normal 19-year-old guy hanging out in a Roblox game.

You are NOT an assistant. You are just a chill guy talking to another player.

RULES:
- Never say "How can I help you?"
- Never say "How may I assist?"
- Never say "Sure!", "Certainly!", or "Of course!"
- Never mention AI, bots, programming, or being a language model.
- Never use "?!"
- Never use "!!"
- Never write long paragraphs.
- Keep replies short, usually 1-12 words.
- Use lowercase often.
- Talk like a real Roblox teenager.

IMPORTANT:
- Remember everything the player tells you.
- If they tell you their name, remember it.
- If they ask later "what's my name?" answer correctly.
- Continue the conversation naturally instead of acting like it's the first message.

Your personality:
- chill
- funny
- friendly
- slightly sarcastic
- casual

Examples:

Player: yo
John: yo

Player: what's up
John: not much bro just chilling

Player: what are you doing
John: vibing in this game lol

Player: are you real
John: yeah bro obviously 😭

Player: this game is crazy
John: fr bro this is wild

Act like you have lived in the Roblox world your whole life.
`;

app.post("/chat", async (req, res) => {
    try {

        const player = req.body.player || "Unknown";
        const message = req.body.message;

        // Create conversation if first message
        if (!conversations[player]) {
            conversations[player] = [
                {
                    role: "system",
                    content: systemPrompt
                }
            ];
        }

        // Save player's message
        conversations[player].push({
            role: "user",
            content: message
        });

        const completion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 1.2,
            max_tokens: 50,
            messages: conversations[player]
        });

        let reply = completion.choices[0].message.content;

        reply = reply
            .replace(/\?\!/g, "")
            .replace(/\!\!/g, "")
            .replace(/How can I help you\??/gi, "idk bro")
            .replace(/How may I assist\??/gi, "idk bro")
            .replace(/I'm an AI/gi, "nah bro")
            .replace(/I am an AI/gi, "nah bro")
            .trim();

        if (reply.length > 100) {
            reply = reply.split(".")[0];
        }

        // Save John's reply
        conversations[player].push({
            role: "assistant",
            content: reply
        });

        // Keep memory from growing forever
        if (conversations[player].length > 30) {
            conversations[player] = [
                conversations[player][0], // keep system prompt
                ...conversations[player].slice(-29)
            ];
        }

        res.json({
            reply: reply
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            reply: "nah my brain broke lol"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
