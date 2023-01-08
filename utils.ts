export function newUrl(url: string): string {
  let absoluteUrl;
  try {
    absoluteUrl = new URL(url);

    if (!absoluteUrl.hostname) {
      absoluteUrl = new URL("https://" + url);
    }
  } catch (error) {
    absoluteUrl = new URL("https://" + url);
  }

  return absoluteUrl.toString();
}
