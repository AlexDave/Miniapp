// Валидация ID
const isValidId = (id) => {
  return id && !isNaN(parseInt(id)) && parseInt(id) > 0;
};

// Валидация строки
const isValidString = (str, minLength = 1, maxLength = 1000) => {
  return typeof str === 'string' && 
         str.trim().length >= minLength && 
         str.trim().length <= maxLength;
};

// Валидация email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Валидация объекта
const isValidObject = (obj) => {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
};

// Валидация массива
const isValidArray = (arr) => {
  return Array.isArray(arr);
};

// Middleware для валидации
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Ошибка валидации',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

module.exports = {
  isValidId,
  isValidString,
  isValidEmail,
  isValidObject,
  isValidArray,
  validateRequest
};
