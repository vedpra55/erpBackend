import createHttpError from "http-errors";
import Prisma from "../../../prisma/index.js";

export const createLocation = async (req, res, next) => {
  const { locationCode, locationName, shortName, closedFlag, user } = req.body;

  if (!locationCode || !locationName || !shortName) {
    next(createHttpError.BadRequest("Please fill all fields"));
  }

  try {
    await Prisma.$transaction(async (Prisma) => {
      const locationCodeExits = await Prisma.inv_locations.findUnique({
        where: {
          company_id_sub_company_id_location_code: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            location_code: locationCode,
          },
        },
      });

      if (locationCodeExits) {
        return res.status(200).json({
          errorMessage: "Location Code Exits",
        });
      }

      await Prisma.inv_locations.create({
        data: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
          location_code: locationCode,
          location_name: locationName,
          short_name: shortName,
          closed_flag: closedFlag,
        },
      });

      res.status(200).json({
        message: "Location created successfully",
      });
    });
  } catch (err) {
    next(err);
  }
};

export const getAllLocations = async (req, res, next) => {
  try {
    const { user } = req.body;

    const locations = await Prisma.inv_locations.findMany({
      where: {
        company_id: user.company_id,
        sub_company_id: user.sub_company_id,
      },
    });

    res.status(200).json({
      res: locations,
    });
  } catch (err) {
    next(err);
  }
};

export const getSingleLocation = async (req, res, next) => {
  try {
    const { locationCode } = req.query;
    const { user } = req.body;

    if (!locationCode) {
      next(createHttpError.BadRequest("No subcompany or location id found"));
    }

    const location = await Prisma.inv_locations.findUnique({
      where: {
        company_id_sub_company_id_location_code: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
          location_code: locationCode,
        },
      },
    });
    res.status(200).json({
      res: location,
    });
  } catch (err) {
    next(err);
  }
};

export const updateLocation = async (req, res, next) => {
  const { locationCode, locationName, shortName, closedFlag, user } = req.body;

  if (!locationCode || !locationName || !shortName) {
    next(createHttpError.BadRequest("Please fill all fields"));
  }

  try {
    await Prisma.inv_locations.update({
      where: {
        company_id_sub_company_id_location_code: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
          location_code: locationCode,
        },
      },
      data: {
        location_name: locationName,
        short_name: shortName,
        closed_flag: closedFlag,
      },
    });
    res.status(200).json({
      message: "Location updated successfully",
    });
  } catch (err) {
    next(err);
  }
};
