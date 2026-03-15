export const PLAN_TEMPLATE = {
  overview: {
    duration: "30 days",
    approach: "Progressive overload with habit stacking",
  },
  
  weeks: [
    {
      weekNumber: 1,
      theme: "Foundation & Form",
      intensity: "Low-Medium",
      focus: "Learning proper form, building consistency, establishing baseline habits",
      dailyStructure: {
        morning: "Light stretching or mobility work (10 min)",
        workout: "Bodyweight fundamentals: push-ups, squats, planks (20-30 min)",
        nutrition: "Track meals, aim for 3 balanced meals, hydrate (8 glasses water)",
        evening: "Skincare routine, reflection (5 min)",
      }
    },
    {
      weekNumber: 2,
      theme: "Building Momentum",
      intensity: "Medium",
      focus: "Increase volume, maintain consistency, add progressive overload",
      dailyStructure: {
        morning: "Dynamic stretching (10 min)",
        workout: "Increase reps by 20%, add variations (30-40 min)",
        nutrition: "Meal prep 2 days ahead, protein focus, reduce processed foods",
        evening: "Grooming routine, gratitude journaling (5 min)",
      }
    },
    {
      weekNumber: 3,
      theme: "Peak Challenge",
      intensity: "High",
      focus: "Push limits, test endurance, mental toughness training",
      dailyStructure: {
        morning: "Light cardio or HIIT (15 min)",
        workout: "Max effort sets, complex movements, supersets (40-50 min)",
        nutrition: "Strict adherence, track macros, optimize timing",
        evening: "Full self-care routine, visualization (10 min)",
      }
    },
    {
      weekNumber: 4,
      theme: "Consolidation & Mastery",
      intensity: "Medium-High",
      focus: "Solidify gains, assess transformation, build sustainable habits",
      dailyStructure: {
        morning: "Yoga or stretching (15 min)",
        workout: "Maintain intensity, perfect form, consistency (40 min)",
        nutrition: "Intuitive eating with discipline, 90/10 rule",
        evening: "Reflect on 30-day journey, plan next phase (10 min)",
      }
    }
  ],
  
  nutritionGuidelines: {
    general: [
      "Prioritize whole foods: lean proteins, vegetables, complex carbs",
      "Hydration: minimum 8 glasses of water daily",
      "Meal timing: eat within 1 hour of waking, don't skip breakfast",
      "Snacks: nuts, fruits, Greek yogurt",
      "Avoid: processed foods, excessive sugar, alcohol (limit to 1x/week)"
    ]
  },
  
  groomingBaseline: {
    skincare: [
      "Morning: cleanser, moisturizer, SPF",
      "Evening: cleanser, toner, night cream",
      "Weekly: exfoliate 2x, face mask 1x"
    ],
    haircare: [
      "Shampoo 2-3x per week (not daily)",
      "Condition after every wash",
      "Weekly deep conditioning treatment"
    ]
  }
}