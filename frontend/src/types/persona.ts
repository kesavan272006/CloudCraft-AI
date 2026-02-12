// Persona Engine Types

export interface PersonaInfo {
    id: string
    name: string
    description: string
    age_range: string
    platforms: string[]
}

export interface PersonaVariant {
    persona_id: string
    persona_name: string
    content: string
    platform_suggestion: string
    tone_used: string
}

export interface PersonaRequest {
    content: string
    personas: string[]
}

export interface PersonaResponse {
    original_content: string
    variants: PersonaVariant[]
    status: string
}
