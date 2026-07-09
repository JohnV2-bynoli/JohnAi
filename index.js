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
            temperature: 1.2,
            max_tokens: 50,

            messages: [
                {
                    role: "system",
                    content: `
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
`
                },
                {
                    role: "user",
                    content: message
                }
            ]
        });


        let reply = completion.choices[0].message.content;


        // John style cleanup
        reply = reply
            .replace(/\?\!/g, "")
            .replace(/\!\!/g, "")
            .replace(/How can I help you\??/gi, "idk bro")
            .replace(/How may I assist\??/gi, "idk bro")
            .replace(/I'm an AI/gi, "nah bro")
            .replace(/I am an AI/gi, "nah bro")
            .trim();


        // Keep John short
        if (reply.length > 100) {
            reply = reply.split(".")[0];
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
