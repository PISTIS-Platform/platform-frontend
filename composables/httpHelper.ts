import { HttpCode } from '@/enums/httpCode';

export const useHttpHelper = () => {
    const isSuccessResponse = (statusNum: number) => {
        return statusNum === HttpCode.HTTP_SUCCESS_200 || statusNum === HttpCode.HTTP_SUCCESS_201;
    };

    return {
        isSuccessResponse,
    };
};
