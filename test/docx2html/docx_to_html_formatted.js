const mammoth = require('mammoth');
async function convertDocxToHtmlFormatted(docxPath, outputPath) {
    try {
        const options = {
            // Set options to preserve formatting
            styleMap: {
                // Map DOCX styles to HTML styles
                'Heading 1': 'h1',
                'Heading 2': 'h2',
                'Heading 3': 'h3',
                // Add more mappings for your specific formatting needs
            },
            convertInline: true, // Convert inline formatting (bold, italic, etc.)
            convertLists: true, // Convert lists (ordered and unordered)
            convertTables: true, // Convert tables
            convertImages: 'base64', // Embed images as base64 data
        };

        const { value: html } = await mammoth.convertToHtml({ path: docxPath });

        // Handle output options (optional)
        if (outputPath) {
            // Write HTML to a file (replace with your preferred file I/O method)
            const fs = require('fs');
            fs.writeFileSync(outputPath, html);
        } else {
            // Return the HTML string
            return html;
        }
    } catch (error) {
        console.error('Error converting DOCX:', error);
    }
}
const docxPath = 'D:\\Git\\GendocNodeJS\\cuonglv15.docx';
const outputPath = 'C:\\Users\\cuonglv01\\Downloads\\output3.html';

convertDocxToHtmlFormatted(docxPath, outputPath)
    .then(() => console.log('DOCX converted with formatting preserved!'))
    .catch(error => console.error('Error:', error));
