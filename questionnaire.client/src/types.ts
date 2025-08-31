export const QuestionType = {
    SingleChoice: 1,
    MultipleChoice: 2,
    Descriptive: 3
} as const;

export type QuestionType = typeof QuestionType[keyof typeof QuestionType];

export interface QuestionOption {
    id: number;
    text: string;
    order: number;
}

export interface Question {
    id: number;
    text: string;
    type: QuestionType;
    isRequired: boolean;
    order: number;
    options: QuestionOption[];
}

export interface Questionnaire {
    id: number;
    title: string;
    description?: string;
    createdAt: string;
    isActive: boolean;
    questions: Question[];
    responseCount?: number;
}

export interface CreateQuestionOption {
    text: string;
    order: number;
}

export interface CreateQuestion {
    text: string;
    type: QuestionType;
    isRequired: boolean;
    order: number;
    options: CreateQuestionOption[];
}

export interface CreateQuestionnaire {
    title: string;
    description?: string;
    questions: CreateQuestion[];
}

export interface QuestionResponse {
    questionId: number;
    textAnswer?: string;
    selectedOptionId?: number;
    selectedOptionIds: number[];
}

export interface SubmitResponse {
    questionnaireId: number;
    responses: QuestionResponse[];
}

export interface OptionResult {
    id: number;
    text: string;
    count: number;
    percentage: number;
}

export interface QuestionResult {
    id: number;
    text: string;
    type: QuestionType;
    isRequired: boolean;
    responseCount: number;
    options: OptionResult[];
    textAnswers: string[];
}

export interface QuestionnaireResult {
    id: number;
    title: string;
    description?: string;
    totalResponses: number;
    questions: QuestionResult[];
}

// Authentication types
export interface User {
    id: number;
    email: string;
    name: string;
    picture: string;
    isAdmin: boolean;
}

export interface LoginRequest {
    googleToken: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}
