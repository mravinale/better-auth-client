import 'dotenv/config';
import express from 'express'; 
import apiRoutes from './src/infrastructure/routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/infrastructure/swagger.js';

const app = express();
const port = process.env.PORT || 3005;

// Mount Swagger UI for all endpoints (custom + Better Auth)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
 

// Parse JSON bodies
app.use(express.json());

// Mount unified API routes
app.use('/api', apiRoutes);

// Start the server
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  console.log(`Endpoints Docs available at http://localhost:${port}/docs`); 
});
