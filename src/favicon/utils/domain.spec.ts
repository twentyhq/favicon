import { Domain } from './domain';

describe('Domain', () => {
  describe('checkDomainIsValid', () => {
    it.each([
      'example.com',
      'api.example.com',
      'bbc.co.uk',
      'plc.autotrader.co.uk',
      'corporate.sainsburys.co.uk',
      'business.ee.co.uk',
      'corporate.lidl.co.uk',
    ])('accepts the valid domain %s', (domainName) => {
      expect(Domain.checkDomainIsValid(domainName)).toBe(true);
    });

    it.each([
      'localhost',
      '127.0.0.1',
      '-example.com',
      'example-.com',
      'example..com',
      'example_domain.com',
      'example.123',
    ])('rejects the invalid domain %s', (domainName) => {
      expect(Domain.checkDomainIsValid(domainName)).toBe(false);
    });
  });
});
