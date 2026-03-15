import { PLAN_TEMPLATE } from '@/app/lib/planTemplate'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'

interface UserProfile {
  faceShape: string
  activityLevel: string
  equipmentAccess: string
  hairTexture: string
  age?: number
  goals?: string
}

async function callDeepSeek(prompt: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY
  
  console.log('[DeepSeek] API Key exists:', !!apiKey)
  
  if (!apiKey) {
    throw new Error('DeepSeek API key not found in environment variables')
  }
  
  try {
    console.log('[DeepSeek] Calling API...')
    
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
        max_tokens: 1000,
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[DeepSeek] API Error:', response.status, errorText)
      throw new Error(`DeepSeek API error: ${response.status}`)
    }
    
    const data = await response.json()
    const text = data.choices[0]?.message?.content || ''
    
    console.log('[DeepSeek] ✅ Success')
    return text
    
  } catch (error: any) {
    console.error('[DeepSeek] Error:', error.message)
    throw error
  }
}

export async function generateSelfImprovementPlan(userProfile: UserProfile): Promise<string> {
  console.log('[Hybrid] Generating plan...')
  
  const personalizationPrompt = `User profile:
- Fitness level: ${userProfile.activityLevel}
- Equipment: ${userProfile.equipmentAccess}
- Face shape: ${userProfile.faceShape}
- Hair type: ${userProfile.hairTexture}

Provide ONLY the following (be concise, 150 words total):

1. INTRO (2-3 sentences):
Write a motivational opening that addresses their ${userProfile.activityLevel} fitness level and ${userProfile.equipmentAccess} equipment situation.

2. EXERCISE SWAPS (3 bullet points):
Based on ${userProfile.equipmentAccess}, suggest 3 specific exercise substitutions.
Format: "- Instead of X, do Y"

3. FACE SHAPE TIPS (2 bullet points):
For ${userProfile.faceShape} face shape, suggest hairstyle and facial hair recommendations.
Format: "- [specific tip]"

4. HAIR CARE TIP (1 sentence):
One specific tip for ${userProfile.hairTexture} hair texture.

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
    const personalization = await callDeepSeek(personalizationPrompt)
    
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
    
    // Fallback
    return `# YOUR 30-DAY TRANSFORMATION PLAN

Here's your personalized plan.

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

export async function extractHabitsFromPlan(planContent: string): Promise<Array<{name: string, description: string}>> {
  const prompt = `From this fitness plan, extract exactly 5 daily trackable habits.

Return ONLY valid JSON with NO markdown formatting, NO backticks, NO "\`\`\`json" wrapper.

Required format:
{"habits":[{"name":"Morning Movement","description":"10 min stretching"},{"name":"Nutrition Tracking","description":"Log meals and water"},{"name":"Daily Workout","description":"Complete workout routine"},{"name":"Evening Routine","description":"Skincare and grooming"},{"name":"Reflection","description":"5 min journaling"}]}

Make habits specific and actionable. Output ONLY the JSON.`
  
  try {
    const response = await callDeepSeek(prompt)
    const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    
    if (parsed.habits && Array.isArray(parsed.habits)) {
      return parsed.habits.slice(0, 5)
    }
    
    throw new Error('Invalid format')
    
  } catch (error) {
    console.error('[Habits] Extraction failed, using fallback')
    
    return [
      { name: "Morning Movement", description: "Start day with 10 min activity" },
      { name: "Nutrition Tracking", description: "Log all meals and water" },
      { name: "Daily Workout", description: "Complete your workout routine" },
      { name: "Evening Routine", description: "Skincare and grooming" },
      { name: "Daily Reflection", description: "5 min journaling" }
    ]
  }
}

export async function regenerateSelfImprovementPlan(userProfile: UserProfile, feedback: string): Promise<string> {
  return await generateSelfImprovementPlan(userProfile)
}

export async function refinePlanWithImage(plan: string, imageBase64: string): Promise<string> {
  return plan
}

export async function generateCoachAudio(text: string): Promise<any> {
  return null
}