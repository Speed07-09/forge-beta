/**
 * DeepSeek Service — Hybrid Plan Generation
 * 80% pre-built template + 20% AI personalization via DeepSeek V3
 *
 * Architecture:
 *   1. Load static plan template (fast, free, reliable)
 *   2. Call DeepSeek for lightweight personalization (~500-1000 tokens)
 *   3. Merge template + personalization into final plan
 *   4. Graceful fallback if AI fails (template-only plan)
 */

import { PLAN_TEMPLATE } from '@/app/lib/planTemplate'
import { UserProfile, ExtractedHabit } from '../types'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat' // DeepSeek V3

// ─── Core API Call ─────────────────────────────────────────────────────────

async function callDeepSeek(prompt: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY

  if (!apiKey) {
    throw new Error('DeepSeek API key not found in environment variables')
  }

  try {
    console.log('[DeepSeek] Calling API for personalization...')

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
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
        max_tokens: 1000, // Keep it small — we only need personalization snippets
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[DeepSeek] API Error:', response.status, errorText)
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.choices[0]?.message?.content || ''

    console.log('[DeepSeek] ✅ Personalization successful')
    return text

  } catch (error: any) {
    console.error('[DeepSeek] Error:', error.message)
    throw error
  }
}

// ─── Plan Generation ───────────────────────────────────────────────────────

export async function generateSelfImprovementPlan(profile: UserProfile): Promise<string> {
  console.log('[Hybrid] Generating plan with template + DeepSeek personalization')

  // Create VERY explicit prompt for DeepSeek
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
    // Get AI personalization
    const personalization = await callDeepSeek(personalizationPrompt)

    // Build final plan: template + personalization
    const finalPlan = `# YOUR 30-DAY TRANSFORMATION PLAN

${personalization}

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

**Remember:** Consistency compounds. Show up daily. You've got this. 💪
`

    return finalPlan

  } catch (error: any) {
    console.error('[Plan Generation] Error:', error.message)

    // Fallback: return template without personalization if AI fails
    console.warn('[Plan Generation] Returning template-only plan (AI failed)')
    return `# YOUR 30-DAY TRANSFORMATION PLAN

Here's your personalized plan based on ${profile.activityLevel} fitness level.

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
`
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
    const response = await callDeepSeek(prompt)

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
