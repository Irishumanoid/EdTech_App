const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        OPENAI_API_KEY:process.env.OPENAI_API_KEY,
        MONGODB_URI:process.env.MONGODB_URI,
    },
    experimental: {
        reactCompiler: true,
    },
}

module.exports = withNextIntl(nextConfig)
