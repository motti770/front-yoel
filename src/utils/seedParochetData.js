/**
 * Seed Parochet Data Utility
 * Loads 30 parochet products + parameters + workflow into localStorage
 *
 * This runs once on app initialization to populate the mock data
 */

import { parochetProducts, parochetBase } from '../data/parochet-products';
import { parochetParameters } from '../data/parochet-parameters';
import { parochetWorkflow } from '../data/parochet-workflow';

/**
 * Seeds parochet data into localStorage
 * @returns {Object} Result object with success status and message
 */
export const seedParochetData = () => {
  try {
    console.log('[Seed Parochet] Starting...');

    // ========== PRODUCTS ==========
    const existingProducts = JSON.parse(localStorage.getItem('mockProducts') || '[]');

    // Check if already seeded (base product exists)
    const alreadySeeded = existingProducts.some(p => p.id === 'parochet-base');

    if (alreadySeeded) {
      console.log('[Seed Parochet] Already seeded - skipping');
      return {
        success: true,
        message: 'Parochet data already exists',
        skipped: true
      };
    }

    // Add base product + 30 variants
    const updatedProducts = [
      ...existingProducts,
      parochetBase,
      ...parochetProducts
    ];

    localStorage.setItem('mockProducts', JSON.stringify(updatedProducts));
    console.log(`[Seed Parochet] ✅ Added ${parochetProducts.length + 1} products (1 base + 30 variants)`);

    // ========== PARAMETERS ==========
    // FORCE UPDATE: Always replace parameters to get latest version
    localStorage.setItem('mockParameters', JSON.stringify(parochetParameters));
    console.log(`[Seed Parochet] ✅ Loaded ${parochetParameters.length} parameters (UPDATED)`);

    // ========== WORKFLOW ==========
    const existingWorkflows = JSON.parse(localStorage.getItem('mockWorkflows') || '[]');

    // Only add workflow if it doesn't already exist
    const workflowExists = existingWorkflows.some(w => w.id === parochetWorkflow.id);

    if (!workflowExists) {
      const updatedWorkflows = [...existingWorkflows, parochetWorkflow];
      localStorage.setItem('mockWorkflows', JSON.stringify(updatedWorkflows));
      console.log('[Seed Parochet] ✅ Added workflow with 7 steps');
    } else {
      console.log('[Seed Parochet] ⚠️ Workflow already exists - skipping');
    }

    // ========== DEPARTMENTS (if needed) ==========
    const existingDepartments = JSON.parse(localStorage.getItem('mockDepartments') || '[]');

    const requiredDepartments = [
      {
        id: 'dept-design',
        name: 'מחלקת עיצוב',
        nameEn: 'design',
        description: 'עיצוב סקיצות ורקמות',
        status: 'ACTIVE'
      },
      {
        id: 'dept-sales',
        name: 'מחלקת מכירות',
        nameEn: 'sales',
        description: 'ניהול לקוחות ותשלומים',
        status: 'ACTIVE'
      },
      {
        id: 'dept-embroidery',
        name: 'מחלקת רקמה',
        nameEn: 'embroidery',
        description: 'עיצוב ובקרת רקמה',
        status: 'ACTIVE'
      },
      {
        id: 'dept-production',
        name: 'מחלקת ייצור',
        nameEn: 'production',
        description: 'ייצור במכונות',
        status: 'ACTIVE'
      },
      {
        id: 'dept-quality',
        name: 'מחלקת בקרת איכות',
        nameEn: 'quality',
        description: 'בקרת איכות סופית',
        status: 'ACTIVE'
      },
      {
        id: 'dept-logistics',
        name: 'מחלקת לוגיסטיקה',
        nameEn: 'logistics',
        description: 'צילום, תיאום, אריזה ומשלוח',
        status: 'ACTIVE'
      }
    ];

    // Add only missing departments
    const newDepartments = requiredDepartments.filter(
      newDept => !existingDepartments.some(existing => existing.id === newDept.id)
    );

    if (newDepartments.length > 0) {
      const updatedDepartments = [...existingDepartments, ...newDepartments];
      localStorage.setItem('mockDepartments', JSON.stringify(updatedDepartments));
      console.log(`[Seed Parochet] ✅ Added ${newDepartments.length} departments`);
    } else {
      console.log('[Seed Parochet] ⚠️ Departments already exist - skipping');
    }

    // ========== SUCCESS ==========
    console.log('[Seed Parochet] ✅ Complete!');

    return {
      success: true,
      message: 'Parochet data seeded successfully',
      data: {
        products: parochetProducts.length + 1, // base + variants
        parameters: parochetParameters.length,
        workflow: workflowExists ? 0 : 1,
        departments: newDepartments.length
      }
    };
  } catch (error) {
    console.error('[Seed Parochet] ❌ Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Helper: Get all parochet products from localStorage
 */
export const getParochetProducts = () => {
  const allProducts = JSON.parse(localStorage.getItem('mockProducts') || '[]');
  return allProducts.filter(p => p.parentProductId === 'parochet-base' || p.id === 'parochet-base');
};

/**
 * Helper: Get parochet variants by design tag
 */
export const getParochetVariantsByDesign = (designTag) => {
  const allProducts = JSON.parse(localStorage.getItem('mockProducts') || '[]');
  return allProducts.filter(p => p.designTag === designTag);
};

/**
 * Helper: Get parochet parameters
 */
export const getParochetParameters = () => {
  const allParams = JSON.parse(localStorage.getItem('mockParameters') || '[]');
  return allParams.filter(p => p.id.startsWith('param-'));
};

/**
 * Helper: Calculate final price with parameters
 */
export const calculateParochetPrice = (basePrice, selectedParams) => {
  let totalPrice = basePrice;

  selectedParams.forEach(param => {
    if (param.priceImpact) {
      totalPrice += param.priceImpact;
    }
  });

  return totalPrice;
};
