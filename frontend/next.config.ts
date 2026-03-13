import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                // 프론트에서 /api로 시작하는 요청을 보내면
                source: "/api/:path*",
                // 백엔드(8080포트)로 몰래 연결해줘!
                destination: "http://localhost:8080/api/:path*",
            },
        ];
    },
};

export default nextConfig;