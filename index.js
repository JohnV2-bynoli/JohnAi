const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/chat", async (req, res) => {
    try {
        const message = req.body.message;

        const response = await openai.responses.create({
            model: "gpt-5-mini",
            input: "You are a friendly Roblox NPC. Keep your replies short.\nPlayer: " + message
        });

        res.json({
            reply: response.output_text
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            reply: "Sorry, something went wrong."
        });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});