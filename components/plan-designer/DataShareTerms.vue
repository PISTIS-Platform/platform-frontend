<script setup lang="ts">
import jsPDF, { jsPDFOptions } from 'jspdf';
//monetizationDetails

const props = defineProps({
    assetOfferingDetails: {
        type: Object,
        required: true,
    },
    monetizationDetails: {
        type: Object,
        required: true,
    },
});

const htmlContent = ref('');

const download = () => {
    const options: jsPDFOptions = {
        orientation: 'p',
        unit: 'pt',
        format: 'letter',
    };

    const doc = new jsPDF(options);
    doc.html(htmlContent.value, {
        callback: (doc: jsPDF) => {
            doc.save('Terms And Conditions.pdf');
        },
        margin: [20, 20, 20, 20], // Set appropriate margins
        autoPaging: 'text', // Crucial for handling text flow across pages
        html2canvas: {
            allowTaint: true,
            letterRendering: true,
            logging: false,
            scale: 0.5, // Adjust the scale to fit content
        },
    });
};

const termsItem = ref([
    {
        icon: 'i-heroicons-information-circle',
        label: 'Terms and Conditions',
        slot: 'terms-item',
        defaultOpen: true,
    },
]);

const placeholders = computed(() => {
    return {
        dataDescription: 'Data',
        exclusiveness: 'exclusive',
        region: 'Worldwide',
        transferable: 'transferable',
        durationText: 'perpetual',
        otherPurposes: 'Other Purposes',
        terms: {
            text1: 'term 1',
            text2: 'term 2',
            text3: 'term 3',
        },
        terminationTerm: 'termination term',
        price: props.monetizationDetails.price,
        personalDataText:
            'In the event that the dataset contains personal data including pseudonymised personal data, the Data Provider is advised to consider defining the terms and conditions for the transfer and processing of personal data]',
    };
});
</script>

<template>
    <UCard :ui="{ body: { base: '', padding: 'p-1 sm:px-1 sm:py-2' } }">
        <UAccordion :items="termsItem" size="xl" variant="ghost" color="black">
            <!-- eslint-disable-next-line vue/no-unused-vars -->
            <template #default="{ item, index, open }">
                <UButton :icon="item.icon" color="black" variant="soft" class="font-semibold" size="xl">
                    Terms and Conditions
                    <template #trailing>
                        <UIcon
                            name="i-heroicons-chevron-up-20-solid"
                            class="w-6 h-6 ms-auto transform transition-transform duration-200"
                            :class="[open && 'rotate-180']"
                        />
                    </template>
                </UButton>
            </template>
            <!-- eslint-disable-next-line vue/no-unused-vars -->
            <template #terms-item="{ item }">
                <div class="text-gray-800 px-8 h-[400px] overflow-y-scroll">
                    <div ref="htmlContent">
                        <div class="flex flex-col gap-2 font-bold justify-center items-center py-4 text-lg">
                            <h1>EXPLANATORY NOTES</h1>
                            <h1>THE GENERIC TERMS OF DATA SHARING ON PISTIS DATA MARKETPLACE</h1>
                            <br />
                        </div>

                        <div class="flex gap-4 font-bold">
                            <span>1.</span>
                            <h3>WHAT & WHY</h3>
                        </div>

                        <div class="flex gap-4 mt-4 ml-4">
                            <span>a.</span>
                            <p>
                                Where the Grant Agreement (‘GA’) and Consortium Agreement (‘CA’) of Project PISTIS
                                (‘Project’) aims to brings forward a reference federated data sharing/trading and
                                monetisation platform for secure, trusted and controlled exchange and usage of
                                proprietary data assets and data-driven intelligence, there is a need to further detail
                                and practically organize certain generic terms for such sharing and related
                                collaboration between the project partners on the PISTIS Data Marketplace under a
                                non-exhaustive set of suggested, generic terms and options that the partners can tailor,
                                amend, and negotiate out during the demonstrations.
                            </p>
                        </div>

                        <div class="flex gap-4 font-bold mt-6">
                            <span>2.</span>
                            <h3>FOR WHOM</h3>
                        </div>

                        <div class="flex gap-4 mt-4 ml-4">
                            <span>a.</span>
                            <p>
                                The generic terms of data sharing are prepared for the PISTIS demonstrator partners
                                solely to be used for the demonstration of business-to-business data transactions on the
                                BETA version of the PISTIS Data Marketplace, which is still under development and
                                testing.
                            </p>
                        </div>
                        <div class="flex gap-4 mt-4 ml-4">
                            <span>b.</span>
                            <p>
                                These terms of data sharing provide explanations and options only for informational
                                purposes, and the Project demonstrator partners are free to change the terms as they
                                deem appropriate for their use cases. Under no circumstance, the Project demonstrator
                                partners are obliged to use these terms for their data sharing arrangement. These
                                explanations and options aim to enable and facilitate concrete data-sharing arrangements
                                and operations between the demonstrator partners in their various roles, such
                            </p>
                        </div>
                        <div class="flex gap-4 mt-4 ml-4">
                            <span>c.</span>
                            <p>as data provider, data recipient, or otherwise.</p>
                        </div>
                        <div class="flex gap-4 mt-4 ml-4">
                            <span>d.</span>
                            <p>
                                The users of these terms are advised to consult their legal advisors for further advice
                                and assistance before executing a data-sharing transaction on the PISTIS Data
                                Marketplace.
                            </p>
                        </div>

                        <div class="flex gap-4 font-bold mt-6">
                            <span>3.</span>
                            <h3>HOW</h3>
                        </div>

                        <div class="flex gap-4 mt-4 ml-4">
                            <span>a.</span>
                            <p>
                                These terms are part of the seven (7) elements of the PISTIS data sharing contract
                                framework, namely, matchmaking of users, data check-in and asset description, detailed
                                overview of dataset, analysis of data usage and license, data valuation, determining
                                data sharing terms including selection of pre-defined terms, and execution of
                                transactions including provision of payment, delivery of dataset. This means that these
                                terms can be used and become part of any data-sharing arrangements and agreements that
                                will be formed on the PISTIS Data Marketplace between Data Providers and Data
                                Recipients.
                            </p>
                        </div>
                        <div class="flex gap-4 mt-4 ml-4">
                            <span>b.</span>
                            <p>
                                These terms are generic. This means that it is a set of non-exhaustive recommended terms
                                to be used for data sharing transactions but does not include specific arrangements that
                                may be relevant between certain Data Providers and Data Recipients. Given that the data
                                sharing transactions will be carried out in different sectors, such as mobility, traffic
                                safety, energy, etc., and become subject to national jurisdictions, the Project
                                demonstrator partners are advised to consider the sector-specific legal requirements
                                applicable to their use cases in the relevant national jurisdictions. Data Provider and
                                Data Recipient are responsible for adding such arrangements to these terms.
                            </p>
                        </div>
                        <div class="flex gap-4 mt-4 ml-4">
                            <span>c.</span>
                            <p>
                                The PISTIS consortium will not be liable for any loss, whether direct, indirect,
                                special, or consequential, suffered by any party due to the use of these generic terms.
                            </p>
                        </div>

                        <div class="flex flex-col font-bold justify-center items-center mt-6 text-base">
                            <h1>PISTIS GENERIC TERMS OF DATA SHARING</h1>
                        </div>

                        <div class="flex flex-col gap-4 mt-4">
                            <p>
                                <span class="font-bold">Subject Matter.</span>The subject matter of this data sharing
                                between the Data Provider and the Data Recipient concerns a particular dataset and the
                                data that it contains, being {{ placeholders.dataDescription }} (hereinafter
                                collectively: ‘Data Set’).
                            </p>
                            <p>
                                <span class="font-bold">Scope and Purpose(s) of Sharing of the Data Set.</span> The
                                subject to the data-sharing arrangement formed on the PISTIS Data Marketplace between
                                the Data Provider and the Data Recipient, the Data Provider hereby grants the Data
                                Recipient an {{ placeholders.exclusiveness }} , {{ placeholders.region }} ,
                                {{ placeholders.transferable }} , {{ placeholders.durationText }} license to access,
                                copy and process the Data Set for the following purpose(s) (hereinafter ‘Permitted
                                Purposes’):
                            </p>

                            <ul class="flex flex-col gap-2 list-disc pl-6">
                                <li>
                                    internally, including but not limited to, for conducting demos, research and
                                    development purposes;
                                </li>
                                <li>
                                    to develop software, data analytics or other forms and applications of automated
                                    processes, or machine learning or artificial intelligence;
                                </li>
                                <li>
                                    to generate derived works, recommendations and analyses, including by using models
                                    and algorithms, the results;
                                </li>
                                <li>
                                    to incorporate insubstantial portions, extracts, abstracts or summaries of the Data
                                    Set into analyses, presentations or tools used for commercial purposes;
                                </li>
                                <li>
                                    to store the Data Set in databases hosted internally or on third party hosted
                                    platforms;
                                </li>
                                <li>{{ placeholders.otherPurposes }}</li>
                            </ul>

                            <p>
                                The Data Set shall not be processed for purposes that have not explicitly specified as
                                Permitted Purposes. Any other rights of the Data Provider in or to the Data Set not
                                granted to the Data Recipient are expressly reserved by the Data Provider.
                            </p>

                            <p>
                                <span class="font-bold">Derivative Works.</span>The Data Provider acknowledges and
                                agrees that the Data Recipient shall retain ownership of all intellectual property right
                                in the derivative works of the Data Set. For the avoidance of doubt, in case the Data
                                Set is modified only in minor ways and used for substituting the original Data Set, it
                                shall not be regarded as derived material or work, and remains under the restrictions
                                set out for the Data Set.
                            </p>
                            <p>
                                <span class="font-bold">Representations and Warranties.</span>
                                The Data Set is provided as checked-in by the Data Provider on the PISTIS Data
                                Marketplace, without any warranty of any type, either express or implied, including
                                without limitation, any warranty of merchantability or fitness for a particular purpose
                                or use, title or otherwise, and without any warranty regarding the suitability of the
                                Data Set, whether it operates uninterrupted or error-free, or whether errors or other
                                defects, if any, shall be corrected.
                            </p>
                            <p>
                                <span class="font-bold">Effective Date.</span>
                                The terms, including the license and right to use the Data Set granted under these
                                terms, shall become effective and applicable to the data-sharing arrangement between the
                                Data Provider and the Data Recipient upon the Data Recipient’s acceptance of these terms
                                and conditions. The Data Recipient’s acceptance of the terms shall be digitally
                                exercised and recorded on the PISTIS Data Marketplace, and the date of the acceptance
                                shall be deemed as the effective date of these terms and conditions (hereinafter
                                ‘Effective Date’).
                            </p>
                            <p>
                                <span class="font-bold">Delivery.</span>
                                The access to the Data Set will be granted to the Data Recipient upon the receipt of the
                                payment of the Fee as agreed herein.
                            </p>
                            <p>
                                <span class="font-bold">Term</span>
                                These terms and the license granted herein, shall be valid and
                                {{ placeholders.terms.text1 }} and shall be automatically renewed for additional term of
                                {{ placeholders.terms.text2 }} unless either Party provides the other with written
                                notice not to renew at least {{ placeholders.terms.text3 }} days prior to the expiration
                                date of the current term.
                            </p>
                            <p>
                                <span class="font-bold">Termination.</span>
                                Either Party may terminate their data-sharing arrangement immediate upon written notice
                                if other Party is in material breach of these terms and if such breach is that is not
                                cured within
                                {{ placeholders.terminationTerm }} days after being notified of the breach. Furthermore,
                                the Data Provider may terminate the data-sharing arrangement or provision of the Data
                                Set on the PISTIS Data Marketplace upon reasonable prior written notice to the Data
                                Recipient if the Data Provider’s rights to material portions of the Data Set or data
                                involved in the Data Set becomes unavailable provided that the Data Provider shall
                                provide a pro-rated refund to Data Recipient for the remainder of the then-current term.
                            </p>
                            <p>
                                <span class="font-bold">Consequences of Termination.</span>
                                In case of termination, the access to, provision and availability of the Data Set on the
                                PISTIS Data Marketplace will automatically terminate without further action by either
                                party. Upon termination, the Data Recipient shall destroy all copies of the Data Set
                                within the Data Recipient’s possession or control and all of Data Recipient’s rights in
                                and the Data Set. Termination shall not affect Data Recipient’s obligation to pay all
                                fees due prior to termination, and termination shall not relieve Data Recipient of any
                                liability for breach of these terms.
                            </p>
                            <p>
                                <span class="font-bold">Fees and Payment Terms.</span>
                                <span class="underline">OPTION 1:</span> The Parties agree on that the Data Recipient
                                shall pay the Data Provider {{ placeholders.price }} (‘Fee’) for the license to access,
                                copy and process the Data Set as defined herein on the Effective date. The Fee is
                                exclusive of VAT or local sales tax or any other applicable taxes.
                                <span class="underline">OPTION 2:</span> The Parties agree on that Data Recipient shall
                                pay Data Provider {{ placeholders.price }}
                                (‘Subscription Fee’) on monthly basis, in advance, starting from the Effective Date and
                                recurring on the same date of every following month, for the license to access, copy and
                                process the Data Set as defined herein during the term of the data-sharing agreement. In
                                case when the Effective Date corresponds 31st or 29th day of a month, the Subscription
                                Fee becomes due and payable on the first day of every following month. The access to the
                                Data Set will be granted to Data Recipient upon the receipt of the first payment on the
                                PISTIS Data Marketplace. The Subscription Fee is exclusive of VAT or local sales tax or
                                any other applicable taxes.
                            </p>
                            <p>
                                <span class="font-bold">Protection of Personal Data.</span>
                                <span class="underline">OPTION 1:</span>The Data Set does not include personal data.
                                <span class="underline">OPTION 2:</span>
                                The Data Set includes personal data, and the related data processing is subject to the
                                following: {{ placeholders.personalDataText
                                }}<span class="underline">OPTION 3: [*].</span>
                            </p>
                            <p>
                                <span class="font-bold">Miscellaneous.</span>
                                For the avoidance of doubt and given that this data sharing transaction takes place
                                between PISTIS project partners as part of the PISTIS project, each Party acknowledges
                                that the PISTIS Grant Agreement (‘GA’) and the PISTIS Consortium Agreement (‘CA’) is
                                applicable to this data-sharing arrangement in general, and the following rights and
                                obligations therein in particular, without limitation:
                            </p>
                            <ul class="flex flex-col gap-2 list-disc pl-6">
                                <li>Proper implementation of the Action;</li>
                                <li>
                                    Use restrictions, confidentiality, non-disclosure, data protection and security;
                                </li>
                                <li>Ethics and values;</li>
                                <li>Results, (joint)ownership and dissemination;</li>
                                <li>Information obligations, and;</li>
                                <li>Applicable law and forum,</li>
                            </ul>
                            <p>
                                related to which Parties herewith reconfirm to each having put and for the term of this
                                data-sharing arrangement, the CA and GA remaining in place proportionate and otherwise
                                appropriate organisational, operational and technical measures. In case of any
                                inconsistency or conflict between these terms and the GA or CA, the GA and CA shall
                                prevail.
                            </p>
                        </div>
                    </div>
                    <UButton class="mt-6" @click="download()">Download pdf</UButton>
                    <!-- End of Document -->
                </div>
            </template>
        </UAccordion>
    </UCard>
</template>
