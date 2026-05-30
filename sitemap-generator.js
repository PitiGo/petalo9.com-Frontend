const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream, existsSync, mkdirSync } = require('fs');
const { dirname } = require('path');
const axios = require('axios');
const { Readable } = require('stream');

const API_URL = process.env.REACT_APP_API_URL || 'https://api.dantecollazzi.com';
const SITEMAP_OUTPUT = process.env.SITEMAP_OUTPUT || './build/sitemap.xml';

async function generateSitemap() {
    const links = [
        { url: '/', changefreq: 'daily', priority: 1.0 },
        { url: '/blog', changefreq: 'weekly', priority: 0.8 },
        { url: '/games', changefreq: 'monthly', priority: 0.7 },
        { url: '/tools', changefreq: 'monthly', priority: 0.7 },
        { url: '/about', changefreq: 'monthly', priority: 0.7 },
        { url: '/contact', changefreq: 'monthly', priority: 0.6 },
    ];

    try {
        const postsUrl = `${API_URL}/api/posts`;
        console.log('Fetching blog posts from:', postsUrl);
        const response = await axios.get(postsUrl, {
            params: { page: 1, pageSize: 500 },
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' },
        });

        const posts = response.data?.posts;
        if (Array.isArray(posts)) {
            console.log(`Found ${posts.length} blog posts to add to sitemap`);
            posts.forEach(post => {
                links.push({
                    url: `/blog/${post.id}`,
                    changefreq: 'yearly',
                    priority: 0.9,
                });
            });
        } else {
            console.log('No posts found or invalid response format');
        }
    } catch (error) {
        console.log('Error fetching blog posts for sitemap:', error.message);
        console.log('Continuing with static pages only...');
    }

    try {
        const outDir = dirname(SITEMAP_OUTPUT);
        if (!existsSync(outDir)) {
            mkdirSync(outDir, { recursive: true });
        }

        const stream = new SitemapStream({ hostname: 'https://dantecollazzi.com' });
        const xmlStream = Readable.from(links).pipe(stream);
        const sitemap = await streamToPromise(xmlStream).then((data) => data.toString());

        createWriteStream(SITEMAP_OUTPUT).write(sitemap);
        console.log(`Sitemap generated successfully with ${links.length} URLs!`);
        console.log(`Sitemap saved to: ${SITEMAP_OUTPUT}`);
    } catch (error) {
        console.error('Error generating sitemap:', error);
        process.exit(1);
    }
}

generateSitemap();
