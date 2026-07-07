export const licenses = [
    {
        code: 'PISTIS License',
        label: 'Custom PISTIS Licence',
        description: '',
    },
    {
        code: 'NFT License',
        label: 'NFT Licence',
        description: ``,
    },
    {
        code: 'CC0',
        label: 'Creative Commons CC0 1.0 Universal',
        description:
            'The person who associated a work with CC0 1.0 has dedicated the work to the public domain by waiving all of his or her rights to the work worldwide under copyright law, including all related and neighboring rights, to the extent allowed by law. One can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.',
        numOfResell: undefined,
        numOfShare: undefined,
        canEdit: true,
    },
    {
        code: 'CC BY',
        label: 'Creative Commons Attribution 4.0 International',
        description:
            "This licence lets others distribute, remix, tweak, and build upon the author's work, even commercially, as long as they credit the author for the original creation. This is the most accommodating of licences offered. Recommended for maximum dissemination and use of licenced materials.",
        numOfResell: undefined,
        numOfShare: undefined,
        canEdit: true,
    },
    {
        code: 'CC BY-NC',
        label: 'Creative Commons Attribution–NonCommercial 4.0 International',
        description:
            "This licence lets others remix, tweak, and build upon the author's work non-commercially, and although their new works must also acknowledge the author and be non-commercial, they don’t have to licence their derivative works on the same terms.",
        numOfResell: 0,
        numOfShare: undefined,
        canEdit: true,
    },
].map(
    (object: {
        code: string;
        label: string;
        description: string;
        numOfResell?: number;
        numOfShare?: number;
        canEdit?: boolean;
    }) => ({
        code: object.code,
        label: object.code + ' - ' + object.label,
        description: object.description,
        numOfResell: object.numOfResell,
        numOfShare: object.numOfShare,
        canEdit: object.canEdit,
    }),
);

export enum LicenseCode {
    PISTIS = 'PISTIS License',
    NFT = 'NFT License',
    CC0 = 'CC0',
    CCBY = 'CC BY',
    CCBYNC = 'CC BY-NC',
}

export enum durations {
    ONE_MONTH = 30,
    THREE_MONTHS = 90,
    SIX_MONTHS = 180,
    ONE_YEAR = 365,
    PERPETUAL = 'perpetual',
    PERPETUAL_REVOCABLE = 'perpetual revocable',
}
