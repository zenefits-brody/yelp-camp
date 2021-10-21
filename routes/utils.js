// A wrapper function to handle async errors
// This won't be needed with express v5
const wrapAsync = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = { wrapAsync };
