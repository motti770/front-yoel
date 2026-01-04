/**
 * API Service Layer - Main Entry Point
 * Exports axios instance and all services
 */

// Re-export api instance and MOCK_MODE from config
export { default, MOCK_MODE } from './config';

// Re-export all services for backwards compatibility
export { authService } from './auth';
export { customersService } from './customers';
export { leadsService } from './leads';
export { productsService } from './products';
export { ordersService } from './orders';
export { departmentsService } from './departments';
export { workflowsService } from './workflows';
export { parametersService } from './parameters';
export { tasksService } from './tasks';
export { analyticsService } from './analytics';
export { filesService } from './files';
export { usersService } from './users';
export { materialsService } from './materials';
export { notificationsService } from './notifications';
export { stockOrdersService, salesPipelineService, apiKeysService } from './misc';
