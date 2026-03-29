import React from 'react';
import { useLocation } from 'react-router-dom';
import SEO from './SEO';

const routeMeta = {
  '/': {
    title: 'Dangi Innovation Lab | Home',
    description: 'Empowering the Dangi community through innovation, mentorship, education, and leadership.',
    keywords: 'Dangi Innovation Lab, innovation, mentorship, education, leadership, community'
  },
  '/about': {
    title: 'About | Dangi Innovation Lab',
    description: 'Learn about Dangi Innovation Lab, our mission, values, and global community impact.',
    keywords: 'about dangi innovation lab, mission, values, community impact'
  },
  '/programs': {
    title: 'Programs | Dangi Innovation Lab',
    description: 'Explore startup, higher education, research, and skill development programs.',
    keywords: 'innovation programs, startup support, higher education, skill development'
  },
  '/mentorship': {
    title: 'Mentorship | Dangi Innovation Lab',
    description: 'Connect with mentors and accelerate your personal and professional growth.',
    keywords: 'mentorship, career guidance, student mentoring'
  },
  '/transparency': {
    title: 'Transparency | Dangi Innovation Lab',
    description: 'View transparent reports, impact metrics, and accountability updates.',
    keywords: 'transparency, impact reports, accountability'
  },
  '/support': {
    title: 'Support | Dangi Innovation Lab',
    description: 'Support our initiatives and help scale impact in the Dangi community.',
    keywords: 'support dangi innovation lab, donate, partner'
  },
  '/contact': {
    title: 'Contact | Dangi Innovation Lab',
    description: 'Get in touch with Dangi Innovation Lab for partnerships, support, and queries.',
    keywords: 'contact dangi innovation lab, partnerships, support'
  }
};

const RouteSEO = () => {
  const { pathname } = useLocation();

  if (pathname.startsWith('/admin')) {
    return (
      <SEO
        title="Admin | Dangi Innovation Lab"
        description="Administrative area"
        noIndex
        noFollow
      />
    );
  }

  if (pathname === '/blog' || pathname.startsWith('/blog/')) {
    return null;
  }

  const meta = routeMeta[pathname];
  if (!meta) {
    return null;
  }

  const canonical = `${window.location.origin}${pathname}`.replace(/\/$/, '') || window.location.origin;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: meta.title,
        description: meta.description,
        url: canonical,
        inLanguage: 'en',
        isPartOf: {
          '@type': 'WebSite',
          name: 'Dangi Innovation Lab',
          url: window.location.origin
        }
      },
      ...(pathname === '/'
        ? [
            {
              '@type': 'Organization',
              name: 'Dangi Innovation Lab',
              url: window.location.origin,
              sameAs: []
            },
            {
              '@type': 'WebSite',
              name: 'Dangi Innovation Lab',
              url: window.location.origin,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${window.location.origin}/blog?search={search_term_string}`,
                'query-input': 'required name=search_term_string'
              }
            }
          ]
        : [])
    ]
  };

  return (
    <SEO
      title={meta.title}
      description={meta.description}
      keywords={meta.keywords}
      url={canonical}
      canonical={canonical}
      jsonLd={jsonLd}
    />
  );
};

export default RouteSEO;
