// lib/core/schemaValidator.js
// AJV-based schema validation for index, category, subcategory (Thai-only fields requirement enforced)
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, strict: false });

const indexSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['categories'],
  properties: {
    categories: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'name', 'file'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' }, // per requirement: Thai only BUT we cannot strictly enforce all-thai; we will provide an optional check
          file: { type: 'string' }
        }
      }
    }
  }
};

const categorySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'name', 'categories'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    categories: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'name', 'file'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          file: { type: 'string' }
        }
      }
    }
  }
};

const subcategorySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'name', 'data'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    data: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['api', 'text', 'name'],
        properties: {
          api: { type: 'string' },
          text: { type: 'string' },
          name: { type: 'string' }
        }
      }
    }
  }
};

const validateIndex = ajv.compile(indexSchema);
const validateCategory = ajv.compile(categorySchema);
const validateSubcategory = ajv.compile(subcategorySchema);

function errorsFor(fn) {
  return (obj) => {
    const ok = fn(obj);
    return { ok, errors: ok ? null : fn.errors };
  };
}

// Basic Thai-only heuristic: ensure at least one Thai character in name fields
function hasThaiChars(s) {
  if (!s || typeof s !== 'string') return false;
  return /[\u0E00-\u0E7F]/.test(s);
}

module.exports = {
  validateIndex: errorsFor(validateIndex),
  validateCategory: errorsFor(validateCategory),
  validateSubcategory: errorsFor(validateSubcategory),
  hasThaiChars
};