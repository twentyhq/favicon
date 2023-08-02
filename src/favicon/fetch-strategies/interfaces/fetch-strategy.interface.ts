export interface FetchStrategy {
  fetchFaviconUrls(subDomainName: string): Promise<Array<string>>;
}