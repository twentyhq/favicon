export interface UrlFetcher {
  fetchFaviconUrls(subDomainName: string): Promise<Array<string>>;
}
