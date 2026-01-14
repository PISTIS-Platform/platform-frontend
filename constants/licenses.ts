export const licenses = [
    {
        code: 'PISTIS License',
        label: 'Custom PISTIS Licence',
        description: '',
    },
    {
        code: 'NFT License',
        label: 'NFT Licence',
        description: `Ullamco magna officia exercitation deserunt deserunt excepteur labore sunt. Irure esse laborum consectetur minim nostrud est velit commodo irure cillum commodo cillum ullamco. Deserunt magna aute nulla elit qui cillum nisi exercitation esse duis dolor. Nisi ut eiusmod amet labore irure laboris consectetur exercitation aliquip veniam. Occaecat excepteur occaecat enim ad minim do. Reprehenderit pariatur voluptate Lorem velit nostrud irure in velit laboris dolore qui excepteur incididunt. Magna consequat labore et quis consectetur occaecat dolore.

Aliqua ipsum sunt exercitation. Enim ex ad magna. Voluptate incididunt ad aute do mollit ipsum in ex et nisi ut irure. Enim in Lorem exercitation id id veniam amet in cupidatat. Ut et esse aliqua aliquip aute incididunt culpa commodo ut aliquip occaecat dolore consequat. Consequat duis cillum non cillum deserunt exercitation ullamco non pariatur incididunt. Id qui amet tempor commodo dolor commodo labore labore esse esse ea in.

Elit proident cupidatat Lorem occaecat in magna aliquip et veniam aliqua consectetur. Anim officia id consequat Lorem ipsum ut dolore voluptate minim enim dolor magna cupidatat consectetur. Velit nostrud officia quis et amet ex occaecat non officia. Do ad sunt do laboris minim mollit. Id deserunt reprehenderit pariatur deserunt incididunt pariatur amet enim velit mollit. Dolor qui est consequat enim. Id aliqua anim non voluptate id labore ea veniam eu sint cupidatat exercitation.`,
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
