# Tasttlig Back-End (Node.js)

The purpose of this README.md file is to show how to set up the development environment on your computer to run the repository.

## Getting Started

1. Clone: `git clone https://tasttlig@bitbucket.org/tasttlig/tasttlig-back-node.git`.
2. Download Node.js at <https://nodejs.org/en/download/> (skip this step if you already have one).
3. Follow the Node.js installation instructions (skip this step if you already have one).

## Additional Steps For Windows Only:
1. Install Postgres from https://www.postgresql.org/download/
2. Add postgres in PATH system variable
3. Create a new user with name same as windows username and give appropriate permissions
4. install Windows build tools using: `npm install --global --production windows-build-tools`

## Skip these step if you already have aws s3 bucket setup.
1. Create a new AWS account at <https://portal.aws.amazon.com/billing/signup#/start> (skip this step if you already have one).
2. Sign in to your AWS account at <https://signin.aws.amazon.com/signin?redirect_uri=https%3A%2F%2Fconsole.aws.amazon.com%2Fconsole%2Fhome%3Fstate%3DhashArgs%2523%26isauthcode%3Dtrue&client_id=arn%3Aaws%3Aiam%3A%3A015428540659%3Auser%2Fhomepage&forceMobileApp=0>.
3. Go to AWS S3 at <https://s3.console.aws.amazon.com/s3/home?region=ca-central-1> (the Region in URL may vary based on your current location).
4. Click on `+ Create bucket`.
5. Add Bucket name and select Region.
6. Click on `Create`.
7. Click on your created Bucket name and select `Permissions` and then `Block public access`.
8. Click on `Edit` and uncheck `Block all public access`.
9. Click on `Save`, type `confirm` in the field, and select `Confirm`.
10. Stay on `Permissions` and select `CORS configuration`.
11. Copy and paste the code from `aws-cors.txt` file at the client folder to the CORS configuration editor.
12. Click on `Save`.
13. Go back to AWS S3 at <https://s3.console.aws.amazon.com/s3/home?region=ca-central-1> (the Region in URL may vary based on your current location) and add your created Bucket name and Region (in URL) to `.env.local` file at the client folder.
14. Go to My Security Credentials at <https://console.aws.amazon.com/iam/home?region=ca-central-1#/security_credentials> (the Region in URL may vary based on your current location).
15. Click on `Access keys (access key ID and secret access key)` and select `Create New Access Key`.

## Setup Continued
1. Copy and paste AWS Access Key ID and AWS Secret Access Key to `.env` file.
2. Install dependencies: `npm ci`.
3. Create the database: `createdb tasttlig_back_node_development`.
4. Load the database: `node_modules/.bin/knex migrate:latest`.
5. Using .env.example as a skeleton file create a .env file in the same level
6. Open Node.js console: `node`.
7. Get the access token secret (repeat this step to get the refresh token and email secrets): `require('crypto').randomBytes(64).toString('hex')`.
8. Copy and paste access and refresh token and email secrets to `.env` file.
9. Create a new Gmail account at <https://accounts.google.com/signup/v2/webcreateaccount?flowName=GlifWebSignIn&flowEntry=SignUp> (skip this step if you already have one).
10. Download the Gmail app on your smartphone from Google Play or App Store (skip this step if you already have one).
11. Sign in to your Gmail account at <https://accounts.google.com/ServiceLogin/signinchooser?flowName=GlifWebSignIn&flowEntry=ServiceLogin>.
12. Turn off 2-step verification on your Gmail account at <https://myaccount.google.com/signinoptions/two-step-verification>.
13. Turn on less secure app access on your Gmail account at <https://myaccount.google.com/lesssecureapps>.
14. Allow access for display unlock captcha (allow access to your Google account) on your Gmail account at <https://accounts.google.com/DisplayUnlockCaptcha>.
15. Add your Gmail username and password to `.env` file.
16. Create a new Stripe account at <https://dashboard.stripe.com/register> (skip this step if you already have one).
17. Sign in to your Stripe account at <https://dashboard.stripe.com/login>.
18. Go to API keys at <https://dashboard.stripe.com/test/apikeys>.
19. Click on `Reveal test key token` and copy and paste the Secret key to `.env` file.
20. Start the development server: `npm run devStart`.
21. Go to <http://localhost:8000> in your browser.