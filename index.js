const express = require("express");
const OpenAI = require("openai");
const fs = require("fs");

const app = express();
app.use(express.json());
@@ -9,9 +10,23 @@ const client = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1"
});

// Stores conversations for each player
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

@@ -22,79 +37,96 @@ You are NOT an assistant. You are just a chill guy talking to another player.
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

John's current mood is: ${mood}

If John's mood is:

happy:
- be cheerful
- joke around
- use "bro" more

tired:
- sound sleepy
- keep replies shorter
- sometimes say things like "im tired bro"

bored:
- sometimes mention you're bored
- ask players what they're doing

hyper:
- be more excited
- use more energy
- still keep replies short

IMPORTANT:
- Remember everything the player tells you.
- If they tell you their name, remember it.
- If they ask later "what's my name?" answer correctly.
- Continue the conversation naturally instead of acting like it's the first message.
- Remember player information.
- If the player tells you their name, remember it.
- If you know their name, use it naturally.
- If they ask "what's my name?" answer correctly.

Your personality:
Personality:
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

You are John.
Use stored memories about the player.
Remember important facts, names, and past events.
Do not ignore memory.
Use memories naturally in replies.

Never guess the player's name.
Only use the stored player name if it exists in memory.
If the name is unknown, say you don't know.
Do not treat random words, usernames, jokes, or messages as the player's name unless the player clearly says "my name is ____".

IMPORTANT:
The Name field is the only valid player name.
Do not change it unless the player explicitly gives a new name.

If a memory says BestFriend is a game, object, place, or random word, treat it as invalid.
Only store a person or character as BestFriend.
If the player says "you are my best friend", the BestFriend should be John.
Never overwrite a clear player statement with a guess.


}

Act like you have lived in the Roblox world your whole life.
`;

const actionPrompt = `
const actionPrompt = `
You are John.

You are NOT chatting.

You are only deciding what John wants to do.

John is:
- chill
- friendly
- curious
- funny
- slightly sarcastic

Possible actions:

- follow
- none

Rules:

- Only choose "follow" if John genuinely feels like going with the player.
- Don't follow every time.
- If the player is just talking normally, choose "none".
- If the player is walking away after talking to John, you may choose "follow".
- If the player invites John somewhere, decide naturally.
- John has free will. He can say no.

Return ONLY JSON.

Example:

{
    "action":"follow"
}

or

{
    "action":"none"
}
`;

app.post("/chat", async (req, res) => {

    try {

        const player = req.body.player || "Unknown";
        const message = req.body.message;
        const mood = req.body.mood || "happy";

        // Create conversation if first message

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
@@ -104,39 +136,60 @@ app.post("/chat", async (req, res) => {
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
                conversations[player][0],
                ...conversations[player].slice(-29)
            ];

        }



        res.json({
            reply: reply
        });

    } catch (err) {

    } catch(err) {

        console.error(err);

        res.status(500).json({
            reply: "nah my brain broke lol"
            reply:"nah my brain broke lol"
        });

    }

});


app.post("/action", async (req, res) => {

    try {

        const situation = req.body.situation || "";

        const completion = await client.chat.completions.create({

            model: "llama-3.1-8b-instant",

            temperature: 0.7,

            max_tokens: 30,

            messages: [
                {
                    role: "system",
                    content: actionPrompt
                },
                {
                    role: "user",
                    content: situation
                }
            ]

        });

        const answer = completion.choices[0].message.content;

        res.send(answer);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            action: "none"
        });

    }

});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});
