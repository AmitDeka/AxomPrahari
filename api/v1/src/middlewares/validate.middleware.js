import { ZodError } from 'zod';

/**
 * Middleware that takes a zod schema as an argument, validates req.body, 
 * and returns a strict 400 Bad Request with sanitized error messages.
 * 
 * @param {import('zod').ZodSchema} schema 
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate and parse the request body against the schema
      const parsedBody = schema.parse(req.body);
      
      // Replace req.body with the sanitized and validated output from Zod
      // This strips out any unexpected fields if the schema uses .strict() or normal objects
      req.body = parsedBody;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Sanitize error messages for the client
        const sanitizedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          status: 'error',
          message: 'Invalid request payload',
          errors: sanitizedErrors,
        });
      }

      // If it's an unexpected error, pass it to the global error handler
      next(error);
    }
  };
};
