export type NotificationAction = {
    action: 'getAllNotifications' | 'markAsRead' | 'hide';
    notificationId?: string;
    userId: string | number;
};
