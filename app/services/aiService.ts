/**
 * AI Service — Dual-Provider Fallback Plan Generation
 * Groq (primary) → NVIDIA NIM (fallback) → Template (always works)
 *
 * Architecture:
 *   1. Try Groq (fastest, 30 req/min free)
 *   2. Fall back to NVIDIA NIM (1000+ free credits)
 *   3. If both fail, return template-only plan (always succeeds)
 */

import { PLAN_TEMPLATE } from '@/app/lib/planTemplate'
import { UserProfile, ExtractedHabit } from '../types'

// ─── Provider Configuration ───────────────────────────────────────────────

interface AIProvider {
  name: string
  url: string
  model: string
  apiKey: string | undefined
}

const AI_PROVIDERS: AIProvider[] = [
  {
    name: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.1-70b-versatile',
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  },
  {
    name: 'NVIDIA NIM',
    url: 'https://integrate.api.nvidia.com/v1/chat/completions',
    model: 'meta/llama-3.1-70b-instruct',
    apiKey: process.env.NEXT_PUBLIC_NVIDIA_API_KEY,
  },
]

// ─── Core API Call ─────────────────────────────────────────────────────────

async function callAI(provider: AIProvider, prompt: string): Promise<string> {
  if (!provider.apiKey) {
    throw new Error(`${provider.name} API key not configured`)
  }

  console.log(`[AI] Trying ${provider.name}...`)

  try {
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: 'You are a fitness and transformation coach. Provide concise, actionable advice. Be direct and specific.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[AI] ${provider.name} error:`, response.status, errorText)
      throw new Error(`${provider.name} API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    if (!text || text.length < 50) {
      throw new Error(`${provider.name} returned empty/short response`)
    }

    console.log(`[AI] ✅ ${provider.name} succeeded`)
    return text

  } catch (error: any) {
    console.error(`[AI] ❌ ${provider.name} failed:`, error.message)
    throw error
  }
}

// ─── Provider Fallback Chain ──────────────────────────────────────────────

async function tryAllProviders(prompt: string): Promise<string> {
  for (const provider of AI_PROVIDERS) {
    if (!provider.apiKey) {
      console.log(`[AI] Skipping ${provider.name} (no API key)`)
      continue
    }

    try {
      const result = await callAI(provider, prompt)
      if (result && result.length > 100) {
        return result
      }
    } catch (error) {
      // Continue to next provider
      continue
    }
  }

  // All providers failed
  throw new Error('All AI providers failed')
}

// ─── Template Builder ─────────────────────────────────────────────────────

function buildTemplatePlan(profile: UserProfile, personalization?: string): string {
  const intro = personalization
    ? personalization
    : `Welcome to your personalized transformation journey! This plan is designed for ${profile.activityLevel} fitness level with ${profile.equipment} equipment access.`

  return `# YOUR 30-DAY TRANSFORMATION PLAN

${intro}

---

## PROGRAM OVERVIEW
**Duration:** ${PLAN_TEMPLATE.overview.duration}
**Approach:** ${PLAN_TEMPLATE.overview.approach}

${PLAN_TEMPLATE.weeks.map(week => `
## WEEK ${week.weekNumber}: ${week.theme}
**Intensity:** ${week.intensity}
**Focus:** ${week.focus}

### Daily Structure:
- **Morning:** ${week.dailyStructure.morning}
- **Workout:** ${week.dailyStructure.workout}
- **Nutrition:** ${week.dailyStructure.nutrition}
- **Evening:** ${week.dailyStructure.evening}
`).join('\n')}

## NUTRITION GUIDELINES
${PLAN_TEMPLATE.nutritionGuidelines.general.map(g => `- ${g}`).join('\n')}

## GROOMING ROUTINE

### Skincare:
${PLAN_TEMPLATE.groomingBaseline.skincare.map(s => `- ${s}`).join('\n')}

### Hair Care:
${PLAN_TEMPLATE.groomingBaseline.haircare.map(h => `- ${h}`).join('\n')}

---

**Remember:** Consistency compounds. Show up daily. 💪
`
}

// ─── Plan Generation ───────────────────────────────────────────────────────

export async function generateSelfImprovementPlan(profile: UserProfile): Promise<string> {
  console.log('[Plan Generation] Starting with Groq + NVIDIA NIM fallback...')

  const personalizationPrompt = `User profile:
- Age: ${profile.age}
- Height: ${profile.height}
- Weight: ${profile.weight || 'Not provided'}
- Fitness level: ${profile.activityLevel}
- Equipment: ${profile.equipment}
- Face shape: ${profile.faceShape}
- Hair type: ${profile.hairTexture}
- Dietary restrictions: ${profile.dietaryRestrictions || 'None'}

Provide ONLY the following (be concise, 150 words total):

1. INTRO (2-3 sentences):
Write a motivational opening that addresses their ${profile.activityLevel} fitness level and ${profile.equipment} equipment situation.

2. EXERCISE SWAPS (3 bullet points):
Based on ${profile.equipment}, suggest 3 specific exercise substitutions.
Format: "- Instead of X, do Y"

3. FACE SHAPE TIPS (2 bullet points):
For ${profile.faceShape} face shape, suggest hairstyle and facial hair recommendations.
Format: "- [specific tip]"

4. HAIR CARE TIP (1 sentence):
One specific tip for ${profile.hairTexture} hair texture.

Output format:
INTRO:
[your intro here]

EXERCISE SWAPS:
- [swap 1]
- [swap 2]
- [swap 3]

FACE SHAPE TIPS:
- [tip 1]
- [tip 2]

HAIR CARE:
[one sentence tip]

Keep it concise and actionable. No fluff.`

  try {
    // Try Groq → NVIDIA NIM → Template
    const personalization = await tryAllProviders(personalizationPrompt)

    // Build final plan with AI personalization
    return buildTemplatePlan(profile, personalization)

  } catch (error: any) {
    console.error('[Plan Generation] All AI providers failed, using template fallback')

    // Template-only fallback (always works)
    return buildTemplatePlan(profile)
  }
}

// ─── Habit Extraction ──────────────────────────────────────────────────────

const FALLBACK_HABITS: ExtractedHabit[] = [
  { name: "Morning Movement", description: "Start day with 10 min activity" },
  { name: "Nutrition Tracking", description: "Log all meals and water" },
  { name: "Daily Workout", description: "Complete your workout routine" },
  { name: "Evening Routine", description: "Skincare and grooming" },
  { name: "Daily Reflection", description: "5 min journaling or meditation" },
]

export async function extractHabitsFromPlan(planContent: string): Promise<ExtractedHabit[]> {
  const prompt = `From this fitness plan, extract exactly 5 daily trackable habits.

Plan content:
${planContent.substring(0, 5000)}

Return ONLY valid JSON with NO markdown formatting, NO backticks, NO "\`\`\`json" wrapper.

Required format (copy this structure exactly):
{"habits":[{"name":"Morning Movement","description":"10 min stretching"},{"name":"Nutrition Tracking","description":"Log meals and water"},{"name":"Daily Workout","description":"Complete workout routine"},{"name":"Evening Routine","description":"Skincare and grooming"},{"name":"Reflection","description":"5 min journaling"}]}

Make habits specific and actionable. Output ONLY the JSON, nothing else.`

  try {
    const response = await tryAllProviders(prompt)

    // Clean response (remove markdown if present)
    const cleaned = response
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    console.log('[Habits] Raw response:', cleaned)

    const parsed = JSON.parse(cleaned)

    if (parsed.habits && Array.isArray(parsed.habits)) {
      const habits: ExtractedHabit[] = parsed.habits.slice(0, 5)
      console.log('[Habits] ✅ Extracted', habits.length, 'habits')
      // Pad to exactly 5 if model returned fewer
      while (habits.length < 5) habits.push(FALLBACK_HABITS[habits.length])
      return habits
    }

    throw new Error('Invalid habits format')

  } catch (error) {
    console.error('[Habits] Extraction failed:', error)

    // Fallback habits if AI fails
    return [...FALLBACK_HABITS]
  }
}

// ─── Backwards Compatibility ───────────────────────────────────────────────

export async function regenerateSelfImprovementPlan(profile: UserProfile): Promise<string> {
  return await generateSelfImprovementPlan(profile)
}

export async function refinePlanWithImage(
  profile: UserProfile,
  currentPlan: string,
  base64Image: string,
  mimeType: string,
): Promise<string> {
  return currentPlan // Not implemented — return plan as-is
}

export async function generateCoachAudio(planText: string): Promise<string | null> {
  return null // Not implemented
}
