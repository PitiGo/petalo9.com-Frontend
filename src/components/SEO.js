import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type, imageUrl, url }) => {
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      
      {/* Open Graph tags for social media */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type || 'website'} />
      <meta property="og:url" content={url || window.location.href} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      
      {/* Twitter Card tags */}
      <meta name="twitter:creator" content={name || 'Dante Collazzi'} />
      <meta name="twitter:card" content={type === 'article' ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
    </Helmet>
  );
};

export default SEO;
