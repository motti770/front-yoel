/**
 * API Service Layer
 * This file re-exports everything from the new modular structure for backwards compatibility
 *
 * The actual services are now in src/services/api/ directory:
 * - config.js: axios instance and interceptors
 * - auth.js, customers.js, orders.js, etc.: individual services
 * - index.js: main entry point
 */

// Re-export everything from the new modular structure
export {
    default,
    MOCK_MODE,
    authService,
    customersService,
    leadsService,
    productsService,
    ordersService,
    departmentsService,
    workflowsService,
    parametersService,
    tasksService,
    analyticsService,
    filesService,
    usersService,
    materialsService,
    notificationsService,
    stockOrdersService,
    salesPipelineService,
    apiKeysService
} from './api/index';

// Legacy export for resetMockData (if needed)
export const resetMockData = () => {
    console.warn('resetMockData is deprecated. Mock data has been removed from the modular services.');
    return { success: false, message: 'Mock data reset is not available in modular structure' };
};
