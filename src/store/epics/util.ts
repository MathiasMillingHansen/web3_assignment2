export function errorMessageFromAjax(error: any): string {
  console.log(error);
  return `${error.response?.error ?? error.message ?? 'An unknown error occurred'}`;
}
