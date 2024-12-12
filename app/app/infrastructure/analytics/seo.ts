export function getSocialMetaTags({
  url,
  title = '',
  description = '',
  image,
  imageHasLargeSize,
}: {
  image?: string;
  url?: string;
  title: string;
  description: string;
  imageHasLargeSize?: boolean;
}) {
  const finalImage = image;

  const seo = [
    {
      title,
    },
    { name: 'description', content: description },
    {
      name: 'image',
      content: finalImage,
    },
    {
      property: 'og:url',
      content: url,
    },
    {
      property: 'og:title',
      content: title,
    },
    {
      property: 'og:description',
      content: description,
    },
    {
      property: 'og:image',
      content: finalImage,
    },
    {
      property: 'twitter:card',
      content: finalImage ? 'summary_large_image' : 'summary',
    },
  ];

  if (!image || imageHasLargeSize) {
    seo.push({
      property: 'og:image:width',
      content: '1200',
    });

    seo.push({
      property: 'og:image:height',
      content: '675',
    });
  }

  return seo.filter((seoItem) => seoItem.title || !!seoItem?.content);
}

function removeTrailingSlash(s: string) {
  return s.endsWith('/') ? s.slice(0, -1) : s;
}

export function getUrl(requestInfo?: { origin: string; path: string }) {
  return removeTrailingSlash(
    `${requestInfo?.origin ?? 'https://myqa.is'}${requestInfo?.path ?? ''}`
  );
}

export function getDomainUrl(request: Request) {
  const url = new URL(request.url);
  const host =
    request.headers.get('X-Forwarded-Host') ??
    request.headers.get('host') ??
    url.host;
  if (!host) {
    throw new Error('Could not determine domain URL.');
  }
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}
