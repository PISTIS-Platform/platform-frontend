import { Dataset, Report, tableRow } from '~/interfaces/dataset-preview';

export function formatPreview(dataset: Dataset): tableRow[] {
    const columns: string[] = Object.keys(dataset);
    const previewSize: number = dataset[columns[0]].length;

    const rows = [];

    for (let i = 0; i < previewSize; i++) {
        const row: tableRow = {};

        columns.forEach((column: string) => {
            row[column] = dataset[column][i];
        });

        rows.push(row);
    }

    return rows;
}

export function getSensitiveColumns(report: Report): string[] {
    const columns = Object.keys(report);

    columns.forEach((column) => {
        if (report[column]['sensitivity'] === 'INSENSITIVE') {
            delete report[column];
        }
    });

    return Object.keys(report);
}

export const data = {
    code: 200,
    message: 'Preview successfully retrieved',
    result: {
        dataset: {
            age: [NaN, 50.0, 38.0, 53.0, -28.0],
            education: ['Bachelors', 'Bachelors', 'HS-grad', '11th', 'Bachelors'],
            'marital-status': [
                'Never-married',
                'Married-civ-spouse',
                'Divorced',
                'Married-civ-spouse',
                'Married-civ-spouse',
            ],
            'native-country': ['United-States', 'United-States', 'United-States', 'United-States', 'Cuba'],
            occupation: ['Adm-clerical', 'Exec-managerial', 'Handlers-cleaners', 'Handlers-cleaners', 'Prof-specialty'],
            race: ['White', 'White', 'White', 'Black', 'Black'],
            'salary-class': ['<=50K', '<=50K', '<=50K', '<=50K', '<=50K'],
            sex: [null, 'Male', 'Male', 'Male', 'Female'],
            workclass: ['State-gov', 'Self-emp-not-inc', 'Private', 'Private', 'Private'],
        },
        metadata: {
            types: {
                age: 'float64',
                education: 'object',
                'marital-status': 'object',
                'native-country': 'object',
                occupation: 'object',
                race: 'object',
                'salary-class': 'object',
                sex: 'object',
                workclass: 'object',
            },
        },
        report: {
            age: {
                classification: 'PERSON',
                sensitivity: 'SENSITIVE',
            },
            education: {
                classification: 'DATE_TIME',
                sensitivity: 'INSENSITIVE',
            },
            'marital-status': {
                classification: 'NONE',
                sensitivity: 'INSENSITIVE',
            },
            'native-country': {
                classification: 'LOCATION',
                sensitivity: 'QUASI_IDENTIFIER',
            },
            occupation: {
                classification: 'NONE',
                sensitivity: 'INSENSITIVE',
            },
            race: {
                classification: 'NRP',
                sensitivity: 'QUASI_IDENTIFIER',
            },
            'salary-class': {
                classification: 'NONE',
                sensitivity: 'INSENSITIVE',
            },
            sex: {
                classification: 'PERSON',
                sensitivity: 'SENSITIVE',
            },
            workclass: {
                classification: 'NONE',
                sensitivity: 'INSENSITIVE',
            },
        },
    },
};
