export class PageNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PageNotFoundError';
  }
}
export class NetworkConnectionError extends Error {
  constructor() {
    super('Network connection error');
    this.name = 'NetworkConnectionError';
  }
}
