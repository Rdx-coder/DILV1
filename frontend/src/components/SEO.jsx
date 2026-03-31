import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  canonical,
  jsonLd,
  noIndex = false,
  noFollow = false,
  keywords,
  siteName = 'Dangi Innovation Lab',
  locale = 'en_US',
  twitterHandle = '',
  author,
  publishedTime,
  modifiedTime
}) => {
  const safeTitle = title || 'Dangi Innovation Lab';
  const safeDescription = description || 'Dangi Innovation Lab official platform';
  const robotsContent = `${noIndex ? 'noindex' : 'index'},${noFollow ? 'nofollow' : 'follow'},max-image-preview:large,max-snippet:-1,max-video-preview:-1`;

  return (
    <Helmet>
      <html lang="en" />
      <title>{safeTitle}</title>
      <meta name="description" content={safeDescription} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      {author ? <meta name="author" content={author} /> : null}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={safeDescription} />
      {image ? <meta property="og:image" content={image} /> : null}
      {image ? <meta property="og:image:alt" content={safeTitle} /> : null}
      {url ? <meta property="og:url" content={url} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {canonical ? <link rel="alternate" hrefLang="en" href={canonical} /> : null}
      {canonical ? <link rel="alternate" hrefLang="x-default" href={canonical} /> : null}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={safeTitle} />
      <meta name="twitter:description" content={safeDescription} />
      {twitterHandle ? <meta name="twitter:site" content={twitterHandle} /> : null}
      {image ? <meta name="twitter:image" content={image} /> : null}
      {type === 'article' && publishedTime ? <meta property="article:published_time" content={publishedTime} /> : null}
      {type === 'article' && modifiedTime ? <meta property="article:modified_time" content={modifiedTime} /> : null}
      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
};

export default SEO;
