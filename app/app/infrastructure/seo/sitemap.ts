import { createSitemapGenerator } from 'remix-sitemap';

export const { experimental_sitemap, robots, isSitemapUrl } =
  createSitemapGenerator({
    siteUrl: 'https://myqa.is',
    generateRobotsTxt: true,
  });
