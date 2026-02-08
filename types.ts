
export type ActivityLevel = 'Low' | 'Medium' | 'High';
export type FaceShape = 'Round' | 'Oval' | 'Square' | 'Unsure';
export type HairTexture = '4C' | '4B' | '4A' | 'Mixed' | 'Unsure';
export type EquipmentAccess = 'None' | 'Home Basics' | 'Full Gym';

export interface UserProfile {
  age: string;
  height: string;
  weight?: string;
  activityLevel: ActivityLevel;
  faceShape: FaceShape;
  hairTexture: HairTexture;
  equipment: EquipmentAccess;
  dietaryRestrictions: string;
}

export interface SavedPlan {
  id: string;
  timestamp: number;
  profile: UserProfile;
  content: string;
}

export interface FeedbackItem {
  id: string;
  timestamp: number;
  type: 'issue' | 'suggestion';
  message: string;
}

export interface PlanResponse {
  title: string;
  summary: string;
  workoutPlan: string;
  nutritionGuide: string;
  groomingAdvice: string;
  dailyHabits: string;
  encouragement: string;
}
