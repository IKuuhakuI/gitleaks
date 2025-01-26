/**
 * Validates a field in the configuration object.
 * @param {any} value - The value of the field to validate.
 * @param {string} fieldName - The name of the field.
 * @param {Function} validator - A validation function that returns true if valid.
 * @throws {Error} If the value is invalid.
 */
function validateField(value, fieldName, validator) {
    if (!validator(value)) {
        throw new Error(`Invalid .gitleaksrc.json: '${fieldName}' is invalid.`);
    }
}

/**
 * Ensures the value is an array.
 * @param {any} value - The value to validate.
 * @returns {boolean} True if the value is an array, false otherwise.
 */
function isArray(value) {
    return Array.isArray(value);
}

/**
 * Ensures the value is an object.
 * @param {any} value - The value to validate.
 * @returns {boolean} True if the value is an object, false otherwise.
 */
function isObject(value) {
    return typeof value === "object" && value !== null;
}

module.exports = {validateField, isArray, isObject};
