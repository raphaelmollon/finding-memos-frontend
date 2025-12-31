const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const ftp = require('basic-ftp');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.deploy') });

async function deploy() {
  console.log('🚀 Starting deployment process...\n');

  // Step 1: Create zip from dist folder
  console.log('📦 Creating dist.zip...');
  await createZip();
  console.log('✅ dist.zip created successfully\n');

  // Step 2: Upload to server via FTP
  console.log('📤 Uploading to server via FTP...');
  await uploadViaFTP();
  console.log('✅ Upload complete!\n');

  console.log('🎉 Deployment complete!');
  console.log('👉 Go to AdminPage and click "Deploy New Version" to finish.\n');
}

function createZip() {
  return new Promise((resolve, reject) => {
    const distPath = path.join(__dirname, '..', 'dist');
    const zipPath = path.join(__dirname, '..', 'dist.zip');

    // Remove existing zip if it exists
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`   Created ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve();
    });

    archive.on('error', reject);
    archive.pipe(output);

    // Add all files from dist/ WITHOUT the dist folder itself
    archive.directory(distPath, false);
    archive.finalize();
  });
}

async function uploadViaFTP() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      port: process.env.FTP_PORT || 21,
      secure: process.env.FTP_SECURE === 'true'
    });

    console.log('   Connected to FTP server');

    // Change to target directory
    const remotePath = process.env.FTP_REMOTE_PATH || '/finding-memos';
    await client.cd(remotePath);
    console.log(`   Changed to ${remotePath}`);

    // Upload dist.zip
    const zipPath = path.join(__dirname, '..', 'dist.zip');
    await client.uploadFrom(zipPath, 'dist.zip');
    console.log('   Uploaded dist.zip');

  } catch (err) {
    console.error('❌ FTP Error:', err.message);
    throw err;
  } finally {
    client.close();
  }
}

// Run deployment
deploy().catch(err => {
  console.error('\n❌ Deployment failed:', err.message);
  process.exit(1);
});
