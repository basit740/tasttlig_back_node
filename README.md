# Tasttlig Back-End (Node.js)

The purpose of this README.md file is to show how to set up the development environment on your computer to run the repository.

## Getting Started

1. Login to bitbucket.org and go to this link <https://bitbucket.org/tasttlig/tasttlig-back-node/src/master/>.
2. From the top right, click on the "Clone" button and get your Git clone URL (`git clone https://username@bitbucket.org/tasttlig/tasttlig-back-node.git`).
3. If you have a Git command compatible shell, open it or get one from here <https://git-scm.com/downloads> (skip this step if you already have one).
4. Open shell and execute the command from Step 2.
5. Go to tasttlig-back-node.
6. Download Node.js at <https://nodejs.org/en/download/> (skip this step if you already have one).
7. Create a `.env` file in the tasttlig-back-node folder.
8. Copy the `.env.example` content to the `.env` file.

## AWS S3 Bucket Steps (Skip if you Already Have One)

1. Create a new AWS account at <https://portal.aws.amazon.com/billing/signup#/start> (skip this step if you already have one).
2. Sign in to your AWS account at <https://signin.aws.amazon.com/signin?redirect_uri=https%3A%2F%2Fconsole.aws.amazon.com%2Fconsole%2Fhome%3Fstate%3DhashArgs%2523%26isauthcode%3Dtrue&client_id=arn%3Aaws%3Aiam%3A%3A015428540659%3Auser%2Fhomepage&forceMobileApp=0>.
3. Go to AWS S3 at <https://s3.console.aws.amazon.com/s3/home?region=ca-central-1> (the Region in URL may vary based on your current location).
4. Click on `+ Create bucket`.
5. Add Bucket name and select Region.
6. Click on `Create`.
7. Click on your created Bucket name and select `Permissions` and then `Block public access`.
8. Click on `Edit` and uncheck `Block all public access`.
9. Click on `Save`, type `confirm` in the field and select `Confirm`.
10. Stay on `Permissions` and go to `Cross-origin resource sharing (CORS)`.
11. Click on `Edit`.
12. Copy and paste the file contents from `aws-cors.txt` file in the tasttlig-back-node folder to the `Cross-origin resource sharing (CORS)`.
13. Click on `Save changes`.
14. Go back to AWS S3 at <https://s3.console.aws.amazon.com/s3/home?region=ca-central-1> (the Region in URL may vary based on your current location).
15. Add your created Bucket name and Region (in URL) to the `.env` file at the tasttlig-back-node folder.
16. Go to My Security Credentials at <https://console.aws.amazon.com/iam/home?region=ca-central-1#/security_credentials> (the Region in URL may vary based on your current location).
17. Click on `Access keys (access key ID and secret access key)`.
18. Select `Create New Access Key`.
19. Copy and paste AWS Access Key ID and AWS Secret Access Key to the `.env` file.

## PostgreSQL Steps for Mac Only (Skip if you Already Have One)

1. Install Homebrew by using the following command in the MacOS terminal: `/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`.
2. Update the Homebrew dependencies: `brew update`.
3. Install PostgreSQL: `brew install postgresql`.
4. Install PostGIS: `brew install postgis`.
5. Create PostgreSQL user: `createdb <USER>`.

## PostgreSQL Steps for Windows Only (Skip if you Already Have One)

1. Install Postgres from https://www.postgresql.org/download/
2. After successful installation open postgres stack builder, it starts automatically after database setup.
3. Add postgres bin directory in system PATH environment variable.
4. Select the postgres database from dropdown, click next
5. Select postgis option under categories -> spatial extensions and complete the setup with default options
6. right-click on PowerShell and run "as Administrator" and install Windows build tools using: `npm install --global --production windows-build-tools`
7. Then in powershell run these 2 commands, `SETx PGUSER postgres /M` and `SETx PGPASSWORD postgres_password_set_during_setup /M`

## Setup Continued

1. Go to Terminal (for Mac) or Command Line (for Windows).
2. Install dependencies: `npm ci`.
3. Create the database: `createdb tasttlig_back_node_development`.
4. Enter PSQL: `psql`.
5. Go to the tasttlig_back_node_development database: `\c tasttlig_back_node_development`.
6. Add PostGIS: `CREATE EXTENSION postgis;`.
7. Exit PSQL: `\q`.
8. Load the database: `node_modules/.bin/knex migrate:latest`. If this fails, then use command: `knex migrate:latest`.
9. Enter Node.js console: `node`.
10. Get the key: `require('crypto').randomBytes(64).toString('hex')` (you will get a hexadecimal string).
11. Copy the key to access token secret to the `.env` file.
12. Repeat Steps 10 and 11 for refresh token secret and email secret to the `.env` file.
13. Exit Node.js console: `.exit`.
14. Create a new Gmail account at <https://accounts.google.com/signup/v2/webcreateaccount?flowName=GlifWebSignIn&flowEntry=SignUp> (skip this step if you already have one).
15. Download the Gmail app on your smartphone from Google Play or App Store (skip this step if you already have one).
16. Sign in to your Gmail account at <https://accounts.google.com/ServiceLogin/signinchooser?flowName=GlifWebSignIn&flowEntry=ServiceLogin>.
17. Turn off 2-step verification on your Gmail account at <https://myaccount.google.com/signinoptions/two-step-verification>.
18. Turn on less secure app access on your Gmail account at <https://myaccount.google.com/lesssecureapps>.
19. Allow access for display unlock captcha (allow access to your Google account) on your Gmail account at <https://accounts.google.com/DisplayUnlockCaptcha>.
20. Add your Gmail username and password to the `.env` file.
21. Create a new Stripe account at <https://dashboard.stripe.com/register> (skip this step if you already have one).
22. Sign in to your Stripe account at <https://dashboard.stripe.com/login>.
23. Go to API keys at <https://dashboard.stripe.com/test/apikeys>.
24. Click on `Reveal test key token` and copy and paste the Secret key to the `.env` file.
25. Create a new MapQuest Developer account at <https://developer.mapquest.com/plan_purchase/steps/business_edition/business_edition_free/register> (skip this step if you already have one).
26. Click on `Create a New Key`.
27. Type "Tasttlig" for `App Name*` and click on `Create App`.
28. Copy and paste the MapQuest Developer Consumer Key to the `.env` file.
29. Start the development server: `npm run devStart`.
30. Go to <http://localhost:8000> in your browser (you will see `Cannot GET /`).
