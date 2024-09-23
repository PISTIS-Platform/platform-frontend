<script setup lang="ts">
//monetizationDetails
import dayjs from 'dayjs';

const props = defineProps({
    monetizationDetails: {
        type: Object,
        required: true,
    },
    assetOfferingDetails: {
        type: Object,
    },
});

const emit = defineEmits(['update:contract-terms']);

const termsItem = ref([
    {
        icon: 'i-heroicons-information-circle',
        label: 'Terms and Conditions',
        slot: 'terms-item',
        defaultOpen: true,
    },
]);

const recurrentPaymentText = computed(() =>
    props.monetizationDetails.subscriptionFrequency === 'annual' ? 'year' : 'month',
);

const htmlContent = ref<HTMLElement>();

watch(htmlContent, () => {
    const termsDocContent = htmlContent?.value?.innerHTML || '';

    emit('update:contract-terms', btoa(encodeURIComponent(termsDocContent)));
});

//TODO:: replace dummy data once more info is available
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
        price: `${props.monetizationDetails?.price || ''} STC`,
        personalDataText:
            'In the event that the dataset contains personal data including pseudonymised personal data, the Data Provider is advised to consider defining the terms and conditions for the transfer and processing of personal data]',
        extraTerms: props.monetizationDetails?.extraTerms || '',
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
                        <!-- PISTIS License start-->
                        <div
                            v-show="monetizationDetails.license === 'PISTIS License'"
                            class="prose lg:prose-sm prose-h2:text-center max-w-full"
                        >
                            <h2>EXPLANATORY NOTES</h2>
                            <h2>THE GENERIC TERMS OF DATA SHARING ON PISTIS DATA MARKETPLACE</h2>

                            <h3>1. WHAT & WHY</h3>

                            <p>
                                <span>a.</span>
                                Where the Grant Agreement (‘GA’) and Consortium Agreement (‘CA’) of Project PISTIS
                                (‘Project’) aims to brings forward a reference federated data sharing/trading and
                                monetisation platform for secure, trusted and controlled exchange and usage of
                                proprietary data assets and data-driven intelligence, there is a need to further detail
                                and practically organise certain generic terms for such sharing and related
                                collaboration between the project partners on the PISTIS Data Marketplace under a
                                non-exhaustive set of suggested, generic terms and options that the partners can tailor,
                                amend, and negotiate out during the demonstrations.
                            </p>

                            <h3>2. FOR WHOM</h3>

                            <p>
                                <span>a.</span>
                                The generic terms of data sharing are prepared for the PISTIS demonstrator partners
                                solely to be used for the demonstration of business-to-business data transactions on the
                                BETA version of the PISTIS Data Marketplace, which is still under development and
                                testing.
                            </p>

                            <p>
                                <span>b.</span>
                                These terms of data sharing provide explanations and options only for informational
                                purposes, and the Project demonstrator partners are free to change the terms as they
                                deem appropriate for their use cases. Under no circumstance, the Project demonstrator
                                partners are obliged to use these terms for their data sharing arrangement. These
                                explanations and options aim to enable and facilitate concrete data-sharing arrangements
                                and operations between the demonstrator partners in their various roles, such as data
                                provider, data recipient, or otherwise.
                            </p>

                            <p>
                                <span>c.</span>
                                The users of these terms are advised to consult their legal advisors for further advice
                                and assistance before executing a data-sharing transaction on the PISTIS Data
                                Marketplace.
                            </p>

                            <h3>3. HOW</h3>

                            <p>
                                <span>a.</span>
                                These terms are part of the seven (7) elements of the PISTIS data sharing contract
                                framework, namely, matchmaking of users, data check-in and asset description, detailed
                                overview of dataset, analysis of data usage and license, data valuation, determining
                                data sharing terms including selection of pre-defined terms, and execution of
                                transactions including provision of payment, delivery of dataset. This means that these
                                terms can be used and become part of any data-sharing arrangements and agreements that
                                will be formed on the PISTIS Data Marketplace between Data Providers and Data
                                Recipients.
                            </p>

                            <p>
                                <span>b.</span>
                                These terms are generic. This means that it is a set of non-exhaustive recommended terms
                                to be used for data sharing transactions but does not include specific arrangements that
                                may be relevant between certain Data Providers and Data Recipients. Given that the data
                                sharing transactions will be carried out in different sectors, such as mobility, traffic
                                safety, energy, etc., and become subject to national jurisdictions, the Project
                                demonstrator partners are advised to consider the sector-specific legal requirements
                                applicable to their use cases in the relevant national jurisdictions. Data Provider and
                                Data Recipient are responsible for adding such arrangements to these terms.
                            </p>

                            <p>
                                <span>c.</span>
                                The PISTIS consortium will not be liable for any loss, whether direct, indirect,
                                special, or consequential, suffered by any party due to the use of these generic terms.
                            </p>

                            <h2>PISTIS GENERIC TERMS OF DATA SHARING</h2>

                            <p>
                                <strong>Subject Matter.</strong>The subject matter of this data sharing between the Data
                                Provider and the Data Recipient concerns a particular dataset and the data that it
                                contains, being "<span class="italic">{{ assetOfferingDetails?.title }}</span
                                >" (hereinafter collectively: ‘Data Set’).
                            </p>
                            <p>
                                <strong>Scope and Purpose(s) of Sharing of the Data Set.</strong> The subject to the
                                data-sharing arrangement formed on the PISTIS Data Marketplace between the Data Provider
                                and the Data Recipient, the Data Provider hereby grants the Data Recipient a(n)
                                {{ monetizationDetails.isExclusive ? 'exclusive' : 'non-exclusive' }},
                                {{
                                    monetizationDetails.region
                                        ? `available in ${monetizationDetails.region}`
                                        : 'available worldwide'
                                }}, {{ monetizationDetails.transferable }},
                                {{
                                    monetizationDetails.termDate
                                        ? `valid until ${dayjs(monetizationDetails.termDate).format('DD MMMM YYYY')}`
                                        : 'perpetual'
                                }}
                                license to access, copy and process the Data Set for the following purpose(s)
                                (hereinafter ‘Permitted Purposes’):
                            </p>

                            <ul>
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
                                <li>{{ monetizationDetails.extraTerms }}</li>
                            </ul>

                            <p>
                                The Data Set shall not be processed for purposes that have not explicitly specified as
                                Permitted Purposes. Any other rights of the Data Provider in or to the Data Set not
                                granted to the Data Recipient are expressly reserved by the Data Provider.
                            </p>

                            <p>
                                <strong>Derivative Works.</strong>
                                The Data Provider acknowledges and agrees that the Data Recipient shall retain ownership
                                of all intellectual property right in the derivative works of the Data Set. For the
                                avoidance of doubt, in case the Data Set is modified only in minor ways and used for
                                substituting the original Data Set, it shall not be regarded as derived material or
                                work, and remains under the restrictions set out for the Data Set.
                            </p>
                            <p>
                                <strong>Representations and Warranties.</strong>
                                The Data Set is provided as checked-in by the Data Provider on the PISTIS Data
                                Marketplace, without any warranty of any type, either express or implied, including
                                without limitation, any warranty of merchantability or fitness for a particular purpose
                                or use, title or otherwise, and without any warranty regarding the suitability of the
                                Data Set, whether it operates uninterrupted or error-free, or whether errors or other
                                defects, if any, shall be corrected.
                            </p>
                            <p>
                                <strong>Effective Date.</strong>
                                The terms, including the license and right to use the Data Set granted under these
                                terms, shall become effective and applicable to the data-sharing arrangement between the
                                Data Provider and the Data Recipient upon the Data Recipient’s acceptance of these terms
                                and conditions. The Data Recipient’s acceptance of the terms shall be digitally
                                exercised and recorded on the PISTIS Data Marketplace, and the date of the acceptance
                                shall be deemed as the effective date of these terms and conditions (hereinafter
                                ‘Effective Date’).
                            </p>
                            <p>
                                <strong>Delivery.</strong>
                                The access to the Data Set will be granted to the Data Recipient upon the receipt of the
                                payment of the Fee as agreed herein.
                            </p>
                            <p>
                                <strong>Term.</strong>
                                These terms and the license granted herein, shall be valid
                                {{
                                    monetizationDetails.termDate
                                        ? `until ${dayjs(monetizationDetails.termDate).format('DD MMMM YYYY')}`
                                        : 'perpetually'
                                }}
                                and shall be automatically renewed for additional term of
                                {{ monetizationDetails.additionalRenewalTerms }} unless either Party provides the other
                                with written notice not to renew at least {{ monetizationDetails.nonRenewalDays }} days
                                prior to the expiration date of the current term.
                            </p>
                            <p>
                                <strong>Termination.</strong>
                                Either Party may terminate their data-sharing arrangement immediate upon written notice
                                if other Party is in material breach of these terms and if such breach is that is not
                                cured within
                                {{ monetizationDetails.contractBreachDays }} days after being notified of the breach.
                                Furthermore, the Data Provider may terminate the data-sharing arrangement or provision
                                of the Data Set on the PISTIS Data Marketplace upon reasonable prior written notice to
                                the Data Recipient if the Data Provider’s rights to material portions of the Data Set or
                                data involved in the Data Set becomes unavailable provided that the Data Provider shall
                                provide a pro-rated refund to Data Recipient for the remainder of the then-current term.
                            </p>
                            <p>
                                <strong>Consequences of Termination.</strong>
                                In case of termination, the access to, provision and availability of the Data Set on the
                                PISTIS Data Marketplace will automatically terminate without further action by either
                                party. Upon termination, the Data Recipient shall destroy all copies of the Data Set
                                within the Data Recipient’s possession or control and all of Data Recipient’s rights in
                                and the Data Set. Termination shall not affect Data Recipient’s obligation to pay all
                                fees due prior to termination, and termination shall not relieve Data Recipient of any
                                liability for breach of these terms.
                            </p>
                            <p>
                                <strong>Fees and Payment Terms.</strong>
                                <!--OPTION  1-->
                                <span v-if="monetizationDetails.type === 'one-off'"
                                    >The Parties agree on that the Data Recipient shall pay the Data Provider
                                    {{ monetizationDetails.price }} STC (‘Fee’) for the license to access, copy and
                                    process the Data Set as defined herein on the Effective date. The Fee is exclusive
                                    of VAT or local sales tax or any other applicable taxes.</span
                                >

                                <!-- OPTION 2 -->
                                <span v-if="monetizationDetails.type === 'subscription'">
                                    The Parties agree on that Data Recipient shall pay Data Provider
                                    {{ monetizationDetails.price }} STC (‘Subscription Fee’) on a(n)
                                    {{ monetizationDetails.subscriptionFrequency }} basis, in advance, starting from the
                                    Effective Date and recurring on the same date of every following
                                    {{ recurrentPaymentText }}, for the license to access, copy and process the Data Set
                                    as defined herein during the term of the data-sharing agreement.
                                    <span v-if="monetizationDetails.subscriptionFrequency === 'monthly'"
                                        >In case when the Effective Date corresponds 31st or 29th day of a month, the
                                        Subscription Fee becomes due and payable on the first day of every following
                                        month.</span
                                    >
                                    The access to the Data Set will be granted to Data Recipient upon the receipt of the
                                    first payment on the PISTIS Data Marketplace. The Subscription Fee is exclusive of
                                    VAT or local sales tax or any other applicable taxes.
                                </span>
                            </p>
                            <p>
                                <strong>Protection of Personal Data.</strong>
                                &nbsp;<u>OPTION 1:</u> The Data Set does not include personal data.
                                <u>OPTION 2:</u>
                                The Data Set includes personal data, and the related data processing is subject to the
                                following:: {{ placeholders.personalDataText }}&nbsp;<u>OPTION 3: [*].</u>
                            </p>
                            <p>
                                <strong>Miscellaneous.</strong>
                                For the avoidance of doubt and given that this data sharing transaction takes place
                                between PISTIS project partners as part of the PISTIS project, each Party acknowledges
                                that the PISTIS Grant Agreement (‘GA’) and the PISTIS Consortium Agreement (‘CA’) is
                                applicable to this data-sharing arrangement in general, and the following rights and
                                obligations therein in particular, without limitation:
                            </p>
                            <ul>
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
                        <!-- PISTIS License end-->
                    </div>
                    <!-- End of Document -->
                </div>
            </template>
        </UAccordion>
    </UCard>
</template>
