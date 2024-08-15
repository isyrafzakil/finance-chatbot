import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import financeDocs from "../../data/finance_docs.json";

// Initialize OpenAI instance with OpenRouter settings
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY!,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Finance Chatbot",
  },
});

// Define allowed topics to filter questions
const allowedTopics = [
  "personal finance",
  "expense",
  "expense management",
  "islamic finance",
  "budgeting",
  "investing",
  "saving",
  "debt management",
  "financial planning",
  "islamic banking",
  "shariah compliance",
  "more",
  "further",
  "elaborate",
  "explain",
  "purpose",
  "previous",
  "thanks",
  "hello",
  "tell",
];

// Function to filter questions based on allowed topics
const filterQuestion = (question: string): boolean => {
  const lowerCaseQuestion = question.toLowerCase();
  return allowedTopics.some((topic) => lowerCaseQuestion.includes(topic));
};

// Function to retrieve relevant documents for RAG
const retrieveRelevantDocuments = async (question: string) => {
  return financeDocs
    .filter((doc) =>
      doc.tags.some((tag) => question.toLowerCase().includes(tag.toLowerCase()))
    )
    .map((doc) => doc.content);
};

// Function to generate the prompt for the Llama model
const generatePrompt = (
  history: string[],
  docs: string[],
  query: string
): string => {
  const docContent =
    docs.length > 0 ? `\n\nDocuments:\n${docs.join("\n")}` : "";
  return `
    You are a chatbot specializing in personal finance, expense management, and Islamic finance.
    Given the conversation history below, provide a relevant response to the new question.

    Conversation history:
    ${history.join("\n")}

    ${docContent}

    New question: ${query}
  `;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { prompt, history } = req.body;

    // Check if the question is within allowed topics
    if (!filterQuestion(prompt)) {
      return res.status(400).json({
        error:
          "Your question is out of scope. Please ask a question related to personal finance, expense management, or Islamic finance.",
      });
    }

    try {
      // Retrieve relevant documents for the prompt
      const relevantDocs = await retrieveRelevantDocuments(prompt);
      const documents = relevantDocs.join("\n");

      // Generate the full prompt including conversation history
      const fullPrompt = generatePrompt(
        history.map((msg) => `${msg.user}: ${msg.text}`),
        relevantDocs,
        prompt
      );

      // Call the OpenAI API with the constructed prompt
      const completion = await openai.chat.completions.create({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          {
            role: "system",
            content:
              "You are a chatbot specializing in personal finance, expense management, and Islamic finance.",
          },
          { role: "user", content: fullPrompt },
        ],
      });

      if (
        completion.choices[0] &&
        completion.choices[0].message &&
        completion.choices[0].message.content
      ) {
        res
          .status(200)
          .json({ response: completion.choices[0].message.content.trim() });
      } else {
        res.status(500).json({ error: "Failed to fetch response from API" });
      }
    } catch (error) {
      console.error("API call error:", error);
      res.status(500).json({ error: "Failed to fetch response from API" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
