const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const axios = require('axios');
const { Readable } = require('stream');

const API_URL = process.env.REACT_APP_API_URL || 'https://dantecollazzi.com/api'; // Reemplaza con la URL de tu API de producción

async function generateSitemap() {
    const links = [
        { url: '/', changefreq: 'daily', priority: 1.0 },
        { url: '/blog', changefreq: 'weekly', priority: 0.8 },
        { url: '/games', changefreq: 'monthly', priority: 0.7 },
        { url: '/tools', changefreq: 'monthly', priority: 0.7 },
        { url: '/about', changefreq: 'monthly', priority: 0.7 },
        { url: '/contact', changefreq: 'monthly', priority: 0.6 },
    ];

    // Obtener todos los posts del blog desde tu API
    try {
        console.log('Attempting to fetch blog posts from:', `${API_URL}/posts/all`);
        const response = await axios.get(`${API_URL}/posts/all`, {
            timeout: 10000, // 10 segundos de timeout
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.data && Array.isArray(response.data)) {
            const posts = response.data;
            console.log(`Found ${posts.length} blog posts to add to sitemap`);

            posts.forEach(post => {
                links.push({
                    url: `/blog/${post.id}`,
                    changefreq: 'yearly', // O 'monthly' si actualizas posts antiguos
                    priority: 0.9,
                    // lastmod: post.updatedAt, // Si tienes esta fecha, ¡úsala!
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
        const stream = new SitemapStream({ hostname: 'https://dantecollazzi.com' }); // Reemplaza con tu dominio
        const xmlStream = Readable.from(links).pipe(stream);

        const sitemap = await streamToPromise(xmlStream).then((data) => data.toString());

        createWriteStream('./public/sitemap.xml').write(sitemap);
        console.log(`Sitemap generated successfully with ${links.length} URLs!`);
        console.log('Sitemap saved to: ./public/sitemap.xml');
    } catch (error) {
        console.error('Error generating sitemap:', error);
        process.exit(1);
    }
}

generateSitemap();
