import swaggerJsdoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Content Sharing Platform API",
      version: "1.0.0",
      description:
        "This API allows users to register, upload and share content, and interact with other users' content.",
    },
    servers: [
      {
        url: process.env.SERVER_URL,
      },
    ],
  },
  apis: [
    resolve(__dirname, "../routes/*.js"),
    resolve(__dirname, "../utils/swaggerFiles/*.yaml"),
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
