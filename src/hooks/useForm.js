/**
 * useForm Hook
 * A custom hook for managing form state with validation
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Built-in validation rules
 */
export const validators = {
    required: (value, message = 'This field is required') => {
        if (value === null || value === undefined || value === '' ||
            (Array.isArray(value) && value.length === 0)) {
            return message;
        }
        return null;
    },

    email: (value, message = 'Invalid email address') => {
        if (!value) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : message;
    },

    minLength: (min, message) => (value) => {
        if (!value) return null;
        const msg = message || `Must be at least ${min} characters`;
        return value.length >= min ? null : msg;
    },

    maxLength: (max, message) => (value) => {
        if (!value) return null;
        const msg = message || `Must be at most ${max} characters`;
        return value.length <= max ? null : msg;
    },

    min: (minVal, message) => (value) => {
        if (value === '' || value === null || value === undefined) return null;
        const msg = message || `Must be at least ${minVal}`;
        return Number(value) >= minVal ? null : msg;
    },

    max: (maxVal, message) => (value) => {
        if (value === '' || value === null || value === undefined) return null;
        const msg = message || `Must be at most ${maxVal}`;
        return Number(value) <= maxVal ? null : msg;
    },

    pattern: (regex, message = 'Invalid format') => (value) => {
        if (!value) return null;
        return regex.test(value) ? null : message;
    },

    phone: (value, message = 'Invalid phone number') => {
        if (!value) return null;
        // Israeli phone format or international
        const phoneRegex = /^(\+972|0)?([23489]|5[0-9]|7[0-9])-?[0-9]{7}$/;
        return phoneRegex.test(value.replace(/[\s-]/g, '')) ? null : message;
    },

    match: (fieldName, message) => (value, allValues) => {
        const msg = message || `Must match ${fieldName}`;
        return value === allValues[fieldName] ? null : msg;
    },

    custom: (validatorFn) => validatorFn
};

/**
 * Custom hook for form management
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationSchema - Validation rules for each field
 * @param {Object} options - Configuration options
 */
export function useForm(initialValues = {}, validationSchema = {}, options = {}) {
    const {
        validateOnChange = true,
        validateOnBlur = true,
        onSubmit
    } = options;

    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitCount, setSubmitCount] = useState(0);

    // Validate a single field
    const validateField = useCallback((name, value, allValues = values) => {
        const fieldValidators = validationSchema[name];
        if (!fieldValidators) return null;

        const rules = Array.isArray(fieldValidators) ? fieldValidators : [fieldValidators];

        for (const rule of rules) {
            const error = typeof rule === 'function'
                ? rule(value, allValues)
                : null;
            if (error) return error;
        }

        return null;
    }, [validationSchema, values]);

    // Validate all fields
    const validateForm = useCallback((formValues = values) => {
        const newErrors = {};
        let isValid = true;

        Object.keys(validationSchema).forEach(fieldName => {
            const error = validateField(fieldName, formValues[fieldName], formValues);
            if (error) {
                newErrors[fieldName] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [validationSchema, values, validateField]);

    // Handle field change
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setValues(prev => {
            const newValues = { ...prev, [name]: newValue };

            if (validateOnChange && touched[name]) {
                const error = validateField(name, newValue, newValues);
                setErrors(prevErrors => ({
                    ...prevErrors,
                    [name]: error
                }));
            }

            return newValues;
        });
    }, [validateOnChange, touched, validateField]);

    // Set a specific field value
    const setValue = useCallback((name, value) => {
        setValues(prev => {
            const newValues = { ...prev, [name]: value };

            if (validateOnChange && touched[name]) {
                const error = validateField(name, value, newValues);
                setErrors(prevErrors => ({
                    ...prevErrors,
                    [name]: error
                }));
            }

            return newValues;
        });
    }, [validateOnChange, touched, validateField]);

    // Set multiple values
    const setMultipleValues = useCallback((newValues) => {
        setValues(prev => ({ ...prev, ...newValues }));
    }, []);

    // Handle field blur
    const handleBlur = useCallback((e) => {
        const { name } = e.target;

        setTouched(prev => ({ ...prev, [name]: true }));

        if (validateOnBlur) {
            const error = validateField(name, values[name]);
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: error
            }));
        }
    }, [validateOnBlur, validateField, values]);

    // Handle form submission
    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();

        setSubmitCount(prev => prev + 1);

        // Mark all fields as touched
        const allTouched = Object.keys(validationSchema).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
        );
        setTouched(allTouched);

        // Validate form
        const isValid = validateForm();

        if (!isValid) {
            return { success: false, errors };
        }

        setIsSubmitting(true);

        try {
            if (onSubmit) {
                const result = await onSubmit(values);
                return { success: true, data: result };
            }
            return { success: true, data: values };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setIsSubmitting(false);
        }
    }, [validationSchema, validateForm, errors, onSubmit, values]);

    // Reset form to initial values
    const reset = useCallback((newInitialValues) => {
        setValues(newInitialValues || initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
        setSubmitCount(0);
    }, [initialValues]);

    // Set field error manually
    const setFieldError = useCallback((name, error) => {
        setErrors(prev => ({ ...prev, [name]: error }));
    }, []);

    // Clear field error
    const clearFieldError = useCallback((name) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }, []);

    // Check if form is valid
    const isValid = useMemo(() => {
        return Object.keys(errors).length === 0 &&
            Object.keys(validationSchema).every(field =>
                !validateField(field, values[field])
            );
    }, [errors, validationSchema, values, validateField]);

    // Check if form is dirty (has changes)
    const isDirty = useMemo(() => {
        return JSON.stringify(values) !== JSON.stringify(initialValues);
    }, [values, initialValues]);

    // Get field props helper
    const getFieldProps = useCallback((name) => ({
        name,
        value: values[name] || '',
        onChange: handleChange,
        onBlur: handleBlur
    }), [values, handleChange, handleBlur]);

    return {
        // State
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
        isDirty,
        submitCount,

        // Handlers
        handleChange,
        handleBlur,
        handleSubmit,

        // Utilities
        setValue,
        setMultipleValues,
        setFieldError,
        clearFieldError,
        validateField,
        validateForm,
        reset,
        getFieldProps
    };
}

export default useForm;
