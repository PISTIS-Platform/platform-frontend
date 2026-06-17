const {
    public: { factoryIban, organisationFullname },
} = useRuntimeConfig();

const ISO20022_URL = 'https://pistis-sc1.iccs.gr/iso20022/api/Transaction';

const normalizeIban = (iban: string) => iban.replace(/\s+/g, '').toUpperCase();

export default defineEventHandler(async (event) => {
    const { amount, iban } = await readBody<{ amount: string | number; iban: string }>(event);

    if (!amount || !iban) {
        throw createError({ statusCode: 400, statusMessage: 'amount and iban are required' });
    }

    const now = new Date();
    const creationDateTime = now.toISOString();
    const executionDate = creationDateTime.slice(0, 10);
    const reasoning = `PISTIS withdraw from ${organisationFullname}`;

    // debtor (DbtrAcct) = platform factory IBAN (from env), creditor (CdtrAcct) = user's IBAN from the form.
    const body = `<?xml version="1.0" encoding="utf-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.12" xsi:schemaLocation="urn:iso:std:iso:20022:tech:xsd:pain.001.001.12 schema.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <CstmrCdtTrfInitn>
        <GrpHdr>
            <MsgId>${``}</MsgId>
            <CreDtTm>${creationDateTime}</CreDtTm>
            <NbOfTxs>1</NbOfTxs>
            <InitgPty />
        </GrpHdr>
        <PmtInf>
            <PmtInfId>${``}</PmtInfId>
            <PmtMtd>TRA</PmtMtd>
            <ReqdExctnDt>
                <Dt>${executionDate}</Dt>
            </ReqdExctnDt>
            <Dbtr />
            <DbtrAcct>
                <Id>
                    <IBAN>${normalizeIban(factoryIban)}</IBAN>
                </Id>
            </DbtrAcct>
            <DbtrAgt>
                <FinInstnId />
            </DbtrAgt>
            <CdtTrfTxInf>
                <PmtId>
                    <EndToEndId>${``}</EndToEndId>
                </PmtId>
                <Amt><InstdAmt Ccy="EUR">${amount}</InstdAmt></Amt>
                <CdtrAcct>
                    <Id>
                        <IBAN>${normalizeIban(iban)}</IBAN>
                    </Id>
                </CdtrAcct>
                <Purp>
                    <Prtry>${reasoning}</Prtry>
                </Purp>
            </CdtTrfTxInf>
        </PmtInf>
    </CstmrCdtTrfInitn>
</Document>`;

    return $fetch(ISO20022_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body,
    });
});
