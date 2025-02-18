import { promises as fs } from 'fs';
import * as path from 'path';

// Types for our configuration
interface Config {
    includedExtensions: string[];
    excludedPaths: string[];
    outputFile: string;
}

// Types for file processing
interface FileEntry {
    type: 'file' | 'directory';
    name: string;
}

// Configuration object
const config: Config = {
    includedExtensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
    excludedPaths: ['node_modules', '.next', 'out', 'build', '.git'],
    outputFile: 'consolidated_repo.txt'
};

/**
 * Recursively gets all files from a directory that match our criteria
 * @param dirPath - The directory path to scan
 * @param fileList - Accumulator for recursive calls
 * @returns Promise<string[]> - Array of file paths
 */
async function getAllFiles(dirPath: string, fileList: string[] = []): Promise<string[]> {
    // Read the directory using Node.js fs module
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    // Iterate through each entry in the directory
    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        
        // Skip excluded paths (like node_modules)
        if (config.excludedPaths.some(excluded => fullPath.includes(excluded))) {
            continue;
        }

        if (item.isDirectory()) {
            // If it's a directory, recursively process it
            await getAllFiles(fullPath, fileList);
        } else {
            // For files, check if the extension is in our includedExtensions list
            const ext = path.extname(item.name);
            if (config.includedExtensions.includes(ext)) {
                fileList.push(fullPath);
            }
        }
    }

    return fileList;
}

/**
 * Main function to consolidate all files into a single output file
 * @param rootDir - The root directory to start scanning from
 */
async function consolidateFiles(rootDir: string): Promise<void> {
    try {
        console.log(`Starting consolidation from directory: ${rootDir}`);
        
        // Get all matching files
        const files = await getAllFiles(rootDir);
        
        if (files.length === 0) {
            console.warn('No matching files found!');
            return;
        }
        
        let consolidatedContent = '';
        
        // Process each file
        for (const file of files) {
            // Read the file content
            const content = await Bun.file(file).text();
            // Get the relative path for cleaner output
            const relativePath = file.replace(rootDir + '/', '');
            
            console.log(`Processing: ${relativePath}`);
            
            // Add formatted file header
            consolidatedContent += `\n\n// ===================================\n`;
            consolidatedContent += `// File: ${relativePath}\n`;
            consolidatedContent += `// ===================================\n\n`;
            consolidatedContent += content;
        }

        // Write the final consolidated content to the output file
        await Bun.write(config.outputFile, consolidatedContent);
        
        // Log success information
        console.log(`\nSuccessfully consolidated ${files.length} files into ${config.outputFile}`);
        console.log('\nProcessed files:');
        files.map(f => f.replace(rootDir + '/', '')).forEach(f => console.log(`- ${f}`));
        
    } catch (error) {
        console.error('Error consolidating files:', error);
        process.exit(1);
    }
}

/**
 * Main entry point of the script
 */
async function main() {
    try {
        // Get the directory path from command line arguments or use current directory
        const repoPath = process.argv[2] || '.';
        
        console.log('\nRepository Consolidation Tool');
        console.log('===========================');
        console.log('Config:');
        console.log(`- Including extensions: ${config.includedExtensions.join(', ')}`);
        console.log(`- Excluding paths: ${config.excludedPaths.join(', ')}`);
        console.log(`- Output file: ${config.outputFile}`);
        console.log('===========================\n');
        
        // Run the consolidation
        await consolidateFiles(repoPath);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Run the main function
main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});