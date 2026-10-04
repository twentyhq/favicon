import { isFQDN } from 'class-validator';

export class Domain {
  static checkDomainIsValid(domainName: string) {
    return isFQDN(domainName, {
      require_tld: true,
      allow_underscores: false,
      allow_trailing_dot: false,
      allow_numeric_tld: false,
      allow_wildcard: false,
    });
  }
}
