export interface Questionnaire {
    title: string;
    questionnaireInfo: string;
    questions: [
        {
            question: string | undefined;
            answerType: string | undefined;
            answers: string[] | undefined;
            userAnswer: string[] | boolean | undefined;
        },
    ];
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
