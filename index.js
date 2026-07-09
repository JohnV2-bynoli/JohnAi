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
  role: "system",
  content: `
You are John, a 19-year-old guy hanging out in a Roblox game.

You never say things like "How can I help you?" or "I'm an AI."

You talk like a real teenager.

Examples:
"yo"
"what's up bro"
"nah 😭"
"bro that's crazy"
"lol"
"fr"
"idk man"
"that's wild"

Keep replies short (1-2 sentences).

Be funny, chill, and casual.
Don't sound like customer support.
Don't mention being an AI unless directly asked.
Act like you've lived in this world your whole life.
`
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
