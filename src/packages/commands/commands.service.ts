import { Command, CommandRunner, Option } from 'nest-commander';
import { FaviconService } from 'src/favicon/favicon.service';
import { Domain } from 'src/favicon/utils/domain';

interface BasicCommandOptions {
  refresh?: string;
  size?: number;
}

@Command({ name: 'domain', description: 'A domain util' })
export class DomainCommandService extends CommandRunner {
  constructor(private readonly faviconService: FaviconService) {
    super();
  }

  async run(
    passedParam: string[],
    options?: BasicCommandOptions,
  ): Promise<void> {
    this.refreshDomain(options.refresh, options.size, passedParam);
  }

  @Option({
    flags: '-r, --refresh [domain]',
    description: 'Refresh a domain',
  })
  parseDomain(val: string): string {
    return val;
  }

  @Option({
    flags: '-s, --size [size]',
    description: 'Refresh a domain',
  })
  parseSize(val: string): number {
    return Number(val);
  }

  async refreshDomain(
    domainName: string,
    _size?: number,
    _param?: string[],
  ): Promise<void> {
    try {
      if (!Domain.checkDomainIsValid(domainName)) {
        throw new Error('Invalid domain name provided');
      }

      await this.faviconService.storeFavicon(domainName);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}
