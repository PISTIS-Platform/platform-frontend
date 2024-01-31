export enum QuestionType {
    TEXT = 'Text',
    CHECKBOX = 'Checkbox',
    RADIO = 'Radio',
}

export interface SelectedOption {
    id: string;
    label: string;
    value: string;
    isSelected: boolean;
}

export interface QuestionAnswer {
    id: string;
    text?: string;
    questionType: QuestionType | string | undefined;
    availableOptions?: QuestionOption[];
    selectedOptions?: SelectedOption[];
    question?: Question;
    isValid?: boolean | undefined;
}

export interface QuestionOption {
    id: string;
    text?: string;
    description?: string;
}

export type QuestionOptionBody = Omit<QuestionOption, 'id'>;

export interface Question {
    id?: string;
    type: QuestionType | string | undefined;
    title: string | undefined;
    description?: string | undefined;
    options?: QuestionOption[] | undefined;
    answers?: QuestionAnswer[] | undefined;
    is_required?: boolean | undefined;
    isValid?: boolean | undefined;
}

export interface QuestionBody {
    type: QuestionType | string | undefined;
    title?: string;
    description?: string | undefined;
    is_required?: boolean;
    options?: QuestionOptionBody[];
}

export interface Questionnaire {
    id: string;
    creatorId: string;
    versions?: QuestionnaireVersion[];
    is_for_verified_buyers: boolean;
    isNew: boolean;
}

export interface QuestionnaireVersion {
    id: string;
    questionnaireId: string;
    title: string;
    description?: string;
    is_active: boolean;
    publicationDate?: string | null;
    createdAt?: string;
    questions: Question[];
    isNew: boolean;
}

export interface QuestionnaireBody {
    title: string;
    description?: string;
    creatorId?: string;
    is_for_verified_buyers?: boolean;
    is_active: boolean;
    questions: QuestionBody[];
}

export interface DashboardData {
    labels: string[] | undefined;
    datasets: [
        {
            label: string | undefined;
            backgroundColor: string | undefined;
            data: number[] | undefined;
        },
    ];
}

export interface DashboardOptions {
    responsive: boolean | undefined;
    maintainAspectRatio: boolean | undefined;
}
