# Kodede Back-End (Node.js)

The purpose of this README.md file is to show how to set up the development environment on your computer to run the repository.

## Getting Started

1. Clone: `git clone https://tasttlig@bitbucket.org/tasttlig/kodede-back-node.git`.
2. Download Node.js at <https://nodejs.org/en/download/> (skip this step if you already have one).
3. Follow the Node.js installation instructions (skip this step if you already have one).
4. Install dependencies: `npm install`.
5. Create the database: `createdb kodede_back_node_development`.
6. Load the database: `node_modules/.bin/knex migrate:latest`.
7. Open Node.js console: `node`.
8. Get the access token secret (repeat this step to get the refresh token and email secrets): `require('crypto').randomBytes(64).toString('hex')`.
9. Copy and paste access and refresh token and email secrets to `.env` file.
10. Create a new Gmail account at <https://accounts.google.com/signup/v2/webcreateaccount?flowName=GlifWebSignIn&flowEntry=SignUp> (skip this step if you already have one).
11. Download the Gmail app on your smartphone from Google Play or App Store (skip this step if you already have one).
12. Sign in to your Gmail account at <https://accounts.google.com/ServiceLogin/signinchooser?flowName=GlifWebSignIn&flowEntry=ServiceLogin>.
13. Turn off 2-step verification on your Gmail account at <https://myaccount.google.com/signinoptions/two-step-verification>.
14. Turn on less secure app access on your Gmail account at <https://myaccount.google.com/lesssecureapps>.
15. Allow access for display unlock captcha (allow access to your Google account) on your Gmail account at <https://accounts.google.com/DisplayUnlockCaptcha>.
16. Add your Gmail username and password to `.env` file.
17. Create a new Stripe account at <https://dashboard.stripe.com/register> (skip this step if you already have one).
18. Sign in to your Stripe account at <https://dashboard.stripe.com/login>.
19. Go to API keys at <https://dashboard.stripe.com/test/apikeys>.
20. Click on `Reveal test key token` and copy and paste the Secret key to `.env` file.
21. Start the development server: `npm run devStart`.
22. Start the authorization server: `npm run devStartAuth`.
23. Go to <http://localhost:8000> in your browser.
24. Go to <http://localhost:4000> in your browser. :tada:
