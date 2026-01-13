export default interface UsageStatsData {
    title?: string;
    key: string;
    used?: number;
    total?: number;
    percentage: number | null;
    extraInfo?: {
        key: string;
        value: number;
    }[];
    measurement?: string;
}
