import createHttpError from "http-errors";
import Prisma from "../../../prisma/index.js";

export const getCompanyById = async (req, res, next) => {
  const { companyId } = req.query;

  try {
    if (!companyId) {
      return next(createHttpError.BadRequest("No id found"));
    }

    const company = await Prisma.gl_companies.findUnique({
      where: {
        company_id: parseInt(companyId),
      },
    });

    res.status(200).json({
      res: company,
    });
  } catch (err) {
    next(err);
  }
};
