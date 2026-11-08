# AWS S3 Manual Deployment Guide

This guide explains how to deploy this Vite dashboard manually to Amazon S3 in `eu-north-1`, without CI/CD and without a custom domain for now.

The workflow is:

1. Configure frontend environment variables locally.
2. Build the app locally with `npm run build`.
3. Upload the generated static files to an S3 bucket.
4. Open the S3 static website URL.

## What You Are Deploying

This project is a frontend dashboard. After building, Vite produces static files:

```txt
dist/
  index.html
  assets/
  ...
```

S3 will only host these static files. It will not run Node.js, Express, Vite dev server, server-side code, or private runtime environment variables.

## Important Concepts

### S3 Static Website Hosting

Amazon S3 can serve static files such as HTML, CSS, JavaScript, images, and fonts.

For this setup, users will access the app through an S3 website endpoint that looks like this:

```txt
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

S3 website endpoints use HTTP. Later, when you want HTTPS or a custom domain, use CloudFront in front of S3.

### Vite Environment Variables

Vite frontend environment variables must start with `VITE_`.

Example:

```env
VITE_API_BASE_URL=https://api.example.com
```

In code:

```js
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
```

These values are embedded into the built JavaScript during `npm run build`.

That means:

- Changing `.env.production` after building does nothing until you run `npm run build` again.
- S3 does not read or inject `.env` files.
- Anything prefixed with `VITE_` is visible in the browser bundle.
- Do not put secrets, private API keys, database passwords, AWS secret keys, or admin tokens in Vite env variables.

Safe examples:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_APP_ENV=production
VITE_SUPPORT_EMAIL=support@example.com
```

Unsafe examples:

```env
VITE_AWS_SECRET_ACCESS_KEY=...
VITE_DATABASE_PASSWORD=...
VITE_PRIVATE_API_KEY=...
```

## Recommended Files

Use these files locally:

```txt
.env.local
.env.production
```

Use `.env.local` for local development:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Use `.env.production` for the S3 production build:

```env
VITE_API_BASE_URL=https://your-production-api-url.com
```

If there is no backend yet, you can temporarily use:

```env
VITE_API_BASE_URL=
```

or omit it until API integration starts.

## Git Ignore Check

Make sure local-only env files are not committed.

Your `.gitignore` should usually include:

```gitignore
.env
.env.local
.env.*.local
dist
```

It is acceptable to commit an example file:

```txt
.env.example
```

Example `.env.example`:

```env
VITE_API_BASE_URL=
```

## AWS Region

Use:

```txt
us-east-1
```

This guide assumes all S3 work is done in `US East (N. Virginia) us-east-1`.

## Step 1: Create the S3 Bucket

1. Open the AWS Console.
2. Go to `S3`.
3. Click `Create bucket`.
4. For `AWS Region`, choose:

```txt
US East (N. Virginia) us-east-1
```

5. Enter a globally unique bucket name.

Example:

```txt
amm-dashboard
```


6. Leave `Object Ownership` as:

```txt
ACLs disabled
```

7. Under `Block Public Access settings for this bucket`, uncheck:

```txt
Block all public access
```

8. AWS will show a warning. Check the acknowledgement box.
9. Keep bucket versioning disabled for now unless you specifically want rollback history.
10. Keep default encryption enabled.
11. Click `Create bucket`.

## Step 2: Enable Static Website Hosting

1. Open the bucket.
2. Go to the `Properties` tab.
3. Scroll to `Static website hosting`.
4. Click `Edit`.
5. Choose:

```txt
Enable
```

6. For `Hosting type`, choose:

```txt
Host a static website
```

7. Set `Index document`:

```txt
index.html
```

8. Set `Error document`:

```txt
index.html
```

Using `index.html` for both is important for single page apps. It helps routes like `/orders`, `/dashboard`, or `/settings` load correctly when the browser refreshes.

9. Click `Save changes`.
10. Copy the `Bucket website endpoint`.

It should look like:

```txt
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

## Step 3: Add the Bucket Policy

1. Open the bucket.
2. Go to the `Permissions` tab.
3. Scroll to `Bucket policy`.
4. Click `Edit`.
5. Paste this policy.
6. Replace `YOUR_BUCKET_NAME` with your actual bucket name.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForStaticWebsite",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

Example:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForStaticWebsite",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::amm-dashboard-prod/*"
    }
  ]
}
```

7. Click `Save changes`.

This policy allows public read access to files in the bucket. It does not allow public uploads, edits, or deletes.

## Step 4: Prepare Production Env Variables

Create or update `.env.production` in the project root.

Example:

```env
VITE_API_BASE_URL=https://your-api-url.com
```

If API integration is not ready yet:

```env
VITE_API_BASE_URL=
```

When the backend is ready later, update this value and rebuild the app.

## Step 5: Build Locally

From the project root, install dependencies if needed:

```bash
npm install
```

Build the production files:

```bash
npm run build
```

After the build finishes, confirm the `dist` directory exists:

```txt
dist/
  index.html
  assets/
```

Only upload the contents of `dist`, not the `dist` folder itself.

Correct S3 result:

```txt
s3://your-bucket-name/index.html
s3://your-bucket-name/assets/...
```

Incorrect S3 result:

```txt
s3://your-bucket-name/dist/index.html
s3://your-bucket-name/dist/assets/...
```

## Step 6: Upload Files Using AWS Console

1. Open the S3 bucket.
2. Go to the `Objects` tab.
3. Click `Upload`.
4. Open your local `dist` folder.
5. Select everything inside `dist`.
6. Upload:

```txt
index.html
assets/
any other generated files
```

7. Click `Upload`.
8. Wait for the upload to complete.

Then open the bucket website endpoint:

```txt
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

## Step 7: Upload Files Using AWS CLI

The AWS CLI method is faster and less error-prone once it is configured.

Install AWS CLI if you do not already have it:

```bash
aws --version
```

Configure credentials:

```bash
aws configure
```

Use:

```txt
AWS Access Key ID: your access key
AWS Secret Access Key: your secret key
Default region name: us-east-1
Default output format: json
```

Build:

```bash
npm run build
```

Upload:

```bash
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete
```

Example:

```bash
aws s3 sync dist/ s3://amm-dashboard-prod --delete
```

The `--delete` flag removes files from S3 that no longer exist locally in `dist`. This prevents old hashed assets from piling up.

## Step 8: Verify the Deployment

Open:

```txt
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

Check:

- The dashboard loads.
- No blank white screen.
- Browser console has no missing asset errors.
- Refreshing a route still loads the app.
- API calls point to the expected `VITE_API_BASE_URL`.

To check API base URL in the browser:

1. Open the deployed site.
2. Open browser DevTools.
3. Go to the `Network` tab.
4. Trigger a request.
5. Confirm the request URL points to the correct backend.

## Step 9: Manual Update Workflow

Every time you change code:

```bash
npm run build
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete
```

Every time you change `.env.production`:

```bash
npm run build
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete
```

Changing env files without rebuilding will not update the deployed app.

## Cache Notes

Vite creates hashed asset files, such as:

```txt
assets/index-a1b2c3.js
assets/index-d4e5f6.css
```

These are safe to cache for a long time because the filename changes when the content changes.

For simple manual deployment, you can skip custom cache headers at first.

Later, a better cache strategy is:

- `index.html`: short cache or no cache.
- `assets/*`: long cache.

If using AWS CLI later, cache headers can be set with separate upload commands. This is optional for the first S3 setup.

## Common Problems

### Access Denied

Check:

- Static website hosting is enabled.
- `Block all public access` is disabled for the bucket.
- Bucket policy allows `s3:GetObject`.
- You are using the website endpoint, not the regular S3 object URL.

Correct:

```txt
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

Not the same as:

```txt
https://s3.amazonaws.com/your-bucket-name/index.html
```

### 404 on Refresh

If refreshing `/dashboard` or another route gives a 404:

1. Go to bucket `Properties`.
2. Open `Static website hosting`.
3. Set `Error document` to:

```txt
index.html
```

### Blank White Screen

Check:

- Browser console errors.
- Missing files in the `assets` folder.
- You uploaded the contents of `dist`, not the `dist` folder.
- The app was built successfully.
- Env variables are correctly prefixed with `VITE_`.

### Env Variable Is Undefined

Check:

- The variable starts with `VITE_`.
- It is in `.env.production` before running `npm run build`.
- You access it with `import.meta.env.VITE_SOMETHING`.
- You rebuilt after changing the env file.
- You uploaded the latest `dist` output.

### API Request Fails Due To CORS

When API integration starts, the backend must allow requests from the S3 website origin.

Example origin:

```txt
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

If you later add CloudFront or a custom domain, the backend must allow that origin too.

## Security Notes

This first setup makes the S3 bucket publicly readable because the website must be publicly accessible.

Public read is acceptable for static frontend files, but:

- Do not upload secrets.
- Do not upload `.env` files.
- Do not upload source code unless intended.
- Do not store private documents in the same bucket.
- Do not put AWS credentials in frontend code.

For a more production-ready setup later:

```txt
CloudFront + private S3 bucket + Origin Access Control + HTTPS
```

## Recommended Current Setup

For now:

```txt
Frontend hosting: S3 static website hosting
Region: us-east-1
Domain: none
HTTPS: not yet
Deployment: manual local build and upload
Build command: npm run build
Upload source: dist contents
API env variable: VITE_API_BASE_URL in .env.production
```

## Later Upgrade Path

When ready, improve this setup in this order:

1. Add backend API integration.
2. Configure CORS on the backend.
3. Add CloudFront for HTTPS.
4. Add a custom domain with Route 53 or another DNS provider.
5. Add cache policies.
6. Add CI/CD from GitHub or another Git provider.

## Quick Checklist

Before first deploy:

- [ ] Create S3 bucket in `us-east-1`.
- [ ] Disable `Block all public access` for this website bucket.
- [ ] Enable static website hosting.
- [ ] Set index document to `index.html`.
- [ ] Set error document to `index.html`.
- [ ] Add public read bucket policy.
- [ ] Create `.env.production`.
- [ ] Run `npm install`.
- [ ] Run `npm run build`.
- [ ] Upload contents of `dist`.
- [ ] Open S3 website endpoint.

For every later deploy:

- [ ] Update code.
- [ ] Update `.env.production` if needed.
- [ ] Run `npm run build`.
- [ ] Upload or sync `dist/` contents to S3.
- [ ] Test the website endpoint.

