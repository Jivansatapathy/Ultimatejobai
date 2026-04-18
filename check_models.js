
const API_KEY = "AIzaSyBoB4ozQDRdu8MYh3YXhAVpXpOew1j7hmI";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Models found:", data.models ? data.models.map(m => m.name) : data);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

listModels();
