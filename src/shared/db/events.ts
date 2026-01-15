export type CarPoolEventTypes = {
    // EVENT: PROFILE UPDATED
    'user:profile-updated': (data : {userId: string}) => void;
}