export interface TransactionsType {
    incoming: WalletTransaction[];
    outgoing: WalletTransaction[];
}

export interface WalletTransaction {
    payload: {
        Basic: {
            amount: number;
            recipient_address: string;
            sender_address: string;
        };
    };
    transaction_id: string;
    included_at: string;
}
