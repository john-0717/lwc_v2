import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords: string;
  url: string;
  image?: string;
  type?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({ 
  title, 
  description, 
  keywords, 
  url, 
  image = 'https://lwc.org/og-image.jpg',
  type = 'website'
}) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="LWC - Life With Christ" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="LWC - Life With Christ" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@LWCCommunity" />
      <meta name="twitter:creator" content="@LWCCommunity" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      <meta name="application-name" content="LWC - Life With Christ" />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "LWC - Life With Christ",
          "description": "A Christ-centered spiritual community where believers gather, discuss, pray, and grow together in faith.",
          "url": "https://lwc.org",
          "logo": "https://lwc.org/logo.png",
          "sameAs": [
            "https://facebook.com/LWCCommunity",
            "https://twitter.com/LWCCommunity",
            "https://instagram.com/LWCCommunity"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-555-123-4567",
            "contactType": "customer service",
            "email": "info@lwc.org"
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Faith Street",
            "addressLocality": "Community City",
            "addressRegion": "CC",
            "postalCode": "12345",
            "addressCountry": "US"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;