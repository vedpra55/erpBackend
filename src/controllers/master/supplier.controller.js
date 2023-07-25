import createHttpError from "http-errors";
import Prisma from "../../../prisma/index.js";

export const createSupplier = async (req, res, next) => {
  try {
    const {
      user,
      supplierCode,
      supplierName,
      address1,
      address2,
      country,
      telephoneNo,
      mobileNo,
      email,
      fax,
      closedFlag,
    } = req.body;

    if (
      !supplierCode ||
      !supplierName ||
      !address1 ||
      !address2 ||
      !country ||
      !telephoneNo ||
      !mobileNo ||
      !email ||
      !fax
    ) {
      next(createHttpError.BadRequest("Please fill all fields"));
    }

    await Prisma.$transaction(async (Prisma) => {
      const codeExit = await Prisma.inv_suppliers.findUnique({
        where: {
          company_id_sub_company_id_supplier_code: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            supplier_code: supplierCode,
          },
        },
      });

      if (codeExit) {
        next(createHttpError.BadRequest("Supplier code already exists"));
      }

      await Prisma.inv_suppliers.create({
        data: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
          supplier_name: supplierName,
          supplier_code: supplierCode,
          telephone_no: telephoneNo.toString(),
          mobile_no: mobileNo.toString(),
          email: email,
          address_1: address1,
          address_2: address2,
          country: country,
          fax: fax,
          closed_flag: closedFlag,
          created_by: user.username,
        },
      });

      res.status(200).json({
        message: "Supplier created sucessfully",
      });
    });
  } catch (err) {
    next(err);
  }
};

export const getAllSupplier = async (req, res, next) => {
  try {
    const { user } = req.body;

    const suppliers = await Prisma.inv_suppliers.findMany({
      where: {
        company_id: user.company_id,
        sub_company_id: user.sub_company_id,
      },
    });
    res.status(200).json({
      res: suppliers,
    });
  } catch (err) {
    next(err);
  }
};

export const getSingleSupplier = async (req, res, next) => {
  try {
    const { supplierCode } = req.query;
    const { user } = req.body;

    const supplier = await Prisma.inv_suppliers.findUnique({
      where: {
        company_id_sub_company_id_supplier_code: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
          supplier_code: supplierCode,
        },
      },
    });
    res.status(200).json({
      res: supplier,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const {
      user,

      supplierCode,
      supplierName,
      address1,
      address2,
      country,
      telephoneNo,
      mobileNo,
      email,
      fax,
      closedFlag,
    } = req.body;

    if (
      !supplierCode ||
      !supplierName ||
      !address1 ||
      !address2 ||
      !country ||
      !telephoneNo ||
      !mobileNo ||
      !email ||
      !fax
    ) {
      next(createHttpError.BadRequest("Please fill all fields"));
    }

    await Prisma.$transaction(async (Prisma) => {
      await Prisma.inv_suppliers.update({
        where: {
          company_id_sub_company_id_supplier_code: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            supplier_code: supplierCode,
          },
        },
        data: {
          supplier_name: supplierName,
          telephone_no: telephoneNo.toString(),
          mobile_no: mobileNo.toString(),
          email: email,
          address_1: address1,
          address_2: address2,
          country: country,
          fax: fax,
          closed_flag: closedFlag,
        },
      });
      res.status(200).json({
        message: "Supplier updated successfully",
      });
    });
  } catch (err) {
    next(err);
  }
};
