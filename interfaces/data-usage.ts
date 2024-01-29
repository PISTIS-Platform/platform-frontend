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
    userId: string;
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
    allowMultipleSelect?: boolean | undefined;
    is_required?: boolean | undefined;
    isValid?: boolean | undefined;
}

export interface QuestionBody {
    type: QuestionType | string | undefined;
    title?: string;
    description?: string | undefined;
    options?: QuestionOptionBody[];
}

export interface QuestionnaireVersion {
    id: string;
    questionnaireId: string;
    createdAt: string;
    questions: Question[];
}

export interface Questionnaire {
    id: string;
    title: string;
    description?: string;
    creatorId: string;
    assetId?: string | null;
    is_published: boolean;
    is_public: boolean;
    versions?: QuestionnaireVersion[];
    questions: Question[];
    isNew: boolean;
}

export interface QuestionnaireBody {
    title: string;
    description?: string;
    creatorId: string;
    assetId?: string | null;
    is_published: boolean;
    is_public: boolean;
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
