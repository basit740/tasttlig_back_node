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
8. Install Crypto to get the access token (repeat this step to get the refresh token): `require('crypto').randomBytes(64).toString('hex')`.
9. Copy and paste access and refresh token to `.env` file.
10. Create a new Stripe account at <https://dashboard.stripe.com/register> (skip this step if you already have one).
11. Sign in to your Stripe account at <https://dashboard.stripe.com/login>.
12. Go to API keys at <https://dashboard.stripe.com/test/apikeys>.
13. Copy and paste the Secret key to `.env` file.
14. Start the development server: `npm run devStart`.
15. Go to <http://localhost:8000> in your browser. :tada:
