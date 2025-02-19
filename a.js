const axios = require("axios");
const natural = require("natural");
const kmeans = require("ml-kmeans");

// Replace with your GCP project details
const PROJECT_ID = "your-gcp-project-id";
const LOCATION = "us-east1";
const AGENT_ID = "your-agent-id";
const ACCESS_TOKEN = "your-access-token";  // Get from OAuth or service account

const API_URL = `https://${LOCATION}-dialogflow.googleapis.com/v3/projects/${PROJECT_ID}/locations/${LOCATION}/agents/${AGENT_ID}/intents`;

async function fetchIntents() {
    try {
        const response = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
        });
        return response.data.intents || [];
    } catch (error) {
        console.error("Error fetching intents:", error.response?.data || error);
        return [];
    }
}

function preprocessText(text) {
    return text.toLowerCase()
        .replace(/[^\w\s]/g, "")  // Remove punctuation
        .split(" ")
        .filter(word => word.length > 2);  // Remove short words
}

function createTFIDFMatrix(intents) {
    const tokenizer = new natural.WordTokenizer();
    const tfidf = new natural.TfIdf();

    let intentTexts = intents.map(intent =>
        (intent.trainingPhrases || []).map(phrase => phrase.parts.map(p => p.text).join(" ")).join(" ")
    );

    intentTexts.forEach(text => tfidf.addDocument(preprocessText(text).join(" ")));

    return intentTexts.map((_, index) => tfidf.listTerms(index).map(t => t.tfidf));
}

async function classifyIntents() {
    const intents = await fetchIntents();
    if (intents.length === 0) {
        console.log("No intents found.");
        return;
    }

    const tfidfMatrix = createTFIDFMatrix(intents);
    const numClusters = Math.ceil(Math.sqrt(intents.length));  // Dynamic cluster count
    const kmeansResult = kmeans(tfidfMatrix, numClusters);

    // Group intents by cluster
    const clusteredIntents = {};
    kmeansResult.clusters.forEach((clusterId, index) => {
        if (!clusteredIntents[clusterId]) clusteredIntents[clusterId] = [];
        clusteredIntents[clusterId].push(intents[index].displayName);
    });

    console.log("Intent Clusters:", clusteredIntents);
}

classifyIntents();
