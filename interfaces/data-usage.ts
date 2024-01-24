export enum QuestionType {
    TEXT = 'Text',
    CHECKBOX = 'Checkbox',
    RADIO = 'Radio Button',
    DROPDOWN = 'Dropdown',
}

export interface QuestionAnswer {
    id: string;
    text: string;
    option?: QuestionOption;
    question?: Question;
    userId: string;
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
