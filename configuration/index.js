module.exports = {
    JWT_ISSUER: 'estate-locator',
    JWT_SECRET: 'love-is-fake',
    JWT_EXPIRY_TIME: 1, //unit day

    cookiesName: {
        jwt: 'jwt',
    },
    
    validityErrors: {
        permissionDenied: 'Permission Denied',
        accountAlreadyExists: 'Account Already Exists',
        invalidToken: 'Invalid Token',
        sessionExpired: 'Session Expired',
    },
    userBlockageTimeForTooManySignUpRequests: 1, // unit hour
    maximumSignUpRequestBeforeBlocking: 5,
    JWT_EXPIRY_TIME: 1, //unit day
    RESET_PASSWORD_EXPIRY_TIME: 1, //unit day
    NEWS_EXPIRY_TIME: 15, //unit day
    NOTIFICATION_EXPIRY_TIME: 15, //unit day
};
