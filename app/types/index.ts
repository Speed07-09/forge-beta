// ─── User Profile Types ────────────────────────────────────────────────────

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

// ─── Plan Types ────────────────────────────────────────────────────────────

export interface SavedPlan {
    id: string;
    timestamp: number;
    profile: UserProfile;
    content: string;
}

/** Matches the `plans` table row returned from Supabase. */
export interface SupabasePlan {
    id: string;
    user_id: string;
    content: string;
    profile_data: UserProfile;
    created_at: string;
}

export interface FeedbackItem {
    id: string;
    timestamp: number;
    type: 'issue' | 'suggestion';
    message: string;
}

// ─── Habit Types ───────────────────────────────────────────────────────────

export interface ExtractedHabit {
    name: string;
    description: string;
}

export interface SupabaseHabit {
    id: string;
    user_id: string;
    plan_id: string;
    habit_name: string;
    habit_description: string;
    is_custom: boolean;
    created_at: string;
}

export interface Habit extends SupabaseHabit { }

export interface HabitCompletion {
    id: string;
    habit_id: string;
    user_id: string;
    completed_date: string; // YYYY-MM-DD format
    created_at: string;
}
