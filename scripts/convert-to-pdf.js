// Script to convert HTML guide to PDF using Puppeteer
const puppeteer = require('puppeteer');
const path = require('path');

async function convertToPDF() {
  console.log('🚀 Starting PDF conversion...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const htmlPath = path.join(__dirname, '..', 'PROJECT_INTERNAL_GUIDE.html');
  const pdfPath = path.join(__dirname, '..', 'PROJECT_INTERNAL_GUIDE.pdf');

  console.log(`📄 Loading HTML from: ${htmlPath}`);

  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0'
  });

  console.log('📝 Generating PDF...');

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `
  });

  await browser.close();

  console.log(`✅ PDF generated successfully: ${pdfPath}`);
  console.log(`📦 File size: ${require('fs').statSync(pdfPath).size / 1024 / 1024} MB`);
}

convertToPDF().catch(error => {
  console.error('❌ Error generating PDF:', error);
  process.exit(1);
});
