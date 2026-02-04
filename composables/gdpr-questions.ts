export const useGdprQuestions = async (datasetId: string, distributionId: string) => {
    const { t } = useI18n();
    const { showSuccessMessage, showErrorMessage } = useAlertMessage();
    const questionKey = ref('q1');
    const answerRef = ref();
    const gdprCheckerOpen = ref(false);
    const showInfo = ref(false);
    const answersLog = ref<Record<string, any>>({ assetId: '', distributionId: '', questionnaire: {} });

    const information = {
        p1: 'Indicative questions for PISTIS Personal Data Check tool',
        p2: 'This tool aims to help you assess whether a distribution is likely to contain personal data and whether its upload to the PISTIS Platform is permissible and likely lawful under the EU personal data protection regulatory regime. The assessment is based on your responses to questions concerning identification of personal data (Question 1) and lawfulness of processing (Question 2). The tool focuses on these two areas as they are the fundamentals of personal data protection under the GDPR. However, it does not aim to guarantee full GDPR compliance; based on your answers further requirements may apply, including in relation to the relevant controller/processor roles, security, and data subjects’ rights.',
        p3: 'This is a preliminary, indicative screening tool only. It does not constitute legal advice, nor does it guarantee compliance with any legal, contractual, or regulatory obligations. The PISTIS Platform does not assume responsibility for any inaccuracies or omissions in your responses. You remain fully responsible for the accuracy of your assessment, for any processing of personal data you upload to the PISTIS Platform, and for ensuring compliance with all applicable laws and regulations (including any non-EU laws).',
    };

    const mainQuestions = {
        q1: {
            question: 'Does the distribution contain personal data?',
            description:
                'Personal data means any information relating to an identified or identifiable natural person; an identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural or social identity of that natural person.',
            answers: [
                {
                    value: 'yes',
                    label: 'Yes',
                    description:
                        'Any personal data exchanged on PISTIS platform must be processed lawfully, i.e. based on a specific lawful basis (such as consent of the individual concerned), or in an anonymised form (so that it no longer constitutes personal data). Please consider anonymising personal data in your distribution or ensure you have obtained the required consent (or you are able to rely on any other lawful basis).',
                },
                {
                    value: 'no',
                    label: 'No',
                    description:
                        'Great news. If your distribution contains no personal data, it is unlikely to be subject to data protection rules. However, you may still wish to further reduce any residual risk by sanitising your distribution using the Anonymiser tool, or by selecting ‘Not sure’ below and answer the subsequent questions to verify that the distribution indeed unlikely contains personal data.',
                },
                {
                    value: 'not sure',
                    label: 'Not sure',
                    description: '',
                },
            ],
        },
        q2: {
            question: 'If the distribution contains personal data, is the processing lawful?',
            description: 'Note: This question does not apply if personal data has been anonymised.',
            answers: [
                {
                    value: 'yes',
                    label: 'Yes',
                    description:
                        'Great news. If the processing of personal data in your distribution is lawful, the distribution may be uploaded to the PISTIS Platform, provided you continue to comply with all applicable data protection obligations. If you would like to revisit the some of the factors relevant to assessing lawfulness, you may select ‘Not sure’ and answer the supporting questions.',
                },
                {
                    value: 'no',
                    label: 'No',
                    description:
                        'You must not process personal data if the processing would be unlawful. Please consider either anonymising your distribution using the Anonymiser tool or ensuring that a valid lawful basis is satisfied (for example, by obtaining valid consent or relying on another lawful basis where appropriate).',
                },
                {
                    value: 'not sure',
                    label: 'Not sure',
                    description: '',
                },
            ],
        },
        q1_1: {
            question: 'Does the distribution include any obvious identifiers?',
            description:
                'Examples: names, email addresses, phone numbers, ID numbers, precise location data, or other unique identifiers.',
            answers: [
                {
                    value: 'yes',
                    label: 'Yes',
                    description:
                        'The distribution likely contains personal data. Any personal data exchanged on PISTIS platform must be processed lawfully, i.e. based on a specific lawful basis (such as consent of the individual concerned), or in an anonymised form (so that it no longer constitutes personal data). Please consider anonymising personal data in your distribution or ensure you have obtained the required consent (or you are able to rely on another lawful basis).',
                },
                {
                    value: 'no',
                    label: 'No',
                    description: '',
                },
            ],
        },
        q1_2: {
            question:
                'Could any individual be identified indirectly if the distribution were combined with information reasonably available to the recipient?',
            description: 'Examples: unique hashed values, device IDs, rare combinations of attributes.',
            answers: [
                {
                    value: 'yes',
                    label: 'Yes',
                    description:
                        'The distribution likely contains personal data. Any personal data exchanged on PISTIS platform must be processed lawfully, i.e. based on a specific lawful basis (such as consent of the individual concerned), or in an anonymised form (so that it no longer constitutes personal data). Please consider anonymising personal data in your distribution or ensure you have obtained the required consent (or you are able to rely on another lawful basis). ',
                },
                {
                    value: 'no',
                    label: 'No',
                    description: '',
                },
            ],
        },
        q1_3: {
            question: 'Is the distribution at a sufficiently granular level to single out a natural person?',
            description: 'Example: highly precise geolocation or very small area postcode segments (even if hashed).',
            answers: [
                {
                    value: 'yes',
                    label: 'Yes',
                    description:
                        'The distribution likely contains personal data. Any personal data exchanged on PISTIS platform must be processed lawfully, i.e. based on a specific lawful basis (such as consent of the individual concerned), or in an anonymised form (so that it no longer constitutes personal data). Please consider anonymising personal data in your distribution or ensure you have obtained the required consent (or you are able to rely on another lawful basis). ',
                },
                {
                    value: 'no',
                    label: 'No',
                    description: '',
                },
            ],
        },
        q1_4: {
            question:
                'Does the distribution include data that relates to human behaviour, characteristics or activities capable of being attributed to individuals?',
            description:
                'Example: behavioural logs, device‑level telemetry, transaction traces (unless sufficiently aggregated).',
            answers: [
                {
                    value: 'yes',
                    label: 'Yes',
                    description:
                        'The distribution likely contains personal data. Any personal data exchanged on PISTIS platform must be processed lawfully, i.e. based on a specific lawful basis (such as consent of the individual concerned), or in an anonymised form (so that it no longer constitutes personal data). Please consider anonymising personal data in your distribution or ensure you have obtained the required consent (or you are able to rely on another lawful basis).',
                },
                {
                    value: 'no',
                    label: 'No',
                    description: '',
                },
            ],
        },
        q1_5: {
            question:
                'Has the distribution truly been anonymised so that no individual is identifiable, directly or indirectly?',
            description:
                'Consider whether re‑identification or downstream misuse is reasonably possible by anyone with likely auxiliary data.',
            answers: [
                {
                    value: 'yes',
                    label: 'Yes',
                    description:
                        'Great news. If your distribution has been anonymised and contains no personal data, it is unlikely to be subject to data protection rules. However, you may still wish to further reduce any residual risk by sanitising your distribution using the Anonymiser tool.',
                },
                {
                    value: 'no',
                    label: 'No',
                    description:
                        'The distribution likely contains personal data. Any personal data exchanged on PISTIS platform must be processed lawfully, i.e. based on a specific lawful basis (such as consent of the individual concerned), or in an anonymised form (so that it no longer constitutes personal data). Please consider anonymising personal data in your distribution or ensure you have obtained the required consent (or you are able to rely on another lawful basis).',
                },
            ],
        },
        q2_1: {
            question:
                'Is there a clearly defined purpose for processing, explained transparently to data subjects or aligned with their reasonable expectations?',
            description: '',
            answers: [
                {
                    value: 'yes',
                    label: 'Yes',
                    description:
                        'Good news. A clear and transparent purpose supports lawful processing under the GDPR. Please ensure that your purpose is documented and that data subjects would reasonably expect this processing, taking into account the context in which their data was originally collected.',
                },
                {
                    value: 'no',
                    label: 'No',
                    description:
                        'Without a clearly defined and transparent purpose, the processing may not meet GDPR requirements. Please clarify and document the specific purpose for the processing, and ensure it is communicated transparently to data subjects and aligns with their reasonable expectations.',
                },
            ],
        },
        q2_2: {
            question: 'Please select at least one of the following intended lawful basis:',
            description: '',
            answers: [
                {
                    value: 'consent',
                    label: 'Consent',
                    description:
                        'Please ensure that any consent you rely upon is valid under the GDPR. Consent must be freely given, specific, informed, and unambiguous, and data subjects must be able to withdraw it at any time. You should also maintain records demonstrating how and when consent was obtained.',
                },
                {
                    value: 'contractual necessity',
                    label: 'Contractual necessity',
                    description:
                        'Please ensure that you have documented the lawful basis you rely upon and your justification for using it. For example, where you rely on legitimate interests, you should complete a Legitimate Interests Assessment demonstrating the identified interest, the necessity of the processing, and the balance against individuals’ rights and expectations.',
                },
                {
                    value: 'legal obligation',
                    label: 'Legal obligation',
                    description:
                        'Please ensure that you have documented the lawful basis you rely upon and your justification for using it. For example, where you rely on legitimate interests, you should complete a Legitimate Interests Assessment demonstrating the identified interest, the necessity of the processing, and the balance against individuals’ rights and expectations.',
                },
                {
                    value: 'vital interests',
                    label: 'Vital interests',
                    description:
                        'Please ensure that you have documented the lawful basis you rely upon and your justification for using it. For example, where you rely on legitimate interests, you should complete a Legitimate Interests Assessment demonstrating the identified interest, the necessity of the processing, and the balance against individuals’ rights and expectations.',
                },
                {
                    value: 'public task',
                    label: 'Public task',
                    description:
                        'Please ensure that you have documented the lawful basis you rely upon and your justification for using it. For example, where you rely on legitimate interests, you should complete a Legitimate Interests Assessment demonstrating the identified interest, the necessity of the processing, and the balance against individuals’ rights and expectations.',
                },
                {
                    value: 'legitimate interest',
                    label: 'Legitimate interest',
                    description:
                        'Please ensure that you have documented the lawful basis you rely upon and your justification for using it. For example, where you rely on legitimate interests, you should complete a Legitimate Interests Assessment demonstrating the identified interest, the necessity of the processing, and the balance against individuals’ rights and expectations.',
                },
            ],
        },
    };

    const saveCurrentAnswer = () => {
        if (answerRef.value) {
            answersLog.value['assetId'] = datasetId;
            answersLog.value['distributionId'] = distributionId;
            answersLog.value.questionnaire[questionKey.value] = answerRef.value;
        }
    };

    const nextQuestion = () => {
        saveCurrentAnswer();
        if (questionKey.value === 'q1') {
            if (answerRef.value === 'yes') {
                questionKey.value = 'q2';
                answerRef.value = null;
            } else if (answerRef.value === 'no') {
                submit();
            } else {
                questionKey.value = 'q1_1';
                answerRef.value = null;
            }
        } else if (questionKey.value === 'q1_1') {
            if (answerRef.value === 'yes') {
                questionKey.value = 'q2';
                answerRef.value = null;
            } else {
                questionKey.value = 'q1_2';
                answerRef.value = null;
            }
        } else if (questionKey.value === 'q1_2') {
            if (answerRef.value === 'yes') {
                questionKey.value = 'q2';
                answerRef.value = null;
            } else {
                questionKey.value = 'q1_3';
                answerRef.value = null;
            }
        } else if (questionKey.value === 'q1_3') {
            if (answerRef.value === 'yes') {
                questionKey.value = 'q2';
                answerRef.value = null;
            } else {
                questionKey.value = 'q1_4';
                answerRef.value = null;
            }
        } else if (questionKey.value === 'q1_4') {
            if (answerRef.value === 'yes') {
                questionKey.value = 'q2';
                answerRef.value = null;
            } else {
                questionKey.value = 'q1_5';
                answerRef.value = null;
            }
        } else if (questionKey.value === 'q1_5') {
            if (answerRef.value === 'yes') {
                submit();
            } else {
                questionKey.value = 'q2';
                answerRef.value = null;
            }
        } else if (questionKey.value === 'q2') {
            if (answerRef.value === 'yes') {
                submit();
            } else if (answerRef.value === 'no') {
                submit();
            } else {
                questionKey.value = 'q2_1';
                answerRef.value = null;
            }
        } else if (questionKey.value === 'q2_1') {
            if (answerRef.value === 'yes') {
                questionKey.value = 'q2_2';
                answerRef.value = null;
            } else {
                questionKey.value = 'q2_2';
                answerRef.value = null;
            }
        } else {
            submit();
        }
    };

    const resetState = () => {
        questionKey.value = 'q1';
        answerRef.value = null;
    };

    const cancel = () => {
        answersLog.value = {};
        resetState();
        gdprCheckerOpen.value = false;
    };
    const submit = async () => {
        console.log('Final Answers:', answersLog.value);
        gdprCheckerOpen.value = false;
        questionKey.value = 'q1';
        answerRef.value = null;
        await useFetch('/api/catalog/gdpr', {
            method: 'POST',
            body: answersLog.value,
            onResponse({ response }) {
                if (response.status === 200 || response.status === 201) {
                    showSuccessMessage(t('catalogue.successfulGDPR'));
                } else {
                    showErrorMessage(t('catalogue.unsuccessfulGDPR'));
                }
            },
        });

        return answersLog.value;
    };

    const showReport = (_datasetId: string) => {
        //TODO Contact gdpr checker for the report
        return answersLog.value ? answersLog.value : null;
    };

    return {
        mainQuestions,
        questionKey,
        answerRef,
        nextQuestion,
        cancel,
        gdprCheckerOpen,
        information,
        showInfo,
        submit,
        answersLog,
        showReport,
    };
};
