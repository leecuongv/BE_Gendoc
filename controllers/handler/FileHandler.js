function generateSafeFilePath(directoryPath, fileName, fileExtension) {
    // Normalize the directory path to avoid directory traversal attacks
    const safeDirectoryPath = path.resolve(directoryPath);

    // Sanitize the file name to avoid unsafe characters
    const safeFileName = path.basename(fileName, path.extname(fileName)).replace(/[^a-zA-Z0-9-_]/g, '');

    // Ensure the file extension is safe
    const safeFileExtension = fileExtension.replace(/[^a-zA-Z0-9]/g, '');

    let index = 0;
    let newName = safeFileName;
    let newPath = path.join(safeDirectoryPath, `${newName}.${safeFileExtension}`);

    while (fs.existsSync(newPath)) {
        index++;
        newName = `${safeFileName}(${index})`;
        newPath = path.join(safeDirectoryPath, `${newName}.${safeFileExtension}`);
    }

    return newPath;
}
module.exports = { generateSafeFilePath }