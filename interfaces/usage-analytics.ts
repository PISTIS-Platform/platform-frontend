export enum QuestionType {
    TEXT = 'Text',
    CHECKBOX = 'Checkbox',
    RADIO = 'Radio Button',
}

export const MAX_CHARACTERS_TEXT_LIMIT = 255;

export interface SelectedOption {
    id: string;
    value: string;
    isSelected: boolean;
}

export interface QuestionAnswer {
    id: string;
    text?: string;
    questionType: QuestionType | string | undefined;
    availableOptions?: SelectedOption[];
    selectedOptions?: SelectedOption[];
    question?: Question;
    isValid?: boolean | undefined;
}

export interface QuestionOption {
    id?: string;
    text?: string;
    description?: string;
}

export interface Question {
    id?: string;
    type: QuestionType | string;
    title: string;
    description?: string;
    options?: QuestionOption[];
    isOptional?: boolean;
    isRequired?: boolean;
    isValid?: boolean;
}

export interface Questionnaire {
    id: string;
    version: number | string | null;
    title: string;
    description?: string;
    creatorId?: string;
    isForVerifiedBuyers?: boolean;
    isActive: boolean;
    publicationDate?: string | null;
    questions: Question[];
}

export interface QuestionResponse {
    questionId: string;
    questionTitle: string;
    responses: { response: string; date: string }[];
    questionType?: QuestionType | null;
    options?: string[];
}
