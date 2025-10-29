export type Dimension = 'accuracy' | 'consistency' | 'completeness' | 'uniqueness' | 'validity';
export const dimensions: Dimension[] = ['accuracy', 'consistency', 'completeness', 'uniqueness', 'validity'];

export type Rule = {
    id: string;
    name: string;
    description: string;
    dimension: Dimension[];
};
export const availableRules: Rule[] = [
    // Accuracy rules
    {
        id: 'ExpectColumnDistinctValuesToBeInSet',
        name: 'ExpectColumnDistinctValuesToBeInSet',
        description: 'Expect the set of distinct column values to be contained by a given set',
        dimension: 'accuracy',
    },
    {
        id: 'ExpectColumnDistinctValuesToContainSet',
        name: 'ExpectColumnDistinctValuesToContainSet',
        description: 'Expect the set of distinct column values to contain a given set',
        dimension: 'accuracy',
    },
    {
        id: 'ExpectColumnDistinctValuesToEqualSet',
        name: 'ExpectColumnDistinctValuesToEqualSet',
        description: 'Expect the set of distinct column values to equal a given set',
        dimension: 'accuracy',
    },
    {
        id: 'ExpectColumnValuesToBeInSet',
        name: 'ExpectColumnValuesToBeInSet',
        description: 'Expect each column value to be in a given set',
        dimension: 'accuracy',
    },
    {
        id: 'ExpectColumnValuesToBeBetween',
        name: 'ExpectColumnValuesToBeBetween',
        description: 'Expect column entries to be between min and max values',
        dimension: 'accuracy',
    },

    // Consistency rules
    {
        id: 'ExpectColumnPairValuesAToBeGreaterThanB',
        name: 'ExpectColumnPairValuesAToBeGreaterThanB',
        description: 'Expect values in column A to be greater than column B',
        dimension: 'consistency',
    },
    {
        id: 'ExpectColumnPairValuesToBeEqual',
        name: 'ExpectColumnPairValuesToBeEqual',
        description: 'Expect values in column A to equal column B',
        dimension: 'consistency',
    },
    {
        id: 'ExpectColumnPairValuesToBeInSet',
        name: 'ExpectColumnPairValuesToBeInSet',
        description: 'Expect paired values from columns A and B to be in valid pairs set',
        dimension: 'consistency',
    },
    {
        id: 'ExpectMultiColumnSumToBeEqual',
        name: 'ExpectMultiColumnSumToBeEqual',
        description: 'Expect that the sum of row values in specified columns is equal',
        dimension: 'consistency',
    },
    // {
    //     id: 'ExpectColumnKLDivergenceToBeLessThan',
    //     name: 'ExpectColumnKLDivergenceToBeLessThan',
    //     description: 'Expect KL divergence to be less than threshold',
    //     dimension: 'consistency'
    // },
    {
        id: 'ExpectColumnMaxToBeBetween',
        name: 'ExpectColumnMaxToBeBetween',
        description: 'Expect the column maximum to be between min and max',
        dimension: 'consistency',
    },
    {
        id: 'ExpectColumnMeanToBeBetween',
        name: 'ExpectColumnMeanToBeBetween',
        description: 'Expect the column mean to be between min and max',
        dimension: 'consistency',
    },
    {
        id: 'ExpectColumnMedianToBeBetween',
        name: 'ExpectColumnMedianToBeBetween',
        description: 'Expect the column median to be between min and max',
        dimension: 'consistency',
    },
    {
        id: 'ExpectColumnMinToBeBetween',
        name: 'ExpectColumnMinToBeBetween',
        description: 'Expect the column minimum to be between min and max',
        dimension: 'consistency',
    },
    {
        id: 'ExpectColumnMostCommonValueToBeInSet',
        name: 'ExpectColumnMostCommonValueToBeInSet',
        description: 'Expect the most common value to be within value set',
        dimension: 'consistency',
    },
    {
        id: 'ExpectColumnQuantileValuesToBeBetween',
        name: 'ExpectColumnQuantileValuesToBeBetween',
        description: 'Expect column quantiles to be between min and max',
        dimension: 'consistency',
    },
    {
        id: 'ExpectColumnStdevToBeBetween',
        name: 'ExpectColumnStdevToBeBetween',
        description: 'Expect column standard deviation to be between min and max',
        dimension: 'consistency',
    },
    {
        id: 'ExpectColumnSumToBeBetween',
        name: 'ExpectColumnSumToBeBetween',
        description: 'Expect column sum to be between min and max',
        dimension: 'consistency',
    },
    {
        id: 'ExpectColumnValueLengthsToBeBetween',
        name: 'ExpectColumnValueLengthsToBeBetween',
        description: 'Expect string lengths to be between min and max',
        dimension: 'consistency',
    },
    {
        id: 'ExpectColumnValueLengthsToEqual',
        name: 'ExpectColumnValueLengthsToEqual',
        description: 'Expect string lengths to equal specific value',
        dimension: 'consistency',
    },
    {
        id: 'ExpectColumnValueZScoresToBeLessThan',
        name: 'ExpectColumnValueZScoresToBeLessThan',
        description: 'Expect Z-scores to be less than threshold',
        dimension: 'consistency',
    },
    {
        id: 'ExpectColumnValuesToMatchRegex',
        name: 'ExpectColumnValuesToMatchRegex',
        description: 'Expect values to match regular expression',
        dimension: 'consistency',
    },
    {
        id: 'ExpectColumnValuesToMatchRegexList',
        name: 'ExpectColumnValuesToMatchRegexList',
        description: 'Expect values to match any/all in regex list',
        dimension: 'consistency',
    },

    // Completeness rules
    {
        id: 'ExpectColumnValuesToNotBeInSet',
        name: 'ExpectColumnValuesToNotBeInSet',
        description: 'Expect column entries to not be in the set',
        dimension: 'completeness',
    },
    {
        id: 'ExpectColumnValuesToNotMatchRegex',
        name: 'ExpectColumnValuesToNotMatchRegex',
        description: 'Expect values to not match regular expression',
        dimension: 'completeness',
    },
    {
        id: 'ExpectColumnValuesToNotMatchRegexList',
        name: 'ExpectColumnValuesToNotMatchRegexList',
        description: 'Expect values to not match any in regex list',
        dimension: 'completeness',
    },
    {
        id: 'ExpectColumnValuesToBeNull',
        name: 'ExpectColumnValuesToBeNull',
        description: 'Expect column values to be null',
        dimension: 'completeness',
    },
    {
        id: 'ExpectColumnValuesToNotBeNull',
        name: 'ExpectColumnValuesToNotBeNull',
        description: 'Expect column values to not be null',
        dimension: 'completeness',
    },

    // Uniqueness rules
    {
        id: 'ExpectColumnProportionOfUniqueValuesToBeBetween',
        name: 'ExpectColumnProportionOfUniqueValuesToBeBetween',
        description: 'Expect proportion of unique values to be between min and max',
        dimension: 'uniqueness',
    },
    {
        id: 'ExpectColumnUniqueValueCountToBeBetween',
        name: 'ExpectColumnUniqueValueCountToBeBetween',
        description: 'Expect number of unique values to be between min and max',
        dimension: 'uniqueness',
    },
    {
        id: 'ExpectColumnValuesToBeUnique',
        name: 'ExpectColumnValuesToBeUnique',
        description: 'Expect each column value to be unique',
        dimension: 'uniqueness',
    },
    {
        id: 'ExpectCompoundColumnsToBeUnique',
        name: 'ExpectCompoundColumnsToBeUnique',
        description: 'Expect compound columns to be unique',
        dimension: 'uniqueness',
    },
    {
        id: 'ExpectSelectColumnValuesToBeUniqueWithinRecord',
        name: 'ExpectSelectColumnValuesToBeUniqueWithinRecord',
        description: 'Expect values to be unique across columns within each record',
        dimension: 'uniqueness',
    },

    // Validity rules
    {
        id: 'ExpectColumnToExist',
        name: 'ExpectColumnToExist',
        description: 'Check for existence of specified column',
        dimension: 'validity',
    },
    {
        id: 'ExpectColumnValuesToBeInTypeList',
        name: 'ExpectColumnValuesToBeInTypeList',
        description: 'Expect values to be in specified type list',
        dimension: 'validity',
    },
    {
        id: 'ExpectColumnValuesToBeOfType',
        name: 'ExpectColumnValuesToBeOfType',
        description: 'Expect values to be of specified data type',
        dimension: 'validity',
    },
    {
        id: 'ExpectTableColumnCountToBeBetween',
        name: 'ExpectTableColumnCountToBeBetween',
        description: 'Expect table column count to be between min and max',
        dimension: 'validity',
    },
    {
        id: 'ExpectTableColumnCountToEqual',
        name: 'ExpectTableColumnCountToEqual',
        description: 'Expect table column count to equal value',
        dimension: 'validity',
    },
    {
        id: 'ExpectTableColumnsToMatchOrderedList',
        name: 'ExpectTableColumnsToMatchOrderedList',
        description: 'Expect columns to exactly match specified ordered list',
        dimension: 'validity',
    },
    {
        id: 'ExpectTableColumnsToMatchSet',
        name: 'ExpectTableColumnsToMatchSet',
        description: 'Expect columns to exactly match specified set',
        dimension: 'validity',
    },
    {
        id: 'ExpectTableRowCountToBeBetween',
        name: 'ExpectTableRowCountToBeBetween',
        description: 'Expect table row count to be between min and max',
        dimension: 'validity',
    },
    {
        id: 'ExpectTableRowCountToEqual',
        name: 'ExpectTableRowCountToEqual',
        description: 'Expect table row count to equal value',
        dimension: 'validity',
    },
];

export const ruleDetails = {
    // Accuracy rules
    ExpectColumnDistinctValuesToBeInSet: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'value_set',
                label: 'Expected Value Set',
                type: 'list',
                placeholder: 'A set of objects used for comparison.',
                required: true,
                rows: 4,
            },
        ],
    },

    ExpectColumnDistinctValuesToContainSet: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'value_set',
                label: 'Expected Value Set',
                type: 'list',
                placeholder: 'A set of objects used for comparison.',
                required: true,
                rows: 4,
            },
        ],
    },

    ExpectColumnDistinctValuesToEqualSet: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'value_set',
                label: 'Expected Value Set',
                type: 'list',
                placeholder: 'A set of objects used for comparison.',
                required: true,
                rows: 4,
            },
        ],
    },

    ExpectColumnValuesToBeInSet: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'value_set',
                label: 'Expected Value Set',
                type: 'list',
                placeholder: 'A set of objects used for comparison.',
                required: true,
                rows: 4,
            },
        ],
    },

    ExpectColumnValuesToBeBetween: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'min_value',
                label: 'Minimum Value',
                type: 'number',
                placeholder: 'The minimum value for a column entry.',
                required: true,
            },
            {
                id: 'max_value',
                label: 'Maximum Value',
                type: 'number',
                placeholder: 'The maximum value for a column entry.',
                required: true,
            },
            {
                id: 'strict_min',
                label: 'Strict Minimum',
                type: 'checkbox',
                defaultValue: false,
            },
            {
                id: 'strict_max',
                label: 'Strict Maximum',
                type: 'checkbox',
                defaultValue: false,
            },
        ],
    },

    // Consistency rules
    ExpectColumnPairValuesAToBeGreaterThanB: {
        fields: [
            {
                id: 'column_A',
                label: 'Column A',
                type: 'text',
                placeholder: 'The first column name.',
                required: true,
            },
            {
                id: 'column_B',
                label: 'Column B',
                placeholder: 'The second column name.',
                type: 'text',
                required: true,
            },
            {
                id: 'or_equal',
                label: 'Or Equal',
                type: 'checkbox',
                defaultValue: false,
            },
        ],
    },

    ExpectColumnPairValuesToBeEqual: {
        fields: [
            {
                id: 'column_A',
                label: 'Column A',
                type: 'text',
                placeholder: 'The first column name.',
                required: true,
            },
            {
                id: 'column_B',
                label: 'Column B',
                placeholder: 'The second column name.',
                type: 'text',
                required: true,
            },
        ],
    },

    ExpectColumnPairValuesToBeInSet: {
        fields: [
            {
                id: 'column_A',
                label: 'Column A',
                type: 'text',
                placeholder: 'The first column name.',
                required: true,
            },
            {
                id: 'column_B',
                label: 'Column B',
                placeholder: 'The second column name.',
                type: 'text',
                required: true,
            },
            {
                id: 'value_pair_set',
                label: 'Valid Pair Set',
                type: 'list',
                placeholder: 'All valid pairs to be matched (list of tuples i.e. [(value_1,value_2),...]',
                required: true,
                rows: 4,
            },
        ],
    },

    ExpectMultiColumnSumToBeEqual: {
        fields: [
            {
                //TODO: Improve UX, Make proper list.
                id: 'column_list',
                label: 'Column List',
                type: 'list',
                placeholder: 'Enter column names separated by commas or newlines',
                required: true,
                rows: 3,
            },
            {
                id: 'sum_total',
                label: 'Sum Total',
                type: 'number',
                required: true,
            },
        ],
    },

    ExpectColumnMaxToBeBetween: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'min_value',
                label: 'Minimum Value',
                type: 'number',
                placeholder: 'The minimum value of the acceptable range for the column maximum.',
            },
            {
                id: 'max_value',
                label: 'Maximum Value',
                type: 'number',
                placeholder: 'The maximum value of the acceptable range for the column maximum.',
            },
            {
                id: 'strict_min',
                label: 'Strict Minimum',
                type: 'checkbox',
                defaultValue: false,
            },
            {
                id: 'strict_max',
                label: 'Strict Maximum',
                type: 'checkbox',
                defaultValue: false,
            },
        ],
    },

    ExpectColumnMeanToBeBetween: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'min_value',
                label: 'Minimum Value',
                type: 'number',
                placeholder: 'The minimum value of the acceptable range for the column mean.',
            },
            {
                id: 'max_value',
                label: 'Maximum Value',
                type: 'number',
                placeholder: 'The maximum value of the acceptable range for the column mean.',
            },
            {
                id: 'strict_min',
                label: 'Strict Minimum',
                type: 'checkbox',
                defaultValue: false,
            },
            {
                id: 'strict_max',
                label: 'Strict Maximum',
                type: 'checkbox',
                defaultValue: false,
            },
        ],
    },

    ExpectColumnMedianToBeBetween: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'min_value',
                label: 'Minimum Value',
                type: 'number',
                placeholder: 'The minimum value of the acceptable range for the column median.',
            },
            {
                id: 'max_value',
                label: 'Maximum Value',
                type: 'number',
                placeholder: 'The maximum value of the acceptable range for the column median.',
            },
            {
                id: 'strict_min',
                label: 'Strict Minimum',
                type: 'checkbox',
                defaultValue: false,
            },
            {
                id: 'strict_max',
                label: 'Strict Maximum',
                type: 'checkbox',
                defaultValue: false,
            },
        ],
    },

    ExpectColumnMinToBeBetween: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'min_value',
                label: 'Minimum Value',
                type: 'number',
                placeholder: 'The minimum value of the acceptable range for the column minimum.',
            },
            {
                id: 'max_value',
                label: 'Maximum Value',
                type: 'number',
                placeholder: 'The maximum value of the acceptable range for the column minimum.',
            },
            {
                id: 'strict_min',
                label: 'Strict Minimum',
                type: 'checkbox',
                defaultValue: false,
            },
            {
                id: 'strict_max',
                label: 'Strict Maximum',
                type: 'checkbox',
                defaultValue: false,
            },
        ],
    },

    ExpectColumnMostCommonValueToBeInSet: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'value_set',
                label: 'Expected Value Set',
                type: 'list',
                placeholder: 'A set of objects used for comparison.',
                required: true,
                rows: 4,
            },
            {
                id: 'ties_okay',
                label: 'Are Ties Allowed?',
                type: 'checkbox',
                defaultValue: false,
            },
        ],
    },

    ExpectColumnQuantileValuesToBeBetween: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'quartile_ranges', // This needs to be updated to handle dict creation
                label: 'Quantile Values', // {'quantiles':sorted list, value_ranges: [(lower_value, upper_value)...]}
                type: 'list',
                placeholder: 'A set of objects used for comparison.',
                required: true,
                rows: 4,
            },
            {
                id: 'allow_relative_error',
                label: 'Whether to allow relative error in quantile communications on backends that support or require it.',
                type: 'checkbox',
                defaultValue: false,
            },
        ],
    },
    ExpectColumnStdevToBeBetween: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'min_value',
                label: 'Minimum Value',
                type: 'number',
                placeholder: 'The minimum value of the acceptable range for the column std.',
            },
            {
                id: 'max_value',
                label: 'Maximum Value',
                type: 'number',
                placeholder: 'The maximum value of the acceptable range for the column std.',
            },
            {
                id: 'strict_min',
                label: 'Strict Minimum',
                type: 'checkbox',
                defaultValue: false,
            },
            {
                id: 'strict_max',
                label: 'Strict Maximum',
                type: 'checkbox',
                defaultValue: false,
            },
        ],
    },

    ExpectColumnSumToBeBetween: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'min_value',
                label: 'Minimum Value',
                type: 'number',
                placeholder: 'The minimum value of the acceptable range for the column sum.',
            },
            {
                id: 'max_value',
                label: 'Maximum Value',
                type: 'number',
                placeholder: 'The maximum value of the acceptable range for the column sum.',
            },
            {
                id: 'strict_min',
                label: 'Strict Minimum',
                type: 'checkbox',
                defaultValue: false,
            },
            {
                id: 'strict_max',
                label: 'Strict Maximum',
                type: 'checkbox',
                defaultValue: false,
            },
        ],
    },

    ExpectColumnValueLengthToBeBetween: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'min_value',
                label: 'Minimum Value',
                type: 'number',
                placeholder: 'The minimum value of the acceptable range for the column entry length.',
            },
            {
                id: 'max_value',
                label: 'Maximum Value',
                type: 'number',
                placeholder: 'The maximum value of the acceptable range for the column entry length.',
            },
            {
                id: 'strict_min',
                label: 'Strict Minimum',
                type: 'checkbox',
                defaultValue: false,
            },
            {
                id: 'strict_max',
                label: 'Strict Maximum',
                type: 'checkbox',
                defaultValue: false,
            },
        ],
    },

    ExpectColumnValueLengthsToEqual: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'value',
                label: 'Value Length',
                type: 'number',
                placeholder: 'The expected value for a column entry length.',
                required: true,
            },
        ],
    },

    ExpectColumnValuesToMatchRegex: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'regex',
                label: 'Regex',
                type: 'text',
                placeholder: 'The regular expression the column entries should match.',
                required: true,
            },
        ],
    },

    ExpectColumnValuesToMatchRegexList: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                //TODO: Improve UX
                id: 'regex_list',
                label: 'Regex',
                type: 'text',
                placeholder: 'The list of regular expressions which the column entries should match.',
                required: true,
            },
            {
                //TODO: Improve UX. Make dropdown with 'any' or 'all'
                id: 'match_on',
                label: 'Matching Quantity',
                type: 'text',
                placeholder:
                    "'any' or 'all'. Use 'any' if the value should match at least one regular expression in the list. Use 'all' if it should match each regular expression in the list.",
                required: true,
            },
        ],
    },

    // ExpectColumnKLDivergenceToBeLessThan: {
    //     fields: [
    //         {
    //             id: 'column_name',
    //             label: 'Column Name',
    //             type: 'text',
    //             required: true
    //         },
    //         {
    //             id: 'partition_object',
    //             label: 'Partition Object',
    //             type: 'textarea',
    //             placeholder: 'JSON object defining the partition',
    //             required: true,
    //             rows: 4
    //         },
    //         {
    //             id: 'threshold',
    //             label: 'Threshold',
    //             type: 'number',
    //             required: true
    //         }
    //     ]
    // },

    // Completeness rules
    ExpectColumnValuesToNotBeInSet: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'value_set',
                label: 'Expected Value Set',
                type: 'list',
                placeholder: 'A set of objects used for comparison.',
                required: true,
                rows: 4,
            },
        ],
    },

    ExpectColumnValuesToNotMatchRegex: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'regex',
                label: 'Regex',
                type: 'text',
                placeholder: 'The regular expression the column entries should match.',
                required: true,
            },
        ],
    },

    ExpectColumnValuesToNotMatchRegexList: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                //TODO: Improve UX. Make list
                id: 'regex_list',
                label: 'Regex',
                type: 'text',
                placeholder: 'The list of regular expressions which the column entries should match.',
                required: true,
            },
        ],
    },

    ExpectColumnValuesToBeNull: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
        ],
    },

    ExpectColumnValuesToNotBeNull: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
        ],
    },

    // Uniqueness rules
    ExpectColumnProportionOfUniqueValuesToBeBetween: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'min_value',
                label: 'Minimum Value',
                type: 'number',
                placeholder: 'The minimum proportion of unique values (Proportions are on the range 0 to 1)',
            },
            {
                id: 'max_value',
                label: 'Maximum Value',
                type: 'number',
                placeholder: 'The maximum proportion of unique values (Proportions are on the range 0 to 1)',
            },
            {
                id: 'strict_min',
                label: 'Strict Minimum',
                type: 'checkbox',
                defaultValue: false,
            },
            {
                id: 'strict_max',
                label: 'Strict Maximum',
                type: 'checkbox',
                defaultValue: false,
            },
        ],
    },

    ExpectColumnUniqueValueCountToBeBetween: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'min_value',
                label: 'Minimum Value',
                type: 'number',
                placeholder: 'The minimum number of unique values allowed.',
            },
            {
                id: 'max_value',
                label: 'Maximum Value',
                type: 'number',
                placeholder: 'The maximum number of unique values allowed.',
            },
            {
                id: 'strict_min',
                label: 'Strict Minimum',
                type: 'checkbox',
                defaultValue: false,
            },
            {
                id: 'strict_max',
                label: 'Strict Maximum',
                type: 'checkbox',
                defaultValue: false,
            },
        ],
    },

    ExpectColumnValuesToBeUnique: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
        ],
    },

    ExpectCompoundColumnsToBeUnique: {
        fields: [
            {
                //TODO: Improve UX. Make proper list.
                id: 'column_list',
                label: 'Column List',
                type: 'list',
                placeholder: 'Set of columns to be checked.',
                rows: 3,
            },
        ],
    },

    ExpectSelectColumnValuesToBeUniqueWithinRecord: {
        fields: [
            {
                //TODO: Improve UX. Make proper list.
                id: 'column_list',
                label: 'Column List',
                type: 'list',
                placeholder: 'The column names to evaluate.',
                rows: 3,
            },
        ],
    },

    // Validity rules
    ExpectColumnToExist: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
        ],
    },

    ExpectColumnValuesToBeInTypeList: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                //TODO: Improve UX. Make this a proper list.
                id: 'type_list',
                label: 'Datatype List',
                type: 'list',
                placeholder: 'A list of strings representing the data type that each column should have as entries.',
                required: true,
                rows: 4,
            },
        ],
    },

    ExpectColumnValuesToBeOfType: {
        fields: [
            {
                id: 'column',
                label: 'Column Name',
                type: 'text',
                placeholder: 'The column name.',
                required: true,
            },
            {
                id: 'type_',
                label: 'Datatype',
                type: 'text',
                placeholder: 'A string representing the data type that each column should have as entries.',
                required: true,
            },
        ],
    },

    ExpectTableColumnCountToBeBetween: {
        fields: [
            {
                id: 'min_value',
                label: 'Minimum Value',
                type: 'number',
                placeholder: 'The minimum number of columns, inclusive.',
                required: true,
            },
            {
                id: 'max_value',
                label: 'Maximum Value',
                type: 'number',
                placeholder: 'The maximum number of columns, inclusive.',
                required: true,
            },
        ],
    },

    ExpectTableColumnCountToEqual: {
        fields: [
            {
                id: 'value',
                label: 'Value',
                type: 'number',
                placeholder: 'The expected number of columns.',
                required: true,
            },
        ],
    },

    ExpectTableColumnsToMatchOrderedList: {
        fields: [
            {
                //TODO: Improve UX. Make proper list.
                id: 'column_list',
                label: 'Column List',
                type: 'list',
                placeholder: 'The column names, in the correct order.',
                rows: 3,
                required: true,
            },
        ],
    },

    ExpectTableColumnsToMatchSet: {
        fields: [
            {
                //TODO: Improve UX. Make proper list.
                id: 'column_set',
                label: 'Column Set',
                type: 'list',
                placeholder: 'The column names, in any order.',
                rows: 3,
                required: true,
            },
            {
                id: 'exact_match',
                label: 'Exact Match?',
                placeholder:
                    'If True, the list of columns must exactly match the observed columns. If False, observed columns must include column_set but additional columns will pass.',
                type: 'checkbox',
                defaultValue: false,
            },
        ],
    },

    ExpectTableRowCountToBeBetween: {
        fields: [
            {
                id: 'min_value',
                label: 'Minimum Value',
                type: 'number',
                placeholder: 'The minimum number of rows, inclusive.',
                required: true,
            },
            {
                id: 'max_value',
                label: 'Maximum Value',
                type: 'number',
                placeholder: 'The maximum number of rows, inclusive.',
                required: true,
            },
            {
                id: 'strict_min',
                label: 'Strict Minimum',
                type: 'checkbox',
                defaultValue: false,
            },
            {
                id: 'strict_max',
                label: 'Strict Maximum',
                type: 'checkbox',
                defaultValue: false,
            },
        ],
    },

    ExpectTableRowCountToEqual: {
        fields: [
            {
                id: 'value',
                label: 'Value',
                type: 'number',
                placeholder: 'The expected number of rows.',
                required: true,
            },
        ],
    },
};

export const commonFields = [
    {
        id: 'rule_name',
        label: 'Rule Name',
        type: 'text',
        placeholder: 'Enter a custom rule name.',
        required: false,
    },
    {
        id: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Enter a description for this rule',
        rows: 3,
        required: false,
    },
    {
        id: 'mostly',
        label: 'Violation Tolerance',
        type: 'number',
        placeholder: 'Enter proportion of successfully validated rows to pass.',
        default: 1.0,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        required: false,
    },
];
