const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
erroneous = []
async function downloadFile(url, destination) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        await fs.writeFile(destination, buffer);
        // console.log(`Downloaded: ${url}`);
    } catch (error) {
        console.error(`Error downloading ${url}: ${error.message}`);
       erroneous.push(url);
    }
}


async function downloadFiles(urls, batchSize) {
    const batches = [];

    // Use Set to filter out duplicates
    const uniqueUrls = [...new Set(urls)];

    // Split the unique URLs into batches
    for (let i = 0; i < uniqueUrls.length; i += batchSize) {
        batches.push(uniqueUrls.slice(i, i + batchSize));
    }

    // Download files in parallel for each batch
    for (const [index, batch] of batches.entries()) {

        const promises = batch.map(async (url) => {
            const fileName = path.basename(url);
            const destination = path.join(__dirname, 'downloads', fileName);
            await downloadFile(url, destination);
        });

        console.log("downloaded ", batchSize * (index+1),  "/",  uniqueUrls.length)

        await Promise.all(promises);
    }
}

async function main() {
    try {
        // Read URLs from src.json and filter duplicates using Set
        const inputFilePath = path.join(__dirname, 'src.json');
        const inputJson = require(inputFilePath);

        // Specify the batch size (adjust as needed)
        const batchSize = 5;

        // Create a downloads folder if it doesn't exist
        const downloadsFolder = path.join(__dirname, 'downloads');
        await fs.mkdir(downloadsFolder, { recursive: true });

        // Download files in bulk, filtering duplicates
        await downloadFiles(inputJson, batchSize);

        console.log('All files downloaded successfully.');

        console.log('erroneous', erroneous)

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the main function
main();
