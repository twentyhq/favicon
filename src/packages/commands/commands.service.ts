import { Command, CommandRunner, Option } from 'nest-commander';
import { FaviconService } from 'src/favicon/favicon.service';
import { FileService } from 'src/favicon/file.service';
import { Domain } from 'src/favicon/utils/domain';

interface BasicCommandOptions {
  refresh?: string;
  size?: number;
  refetch?: boolean;
}

@Command({ name: 'domain', description: 'A domain util' })
export class DomainCommandService extends CommandRunner {
  constructor(
    private readonly faviconService: FaviconService,
    private readonly fileService: FileService,
  ) {
    super();
  }

  async run(
    passedParam: string[],
    options?: BasicCommandOptions,
  ): Promise<void> {
    if (options.refresh) {
      this.refreshDomain(options.refresh, options.size, passedParam);
    } else if (options.refetch) {
      this.refetchOldestDomains();
    }
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

  @Option({
    flags: '-f, --refetch [refetch]',
    description: 'Refetch oldest domain',
  })
  parseRefetch(val: string): boolean {
    return Boolean(val);
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

  async refetchOldestDomains() {
    const today = new Date();

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    const domains = (await this.fileService.listFiles(1000, oneWeekAgo)).slice(
      0,
      20,
    );

    await Promise.all(domains.map((domain) => this.refreshDomain(domain)));
  }
}
