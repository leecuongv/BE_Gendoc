
const topdf = require('docx2pdf-converter')

const inputPath = 'D:\\Git\\GendocNodeJS\\test(6).docx';

topdf.convert(inputPath, 'D:\\Git\\GendocNodeJS\\cuonglv03(7).pdf')
console.log(inputPath)