# Finding Memos - Deployment System

This automated deployment system allows you to build, upload, and deploy the Finding Memos frontend application with safety features including automatic backups and rollback capability.

## 📋 Prerequisites

- Node.js and npm installed locally
- FTP access to your server
- PHP with ZipArchive extension on server
- Write permissions on server for `/finding-memos` directory

## 🚀 Initial Setup (One-Time)

### 1. Configure FTP Credentials

```bash
# Copy the example file
cp .env.deploy.example .env.deploy

# Edit .env.deploy with your actual credentials
# IMPORTANT: Never commit .env.deploy to git!
```

Example `.env.deploy`:
```env
FTP_HOST=ftp.yourserver.com
FTP_USER=your_username
FTP_PASSWORD=your_password
FTP_PORT=21
FTP_SECURE=false
FTP_REMOTE_PATH=/finding-memos
```

### 2. Install deploy.php on Server

```bash
# 1. Copy the template to your server
# On your server at /finding-memos/deploy.php

# 2. Update the BACKEND_URL constant to match your Python backend
# Example: const BACKEND_URL = 'http://localhost:5000';

# 3. Ensure PHP has write permissions
chmod 644 deploy.php
chmod 755 /finding-memos
```

The `deploy.php` file should be manually copied from `deploy/deploy.php.template` to your server.

**IMPORTANT:** Update line 18 in deploy.php:
```php
const BACKEND_URL = 'http://localhost:5000'; // Change this to your actual backend URL
```

## 📦 Deployment Workflow

### Local: Build & Upload

Run the deployment command locally:

```bash
npm run deploy
```

This will:
1. ✅ Build the production version (`npm run build`)
2. ✅ Create `dist.zip` with all frontend files (no dist folder included)
3. ✅ Upload `dist.zip` to your server via FTP
4. ✅ Display success message

### Server: Deploy via AdminPage

1. Log in to Finding Memos as a superuser
2. Go to **Administration** page
3. Click **"Deploy New Version"** button
4. Wait for deployment to complete
5. Refresh the page when prompted

The deployment process will:
1. ✅ Validate you're an authenticated superuser
2. ✅ Create timestamped backup in `sav/YYYY-MM-DD_HH-MM-SS/`
3. ✅ Delete only frontend files (css/, fonts/, js/, index.html, images)
4. ✅ Extract dist.zip
5. ✅ Clean up dist.zip and old backups (keeps last 5)
6. ❌ Auto-rollback if any error occurs

## 🔒 Security Features

- **Authentication Required**: Only superusers can trigger deployment
- **Session Validation**: deploy.php validates session via Python backend
- **Whitelist Approach**: Only deletes specific frontend files, never touches:
  - `backend/` folder
  - `.htaccess`
  - `.env` files
  - `sav/` backups
  - `deploy.php` itself
  - Any system files

## 🛡️ Backup & Rollback

### Automatic Backups

Every deployment creates a compressed backup: `sav/backup_YYYY-MM-DD_HH-MM-SS.zip`
- Keeps last 5 backups
- Older backups are automatically deleted
- Compressed for minimal disk space usage

### Manual Rollback

If you need to manually rollback to a previous version:

1. SSH/FTP to your server
2. Navigate to `/finding-memos/sav/`
3. Find the backup you want to restore (e.g., `backup_2025-01-15_14-30-00.zip`)
4. Extract the zip to `/finding-memos/` (this will overwrite current files)

## 📁 File Structure

```
frontend/
├── deploy/
│   ├── deploy.php.template  ← Template for server-side script
│   └── README.md            ← This file
├── scripts/
│   └── deploy.js            ← Local deployment script
├── .env.deploy.example      ← FTP credentials template
├── .env.deploy              ← Your actual credentials (gitignored)
└── dist.zip                 ← Generated zip file (gitignored)

Server (/finding-memos/):
├── deploy.php                      ← Manually copied from template
├── dist.zip                        ← Uploaded by deploy script
├── sav/                            ← Backups (auto-created)
│   ├── backup_2025-01-15_14-30-00.zip
│   ├── backup_2025-01-15_15-45-22.zip
│   └── ... (keeps last 5)
├── css/                            ← Frontend files
├── fonts/
├── js/
├── index.html
├── *.png, *.webp, *.svg
└── backend/                        ← Never touched by deployment
```

## 🐛 Troubleshooting

### "dist.zip not found" error
- Run `npm run deploy` first to upload the zip file

### "Unauthorized" error
- Make sure you're logged in as a superuser
- Check that BACKEND_URL in deploy.php is correct

### FTP connection fails
- Verify credentials in `.env.deploy`
- Check firewall rules on your server
- Try changing `FTP_SECURE` to `true` if your server requires FTPS

### Deployment fails mid-process
- Automatic rollback should restore previous version
- Check PHP error logs on server
- Verify PHP has ZipArchive extension: `php -m | grep zip`
- Verify write permissions: `ls -la /finding-memos`

### Backups not being deleted
- Check that PHP has write permissions on `sav/` directory
- Verify `MAX_BACKUPS` constant in deploy.php (default: 5)

## 🔧 Updating deploy.php

If you need to update the deployment script:

1. Edit `deploy/deploy.php.template` locally
2. Test changes thoroughly
3. Manually copy updated version to server
4. Increment VERSION constant in deploy.php

## ⚠️ Important Notes

- **Never commit `.env.deploy`** - Contains sensitive FTP credentials
- **Never commit `dist.zip`** - Auto-generated, changes frequently
- **deploy.php lives on server only** - Updated manually when needed
- **Always test deployment in staging first** - If you have a staging environment
- **Backups are your safety net** - Don't delete them manually unless necessary

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review PHP error logs on server
3. Check browser console for frontend errors
4. Verify all configuration values are correct
