import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

const getApiKey = (): string => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return key;
};

const studyKitSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'An appropriate academic title for this study kit based purely on the material.'
    },
    summaryOverview: {
      type: Type.STRING,
      description: 'A 1 to 2 sentence high-level overview of the uploaded content.'
    },
    keyConcepts: {
      type: Type.ARRAY,
      description: '3 to 5 core concepts extracted strictly from the provided material.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'Name of the core concept.'
          },
          explanation: {
            type: Type.STRING,
            description: 'Strictly 2 to 3 concise sentences explaining the concept in plain, easy-to-understand language.'
          }
        },
        required: ['title', 'explanation']
      }
    },
    practiceQuestions: {
      type: Type.OBJECT,
      description: 'Exactly 3 distinct practice exam questions strictly based on the source material.',
      properties: {
        mcq: {
          type: Type.OBJECT,
          description: 'Multiple Choice Question with 4 options strictly based on the material.',
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Array of exactly 4 choices (A, B, C, D).'
            },
            correctOptionIndex: {
              type: Type.INTEGER,
              description: 'Index from 0 to 3 of the correct choice.'
            },
            explanation: {
              type: Type.STRING,
              description: 'Brief explanation of why the marked answer is correct based on the text.'
            }
          },
          required: ['question', 'options', 'correctOptionIndex', 'explanation']
        },
        shortAnswer: {
          type: Type.OBJECT,
          description: 'Short Answer Question with a sample high-scoring answer.',
          properties: {
            question: { type: Type.STRING },
            sampleAnswer: {
              type: Type.STRING,
              description: 'A sample high-scoring answer strictly grounded in the source material.'
            },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 3 essential grading criteria / factual points required for full marks.'
            }
          },
          required: ['question', 'sampleAnswer', 'keyPoints']
        },
        conceptualApplication: {
          type: Type.OBJECT,
          description: 'Conceptual Application Question asking how a key concept applies to a real-world scenario.',
          properties: {
            question: { type: Type.STRING },
            conceptApplied: {
              type: Type.STRING,
              description: 'The specific concept being applied.'
            },
            realWorldScenario: {
              type: Type.STRING,
              description: 'Brief description of the realistic scenario or context.'
            },
            sampleAnalysis: {
              type: Type.STRING,
              description: 'Model analytical response explaining how the concept functions in this scenario.'
            }
          },
          required: ['question', 'conceptApplied', 'realWorldScenario', 'sampleAnalysis']
        }
      },
      required: ['mcq', 'shortAnswer', 'conceptualApplication']
    },
    flashcards: {
      type: Type.ARRAY,
      description: 'Clean array of between 5 and 10 flashcards with key terms/questions and definitions/answers.',
      items: {
        type: Type.OBJECT,
        properties: {
          front: {
            type: Type.STRING,
            description: 'Term or Question'
          },
          back: {
            type: Type.STRING,
            description: 'Definition or Answer'
          }
        },
        required: ['front', 'back']
      }
    }
  },
  required: ['title', 'summaryOverview', 'keyConcepts', 'practiceQuestions', 'flashcards']
};

app.post('/api/study-kit/generate', async (req: Request, res: Response) => {
  try {
    const { text, image, difficulty = 'medium' } = req.body;

    if (!text && !image) {
      return res.status(400).json({
        error: 'Please provide study material text, notes, or an uploaded document image.'
      });
    }

    const apiKey = getApiKey();
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const validatedDifficulty = ['easy', 'medium', 'hard'].includes(difficulty)
      ? difficulty
      : 'medium';

    const systemInstruction = `You are an expert academic tutor and exam preparation assistant. Your goal is to transform raw study materials (text, notes, or uploaded document images) into an actionable, structured study kit.

Always structure your response using the following layout:
1. Key Concepts & Summaries:
- Extract 3–5 core concepts from the provided material.
- Explain each concept in 2–3 concise sentences using plain, easy-to-understand language.

2. Practice Exam Questions:
Generate 3 distinct questions based strictly on the source material:
- Multiple Choice Question (MCQ): Provide 4 options and mark the correct answer with a brief explanation.
- Short Answer Question: Provide a sample high-scoring answer.
- Conceptual Application Question: Ask how a key concept applies to a real-world scenario.

3. Flashcard Set (JSON Format):
Format the key terms as a clean JSON array with 5 to 10 flashcards:
[
  {
    "front": "Term or Question",
    "back": "Definition or Answer"
  }
]

Constraints:
1. Create the questions from the uploaded material only. Do not reference the internet or search for more information.
2. Do not hallucinate concepts. If the concept is not available in the material, do not include it in the final quiz.
3. Ensure the total number of flashcards is strictly between five and ten (5 <= count <= 10).
4. Difficulty Level: Set to "${validatedDifficulty}".
   - "easy": Focus on direct recall, primary definitions, foundational concepts, straightforward multiple choice with distinct options, clear-cut short answers.
   - "medium": Moderate depth, requiring synthesis of two related concepts from the text, plausible distractors for MCQ, thoughtful short answer.
   - "hard": Deep conceptual nuance, higher-order reasoning testing subtleties, edge cases mentioned in the source material, rigorous MCQ distractors that test common student misconceptions, detailed sample answer.
5. Keep token consumption low and concise (well under 30K tokens).`;

    const parts: any[] = [];

    if (image && image.data) {
      // Clean base64 data prefix if present (e.g. data:image/png;base64,...)
      let base64Data = image.data;
      let mimeType = image.mimeType || 'image/jpeg';
      if (base64Data.includes(',')) {
        const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          base64Data = matches[2];
        } else {
          base64Data = base64Data.split(',')[1];
        }
      }

      parts.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      });
    }

    let userPromptText = `Please parse the attached study material and generate the complete study kit according to all instructions and constraints. Difficulty target: ${validatedDifficulty}.`;
    if (text && text.trim().length > 0) {
      userPromptText += `\n\nStudy Material Text:\n"""\n${text.trim()}\n"""`;
    }

    parts.push({ text: userPromptText });

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
    let parsedKit: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            systemInstruction,
            temperature: 0.2, // low temperature for fidelity and non-hallucination
            responseMimeType: 'application/json',
            responseSchema: studyKitSchema
          }
        });

        const responseText = response.text;
        if (responseText) {
          parsedKit = JSON.parse(responseText);
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed, trying next candidate if transient:`, err?.message || err);
        lastError = err;
        // Wait 1 second before attempting next model if it was 503 or rate limit
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!parsedKit) {
      throw lastError || new Error('No content could be generated by the AI models.');
    }

    // Enforce flashcard length bounds [5, 10]
    if (Array.isArray(parsedKit.flashcards)) {
      if (parsedKit.flashcards.length > 10) {
        parsedKit.flashcards = parsedKit.flashcards.slice(0, 10);
      }
    }

    // Attach metadata
    const result = {
      ...parsedKit,
      difficulty: validatedDifficulty,
      generatedAt: new Date().toISOString()
    };

    return res.json(result);
  } catch (error: any) {
    console.error('Study Kit Generation Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate study kit from the provided material.'
    });
  }
});

// Full-stack Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`StudyKit AI Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});
