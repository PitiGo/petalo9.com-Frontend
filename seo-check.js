const puppeteer = require('puppeteer');

async function checkSEO(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await page.goto(url);

        const seoData = await page.evaluate(() => {
            return {
                title: document.querySelector('title')?.textContent || 'No title found',
                description: document.querySelector('meta[name="description"]')?.getAttribute('content') || 'No description found',
                ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || 'No OG title found',
                ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || 'No OG description found',
                twitterTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || 'No Twitter title found',
                url: window.location.href
            };
        });

        console.log(`\n🔍 SEO Check for: ${url}`);
        console.log('='.repeat(50));
        console.log(`📄 Title: ${seoData.title}`);
        console.log(`📝 Description: ${seoData.description}`);
        console.log(`📘 OG Title: ${seoData.ogTitle}`);
        console.log(`📘 OG Description: ${seoData.ogDescription}`);
        console.log(`🐦 Twitter Title: ${seoData.twitterTitle}`);
        console.log('='.repeat(50));

        return seoData;
    } catch (error) {
        console.error(`Error checking ${url}:`, error);
    } finally {
        await browser.close();
    }
}

async function checkAllPages() {
    const baseUrl = 'http://localhost:3000'; // Cambia esto por tu URL
    const pages = [
        '',
        '/about',
        '/blog',
        '/contact',
        '/games'
    ];

    console.log('🚀 Starting SEO verification...\n');

    for (const page of pages) {
        await checkSEO(`${baseUrl}${page}`);
    }

    console.log('\n✅ SEO verification complete!');
}

// Si se ejecuta directamente
if (require.main === module) {
    checkAllPages().catch(console.error);
}

module.exports = { checkSEO, checkAllPages };
