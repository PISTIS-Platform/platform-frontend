export type Message = {
    id: string | number;
    userId: string | number;
    organizationId: string | number;
    message: string;
    isHidden: boolean;
    createdAt: Date | string;
    readAt: null | Date | string;
};
