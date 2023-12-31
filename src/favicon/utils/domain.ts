export class Domain {
  static checkDomainIsValid(domainName: string) {
    const domainPattern =
      /^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})$/;
    return domainPattern.test(domainName);
  }
}
