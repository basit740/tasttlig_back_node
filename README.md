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
8. Install Crypto to get the access token secret (repeat this step to get the refresh token and email secrets): `require('crypto').randomBytes(64).toString('hex')`.
9. Copy and paste access and refresh token and email secrets to `.env` file.
10. Add your Gmail username and password to `.env` file.
11. Create a new Stripe account at <https://dashboard.stripe.com/register> (skip this step if you already have one).
12. Sign in to your Stripe account at <https://dashboard.stripe.com/login>.
13. Go to API keys at <https://dashboard.stripe.com/test/apikeys>.
14. Click on `Reveal test key token` and copy and paste the Secret key to `.env` file.
15. Start the development server: `npm run devStart`.
16. Start the authorization server: `npm run devStartAuth`.
17. Go to <http://localhost:8000> in your browser. :tada:
