export const environment = {
  production: true,
  oidc: {
    issuer: 'http://localhost:8080/auth/realms/Test-Application',
    redirectUri: window.location.origin + '/',
    clientId: 'angular-client',
    responseType: 'code',
    scope: 'openid profile email',
  }
};
