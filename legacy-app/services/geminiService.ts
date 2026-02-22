import { GoogleGenAI, Modality } from "@google/genai";
import { UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = () => {
  return `
    Act as a professional, supportive personal development mentor for a Black teenage boy.
    
    STRICT SAFETY & ETHICAL BOUNDARIES (NON-NEGOTIABLE):
    1. PRIORITY: Confidence, consistency, and mental wellbeing are the primary goals. Appearance is a byproduct of health, not an obsession.
    2. NO EXTREME ADVICE: No "looks-maxing" trends that involve pain, extreme dieting, or surgical concepts.
    3. NO SUBSTANCES: Do not mention or recommend steroids, SARMs, protein powders, creatine, pre-workouts, or any supplements. Focus ONLY on whole, affordable foods.
    4. NO MEDICAL ADVICE: Do not give medical diagnoses or treatment plans.
    5. REDIRECTION: If any input indicates self-harm, severe distress, or eating disorders, ignore the standard output and ONLY provide a kind, supportive message encouraging the user to speak to a trusted adult or professional.

    Tone: Stoic, encouraging, firm but kind. "Big brother" or "Sports Coach" energy.
  `;
};

const getUserPrompt = (profile: UserProfile, context: string = 'initial') => {
  return `
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
  `;
};

export const generateSelfImprovementPlan = async (profile: UserProfile): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: getUserPrompt(profile),
      config: {
        systemInstruction: getSystemInstruction(),
        temperature: 0.7,
      }
    });

    if (!response.text) {
      throw new Error("No plan generated");
    }
    return response.text;
  } catch (error) {
    console.error("Error generating plan:", error);
    throw new Error("Failed to generate plan. Please try again.");
  }
};

export const regenerateSelfImprovementPlan = async (profile: UserProfile): Promise<string> => {
  try {
    const prompt = getUserPrompt(profile) + "\n\nNOTE: The user wants a variation of the previous plan. Keep the core principles but adjust the specific exercises, meal examples, and habits for variety. Make it slightly more challenging if appropriate.";
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(),
        temperature: 0.8,
      }
    });

    if (!response.text) {
      throw new Error("No plan generated");
    }
    return response.text;
  } catch (error) {
    console.error("Error regenerating plan:", error);
    throw new Error("Failed to regenerate plan.");
  }
};

export const refinePlanWithImage = async (profile: UserProfile, currentPlan: string, base64Image: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
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
            `
          }
        ]
      },
      config: {
        systemInstruction: getSystemInstruction(),
        temperature: 0.7
      }
    });

    if (!response.text) {
      throw new Error("Could not refine plan");
    }
    return response.text;

  } catch (error) {
    console.error("Error refining plan:", error);
    throw new Error("Failed to refine plan with image.");
  }
};

export const generateCoachAudio = async (planText: string): Promise<string> => {
  try {
    // 1. Generate a script first to ensure it sounds like audio
    const scriptResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Convert the following self-improvement plan into a short, intense, but encouraging 45-second motivational audio script.
      Speak directly to the user as a coach. 
      Focus on the "Mindset" and "The Code" sections.
      End with a strong call to action.
      
      Plan Context: ${planText.substring(0, 3000)}... (truncated)`,
      config: {
        systemInstruction: "You are a motivational speaker/coach script writer."
      }
    });

    const script = scriptResponse.text || "Stay consistent. Trust the process. You have the potential to change everything.";

    // 2. Convert script to speech
    const audioResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: {
        parts: [{ text: script }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }
          }
        }
      }
    });

    const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio generated");
    }
    return base64Audio;

  } catch (error) {
    console.error("Error generating audio:", error);
    throw new Error("Failed to generate coach audio.");
  }
};