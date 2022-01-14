// next.config.js
module.exports = {
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/auth/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS, POST" },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },
    ];
  },
};