/**
 * Gemini Service — Next.js 14 Migration
 * Handles all AI-powered plan generation via @google/genai
 *
 * Key Rotation:
 *   Set NEXT_PUBLIC_GEMINI_API_KEY_1 … _4 in .env.local.
 *   On a 429 / quota error the service automatically retries with the next key.
 *   Non-quota errors (validation, network, etc.) fail immediately.
 */

import { GoogleGenAI, Modality } from '@google/genai';
import { UserProfile, ExtractedHabit } from '../types';

// ─── API Key Pool ──────────────────────────────────────────────────────────

const GEMINI_API_KEYS = [
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_1,
].filter(Boolean)
// Legacy single-key fallback so existing deployments keep working


const GEMINI_MODEL = 'gemini-2.0-flash'; // Same model for all keys

console.log(`[Gemini] ${GEMINI_API_KEYS.length} API key(s) available for rotation.`);

// ─── Key Rotation Helpers ──────────────────────────────────────────────────

function isQuotaError(error: unknown): boolean {
    const msg = (error as { message?: string })?.message ?? '';
    return (
        msg.includes('429') ||
        msg.toLowerCase().includes('quota') ||
        msg.includes('RESOURCE_EXHAUSTED')
    );
}

/**
 * Run `fn(ai)` cycling through every available key on quota/rate-limit errors.
 * Fails immediately on non-quota errors so callers get real error messages.
 */
async function withKeyRotation<T>(
    fn: (ai: GoogleGenAI, keyIndex: number) => Promise<T>,
): Promise<T> {
    if (GEMINI_API_KEYS.length === 0) {
        throw new Error(
            'No Gemini API keys configured. ' +
            'Add NEXT_PUBLIC_GEMINI_API_KEY_1 (and optionally _2/_3/_4) to .env.local.',
        );
    }

    let lastError: unknown = null;

    for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
        const key = GEMINI_API_KEYS[i];
        const keyLabel = `key ${i + 1}/${GEMINI_API_KEYS.length}`;

        try {
            console.log(`[Gemini] Trying ${keyLabel}…`);
            const ai = new GoogleGenAI({ apiKey: key });
            const result = await fn(ai, i);
            console.log(`[Gemini] ✓ Success with ${keyLabel}`);
            return result;
        } catch (error: unknown) {
            const msg = (error as { message?: string })?.message ?? String(error);
            console.warn(`[Gemini] ✗ ${keyLabel} failed: ${msg}`);
            lastError = error;

            if (isQuotaError(error) && i < GEMINI_API_KEYS.length - 1) {
                console.log(`[Gemini] Rate limit hit — trying next key…`);
                continue;
            }

            // Non-quota error or last key — fail immediately
            if (!isQuotaError(error)) {
                throw error;
            }
        }
    }

    // Every key exhausted
    const lastMsg = (lastError as { message?: string })?.message ?? String(lastError);
    throw new Error(
        `All ${GEMINI_API_KEYS.length} Gemini API key(s) have hit their rate limits. ` +
        `Please try again later or add more keys via NEXT_PUBLIC_GEMINI_API_KEY_2/_3/_4. ` +
        `Last error: ${lastMsg}`,
    );
}

// ─── Prompts ───────────────────────────────────────────────────────────────

const getSystemInstruction = (): string => `
  Act as a professional, supportive personal development mentor for a Black teenage boy.
  
  STRICT SAFETY & ETHICAL BOUNDARIES (NON-NEGOTIABLE):
  1. PRIORITY: Confidence, consistency, and mental wellbeing are the primary goals. Appearance is a byproduct of health, not an obsession.
  2. NO EXTREME ADVICE: No "looks-maxing" trends that involve pain, extreme dieting, or surgical concepts.
  3. NO SUBSTANCES: Do not mention or recommend steroids, SARMs, protein powders, creatine, pre-workouts, or any supplements. Focus ONLY on whole, affordable foods.
  4. NO MEDICAL ADVICE: Do not give medical diagnoses or treatment plans.
  5. REDIRECTION: If any input indicates self-harm, severe distress, or eating disorders, ignore the standard output and ONLY provide a kind, supportive message encouraging the user to speak to a trusted adult or professional.

  Tone: Stoic, encouraging, firm but kind. "Big brother" or "Sports Coach" energy.
`;

const getUserPrompt = (profile: UserProfile, context: 'initial' | 'refinement' | 'regeneration' = 'initial'): string => `
  Generate a COMPLETE, SAFE, and age-appropriate 30-day self-improvement plan based on this profile:
  - Age: ${profile.age}
  - Height: ${profile.height}
  - Weight: ${profile.weight || 'Not provided'}
  - Activity Level: ${profile.activityLevel}
  - Face Shape: ${profile.faceShape}
  - Hair Texture: ${profile.hairTexture}
  - Equipment Access: ${profile.equipment}
  - Dietary Restrictions: ${profile.dietaryRestrictions || 'None'}

  OUTPUT FORMAT (Markdown):
  
  # [Personalized Title based on goals]

  ## Executive Summary
  (2-3 sentences on the focus for this month. Mention the user's specific context.)

  ## Section 1: Workout Protocol (Weeks 1-4)
  - Tailor strictly to: ${profile.equipment} and ${profile.activityLevel} level.
  - Provide a specific split (e.g., Full Body A/B or Upper/Lower).
  - List specific exercises with sets and reps.
  - Include explicit Rest Days.

  ## Section 2: Nutrition & Fuel
  - Simple, affordable whole foods available in most households.
  - No calorie counting. Focus on habits (e.g. "Drink water before every meal", "Eat a fruit with breakfast").
  - Respect ${profile.dietaryRestrictions}.

  ## Section 3: Grooming & Style
  - Specific haircut recommendation for ${profile.hairTexture} hair and ${profile.faceShape} face. Explain WHY.
  - Basic hygiene routine (Skin, Teeth, Nails).

  ## Section 4: Mindset & Discipline
  - 1 Morning Habit.
  - 1 Evening Habit.
  - 1 Daily Confidence Action (e.g., "posture check").

  ## Section 5: The Code
  - 3 simple, stoic rules to live by this month.

  ${context === 'refinement' ? 'IMPORTANT: Adjust the plan based on the new visual data provided (e.g., if posture is poor, add back exercises; if hair is different, update grooming).' : ''}
  ${context === 'regeneration' ? 'NOTE: The user wants a variation of the previous plan. Keep the core principles but adjust the specific exercises, meal examples, and habits for variety. Make it slightly more challenging if appropriate.' : ''}
`;

// ─── Exported Functions ────────────────────────────────────────────────────

/**
 * Generate an initial 30-day self-improvement plan for the given user profile.
 */
export async function generateSelfImprovementPlan(profile: UserProfile): Promise<string> {
    try {
        return await withKeyRotation(async (ai) => {
            const response = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: getUserPrompt(profile, 'initial'),
                config: {
                    systemInstruction: getSystemInstruction(),
                    temperature: 0.7,
                },
            });

            if (!response.text) throw new Error('No plan generated');
            return response.text;
        });
    } catch (error) {
        console.error('Error generating plan:', error);
        throw new Error('Failed to generate plan. Please try again.');
    }
}

/**
 * Regenerate the plan with variation, keeping the same user profile.
 */
export async function regenerateSelfImprovementPlan(profile: UserProfile): Promise<string> {
    try {
        return await withKeyRotation(async (ai) => {
            const response = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: getUserPrompt(profile, 'regeneration'),
                config: {
                    systemInstruction: getSystemInstruction(),
                    temperature: 0.9,
                },
            });

            if (!response.text) throw new Error('No plan generated');
            return response.text;
        });
    } catch (error) {
        console.error('Error regenerating plan:', error);
        throw new Error('Failed to regenerate plan. Please try again.');
    }
}

/**
 * Refine the existing plan using an uploaded image for visual context.
 */
export async function refinePlanWithImage(
    profile: UserProfile,
    currentPlan: string,
    base64Image: string,
    mimeType: string,
): Promise<string> {
    try {
        return await withKeyRotation(async (ai) => {
            const response = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: {
                    parts: [
                        {
                            inlineData: {
                                data: base64Image,
                                mimeType: mimeType,
                            },
                        },
                        {
                            text: `
              Here is the user's current profile: ${JSON.stringify(profile)}.
              Here is the plan I generated for them: 
              ${currentPlan}

              The user has uploaded a photo of themselves for more specific advice (e.g., posture, grooming, style).
              Analyze the image safely and respectfully. 
              1. Confirm if the face shape or hair texture matches the profile. If not, politely suggest corrections in the text.
              2. Check posture if visible (e.g., forward head, rounded shoulders).
              3. Update the "Grooming & Style" and "Workout Protocol" sections of the plan based on visual evidence.
              
              Return the COMPLETE updated plan in Markdown format, preserving the original structure.
              DO NOT comment on weight or body attractiveness. Focus on grooming, style, posture, and fit.
            `,
                        },
                    ],
                },
                config: {
                    systemInstruction: getSystemInstruction(),
                    temperature: 0.7,
                },
            });

            if (!response.text) throw new Error('Could not refine plan');
            return response.text;
        });
    } catch (error) {
        console.error('Error refining plan:', error);
        throw new Error('Failed to refine plan with image.');
    }
}

/**
 * Generate a motivational coach audio script and convert it to base64 PCM audio.
 * Returns base64-encoded raw PCM audio data (24 kHz, mono).
 * NOTE: Audio playback must happen in the browser (client component).
 *
 * Key rotation applies to the script-generation step.
 * The TTS step uses a dedicated model and also benefits from key rotation.
 */
export async function generateCoachAudio(planText: string): Promise<string> {
    try {
        // Step 1: Generate a spoken script from the plan (with key rotation)
        const script = await withKeyRotation(async (ai) => {
            const scriptResponse = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: `Convert the following self-improvement plan into a short, intense, but encouraging 45-second motivational audio script.
      Speak directly to the user as a coach. 
      Focus on the "Mindset" and "The Code" sections.
      End with a strong call to action.
      
      Plan Context: ${planText.substring(0, 3000)}... (truncated)`,
                config: {
                    systemInstruction: 'You are a motivational speaker/coach script writer.',
                },
            });

            return (
                scriptResponse.text ||
                'Stay consistent. Trust the process. You have the potential to change everything.'
            );
        });

        // Step 2: Convert script to speech (with key rotation)
        return await withKeyRotation(async (ai) => {
            const audioResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: {
                    parts: [{ text: script }],
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
                        },
                    },
                },
            });

            const base64Audio =
                audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error('No audio generated');
            return base64Audio;
        });
    } catch (error) {
        console.error('Error generating audio:', error);
        throw new Error('Failed to generate coach audio.');
    }
}

// ─── Habit Extraction ──────────────────────────────────────────────────────

const FALLBACK_HABITS: ExtractedHabit[] = [
    { name: 'Morning Exercise', description: '30 minutes of physical activity' },
    { name: 'Healthy Eating', description: 'Follow your nutrition plan' },
    { name: 'Drink Water', description: 'Stay hydrated – 8 glasses per day' },
    { name: 'Self-Care', description: 'Follow your grooming routine' },
    { name: 'Mindfulness', description: '5 minutes of evening reflection' },
];

function parseHabitsJson(raw: string): ExtractedHabit[] {
    // Strip markdown code fences that the model may add despite instructions
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const json = JSON.parse(cleaned) as { habits?: unknown };
    if (!json.habits || !Array.isArray(json.habits)) {
        throw new Error('Invalid JSON format: missing "habits" array.');
    }
    const habits = (json.habits as ExtractedHabit[]).slice(0, 5);
    if (habits.length === 0) throw new Error('No habits extracted.');
    // Pad to exactly 5 if model returned fewer
    while (habits.length < 5) habits.push(FALLBACK_HABITS[habits.length]);
    return habits;
}

/**
 * Extract exactly 5 trackable daily habits from a generated plan via a
 * separate Gemini API call.  Retries once on invalid JSON, then falls
 * back to five generic habits so the caller always gets a result.
 */
export async function extractHabitsFromPlan(
    planContent: string,
    _retry = false,
): Promise<ExtractedHabit[]> {
    const prompt = `Based on this 30-day self-improvement plan:

${planContent.substring(0, 5000)}

Extract exactly 5 daily habits the user should track. These should be:
- Specific and actionable
- Repeatable daily
- Directly from the plan content
- Mix of fitness, nutrition, grooming, and mindset

Return ONLY valid JSON with no markdown formatting:
{
  "habits": [
    {"name": "Morning Exercise", "description": "30 min workout as outlined in plan"},
    {"name": "Drink 8 Glasses Water", "description": "Stay hydrated throughout the day"},
    {"name": "Skin Care Routine", "description": "Follow morning and evening routine from plan"},
    {"name": "Meal Prep", "description": "Prepare healthy meals per nutrition guide"},
    {"name": "Evening Reflection", "description": "5 min journaling on daily progress"}
  ]
}`;

    try {
        const text = await withKeyRotation(async (ai) => {
            const response = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: prompt,
                config: {
                    systemInstruction: 'You are a JSON data extractor. Output ONLY valid JSON, no markdown.',
                    temperature: 0.2,
                },
            });

            if (!response.text) throw new Error('Empty response from Gemini.');
            return response.text;
        });

        return parseHabitsJson(text);
    } catch (error) {
        console.error('Habit extraction error:', error);
        if (!_retry) {
            console.log('Retrying habit extraction once…');
            return extractHabitsFromPlan(planContent, true);
        }
        console.warn('Both attempts failed – using fallback habits.');
        return [...FALLBACK_HABITS];
    }
}
