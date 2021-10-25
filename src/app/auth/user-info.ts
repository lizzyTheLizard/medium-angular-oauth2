export class UserInfo {
    readonly id: string;
    readonly name: string;
    readonly givenName: string;
    readonly familyName: string;
    readonly email: string;
    readonly username: string;

    constructor(token: any) {
      this.id = token.sub;
      this.name = token.name;
      this.givenName = token.given_name;
      this.familyName = token.family_name;
      this.email = token.email;
      this.username = token.preferred_username;
    }
}
