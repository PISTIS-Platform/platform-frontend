import { apiGet } from '~/server/routes/utils/query';

enum QuestionType {
    TEXT = 'Text',
    CHECKBOX = 'Checkbox',
    RADIO = 'Radio',
}

interface QuestionOption {
    id: string;
    text?: string;
    description?: string;
}

interface Question {
    id?: string;
    type: QuestionType | string | undefined;
    title: string | undefined;
    description: string | undefined;
    options?: QuestionOption[] | undefined;
    is_required?: boolean | undefined;
    isValid?: boolean | undefined;
}

interface QuestionnaireVersion {
    id: string;
    title: string;
    questionnaireId: string;
    description?: string;
    is_active: boolean;
    publicationDate?: string | null;
    createdAt?: string;
    questions: Question[];
    isNew: boolean;
}

export default defineEventHandler(async (event) => {
    const versionId = getRouterParam(event, 'versionId');

    const questionnaireVersion = (await apiGet(`questionnaire/version/${versionId}`)) as QuestionnaireVersion;

    const questions =
        (questionnaireVersion as QuestionnaireVersion).questions.map((question) => {
            return {
                id: question.id,
                title: question.title,
                description: question.description,
                type: question.type,
                isValid: true,
                is_required: question.is_required,
                options: question.options?.map((option: QuestionOption) => {
                    return {
                        id: option.id,
                        text: option.text,
                        description: option.description,
                    };
                }),
            };
        }) || [];

    const transformedQuestionnaireVersion: QuestionnaireVersion = {
        id: questionnaireVersion.id,
        questionnaireId: questionnaireVersion.questionnaireId,
        title: questionnaireVersion.title,
        description: questionnaireVersion.description,
        publicationDate: questionnaireVersion.publicationDate,
        is_active: questionnaireVersion.is_active,
        questions,
        isNew: false,
    };

    return transformedQuestionnaireVersion;
});
