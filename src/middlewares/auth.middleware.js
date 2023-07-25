import createHttpError from "http-errors";
import Prisma from "../../prisma/index.js";
import jwt from "jsonwebtoken";

export const verifyAdminToken = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization;

    if (!bearer) {
      req.query.isAdmin = false;
      req.body.user = null;
      return next(createHttpError.BadRequest("Auth token not found"));
    }

    const token = bearer.split(" ")[1];

    if (!token) {
      req.query.isAdmin = false;
      req.query.user = null;
      return next(createHttpError.BadRequest("Auth token not found"));
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decode.email) {
      req.query.isAdmin = false;
      req.body.user = null;
      return next(createHttpError.BadRequest("Invalide Token"));
    }

    const user = await Prisma.sys_users.findFirst({
      where: {
        company_id: parseInt(decode.companyId),
        sub_company_id: parseInt(decode.subCompanyId),
        email: decode.email,
      },
    });

    req.body.user = user;
    if (user.role_name === "admin") req.query.isAdmin = true;
    else next(createHttpError.Unauthorized("User role is not admin"));

    next();
  } catch (err) {
    next(err);
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization;

    if (!bearer) {
      req.query.isAdmin = false;
      req.body.user = null;
      return next(createHttpError.BadRequest("Auth token not found"));
    }

    const token = bearer.split(" ")[1];

    if (!token) {
      req.query.user = null;
      return next(createHttpError("Auth token not found"));
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decode.email) {
      req.body.user = null;
      return next(createHttpError("Invalide Token"));
    }

    const user = await Prisma.sys_users.findFirst({
      where: {
        company_id: parseInt(decode.companyId),
        sub_company_id: parseInt(decode.subCompanyId),
        email: decode.email,
      },
    });

    req.body.user = user;

    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};
