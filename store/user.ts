import { defineStore } from 'pinia';

interface UserDetails {
    fullName: string;
    username: string;
    email: string;
}

export const useUserStore = defineStore('UserStore', {
    state: () => ({
        user: {
            fullName: '',
            username: '',
            email: '',
            walletAlias: '',
        },
    }),
    getters: {
        getUser(): UserDetails {
            return this.user;
        },
        getFullName(): string {
            return this.user.fullName;
        },
        getUsername(): string {
            return this.user.username;
        },
        getEmail(): string {
            return this.user.email;
        },
        getWalletAlias(): string {
            return this.user.walletAlias;
        },
    },
    actions: {
        setFullName(name: string): void {
            this.user.fullName = name;
        },
        setUsername(username: string): void {
            this.user.username = username;
        },
        setEmail(email: string): void {
            this.user.email = email;
        },
        setWalletAlias(walletAlias: string): void {
            this.user.walletAlias = walletAlias;
        },
        resetUser(): void {
            this.user = {
                fullName: '',
                username: '',
                email: '',
                walletAlias: '',
            };
        },
    },
});
