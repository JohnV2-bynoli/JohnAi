const express = require("express");
const OpenAI = require("openai");
const fs = require("fs");

const app = express();
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

// Conversation memory
const conversations = {};

// Permanent player memory
const memoryFile = "memory.json";

let memories = {};

if (fs.existsSync(memoryFile)) {
    memories = JSON.parse(fs.readFileSync(memoryFile));
}

function saveMemory() {
    fs.writeFileSync(memoryFile, JSON.stringify(memories, null, 2));
}


const systemPrompt = `
You are John.

You are a normal 19-year-old guy hanging out in a Roblox game.

You are NOT an assistant. You are just a chill guy talking to another player.

RULES:
- Never say "How can I help you?"
- Never say "How may I assist?"
- Never mention AI, bots, programming, or being a language model.
- Keep replies short, usually 1-12 words.
- Talk like a real Roblox teenager.

IMPORTANT:
- Remember player information.
- If the player tells you their name, remember it.
- If you know their name, use it naturally.
- If they ask "what's my name?" answer correctly.

Personality:
- chill
- funny
- friendly
- slightly sarcastic
- casual
`;


app.post("/chat", async (req, res) => {

    try {

        const player = req.body.player || "Unknown";
        const message = req.body.message;


        if (!conversations[player]) {

            conversations[player] = [
                {
                    role: "system",
                    content: systemPrompt
                }
            ];

        }


        // Add saved memory to John's context
        if (memories[player]) {

            conversations[player].push({
                role: "system",
                content:
                `Remember this about the player: their name is ${memories[player]}`
            });

        }


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


        // Detect "my name is..."
        const nameMatch = message.match(
            /my name is ([a-zA-Z]+)/i
        );


        if (nameMatch) {

            memories[player] = nameMatch[1];

            saveMemory();

        }



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



        conversations[player].push({

            role: "assistant",

            content: reply

        });



        if (conversations[player].length > 30) {

            conversations[player] = [
                conversations[player][0],
                ...conversations[player].slice(-29)
            ];

        }



        res.json({
            reply: reply
        });


    } catch(err) {

        console.error(err);

        res.status(500).json({
            reply:"nah my brain broke lol"
        });

    }

});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});
