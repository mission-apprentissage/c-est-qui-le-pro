import Boom from "@hapi/boom";

function boomify(rawError) {
  let error;
  if (rawError.isBoom) {
    error = rawError;
    if (error?.data?.public) {
      error.output.payload.data = error?.data?.public;
    }
  } else if (rawError.name === "ValidationError") {
    //This is a joi validation error
    error = Boom.badRequest("Erreur de validation");
    error.output.payload.details = rawError.details;
  } else {
    error = Boom.boomify(rawError, {
      statusCode: rawError.status || 500,
      ...(!rawError.message ? "Une erreur est survenue" : {}),
    });
  }
  return error;
}

export function errorMiddleware() {
  // eslint-disable-next-line no-unused-vars
  return (rawError, req, res, _next) => {
    req.err = rawError;

    let { output } = boomify(req.err);
    return res.status(output.statusCode).send(output.payload);
  };
}
