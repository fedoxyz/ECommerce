import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
dotenv.config();

// Swagger definition
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'API documentation for E-Commerce project',
    },
    servers: [
      {
        url: `http://localhost:3000/api`, 
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/api/routes/*.js'], // Path to your route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
export { swaggerUi, swaggerDocs };
