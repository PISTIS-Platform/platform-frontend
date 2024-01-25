export enum QuestionType {
    TEXT = 'Text',
    CHECKBOX = 'Checkbox',
    RADIO = 'Radio',
    DROPDOWN = 'Dropdown',
}

export interface SelectedOption {
    id: string;
    text: string;
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
    id?: string;
    text?: string;
    description?: string;
}

export interface Question {
    id?: string;
    type: QuestionType | string | undefined;
    title: string | undefined;
    description?: string | undefined;
    options?: QuestionOption[] | undefined;
    answers?: QuestionAnswer[] | undefined;
    allowMultipleSelect?: boolean | undefined;
    isValid?: boolean | undefined;
}

export interface Questionnaire {
    title: string;
    description?: string;
    creatorId: string;
    assetId: string;
    questions: Question[];
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
