import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                // Local development
                protocol: 'https',
                hostname: '127.0.0.1',
                port: '8000',
                pathname: '/media/**',
            },
            {
                // Docker Compose
                protocol: 'https',
                hostname: 'api.localhost',
                port: '8443',
                pathname: '/media/**',
            },
        ],
    },
    turbopack: {},
    webpack: (config) => {
        config.watchOptions = {
            poll: 1000,
            aggregateTimeout: 300,
        }
        return config
    },
};

export default nextConfig;