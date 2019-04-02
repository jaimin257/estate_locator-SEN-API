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
};
