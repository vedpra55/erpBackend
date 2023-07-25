import Prisma from "../../../prisma/index.js";
import createHttpError from "http-errors";

export const createStockTransfer = async (req, res, next) => {
  try {
    const {
      user,

      fromLocation,
      toLocation,
      transferNo,
      remarks,
      products,
    } = req.body;

    if (!fromLocation || !toLocation || !transferNo || !remarks) {
      next(createHttpError.BadRequest("Please fill all fields"));
    }

    if (!products || !products.length) {
      next(createHttpError.BadRequest("Products not found"));
    }

    await Prisma.$transaction(async (Prisma) => {
      await Prisma.inv_transfer.create({
        data: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
          from_location: fromLocation,
          to_location: toLocation,
          transfer_dt: new Date(),
          transfer_no: transferNo,
          remarks: remarks,
          created_on: new Date(),
          created_by: user.username,
        },
      });

      await Prisma.inv_transfer_sequences.create({
        data: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
          from_location: fromLocation,
          to_location: toLocation,
          sequence_number: transferNo,
        },
      });

      for (let i = 0; i < products.length; i++) {
        await Prisma.inv_transfer_detail.create({
          data: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            transfer_no: transferNo,
            serial_no: parseInt(products[i].srl),
            department_code: products[i].departmentCode,
            product_code: products[i].productCode,
            to_location: toLocation,
            from_location: fromLocation,
            qty_transferred: parseInt(products[i].quantity),
            created_by: user.username,
          },
        });

        const fromLocationStore = await Prisma.inv_stores.findUnique({
          where: {
            company_id_sub_company_id_location_code_department_code_product_code:
              {
                company_id: user.company_id,
                sub_company_id: user.sub_company_id,
                location_code: fromLocation,
                department_code: products[i].departmentCode,
                product_code: products[i].productCode,
              },
          },
        });

        if (fromLocationStore) {
          await Prisma.inv_stores.update({
            where: {
              company_id_sub_company_id_location_code_department_code_product_code:
                {
                  company_id: user.company_id,
                  sub_company_id: user.sub_company_id,
                  location_code: fromLocation,
                  department_code: products[i].departmentCode,
                  product_code: products[i].productCode,
                },
            },
            data: {
              qty_instock:
                fromLocationStore.qty_instock - parseInt(products[i].quantity),
              qty_transfer: -parseInt(products[i].quantity),
            },
          });
        } else {
          await Prisma.inv_stores.create({
            data: {
              company_id: user.company_id,
              sub_company_id: user.sub_company_id,
              department_code: products[i].departmentCode,
              product_code: products[i].productCode,
              location_code: fromLocation,
              qty_instock: parseInt(products[i].quantity),
              qty_transfer: parseInt(products[i].quantity),
            },
          });
        }

        const toLocationStore = await Prisma.inv_stores.findUnique({
          where: {
            company_id_sub_company_id_location_code_department_code_product_code:
              {
                company_id: user.company_id,
                sub_company_id: user.sub_company_id,
                location_code: toLocation,
                department_code: products[i].departmentCode,
                product_code: products[i].productCode,
              },
          },
        });

        if (toLocationStore) {
          await Prisma.inv_stores.update({
            where: {
              company_id_sub_company_id_location_code_department_code_product_code:
                {
                  company_id: user.company_id,
                  sub_company_id: user.sub_company_id,
                  location_code: fromLocation,
                  department_code: products[i].departmentCode,
                  product_code: products[i].productCode,
                },
            },
            data: {
              qty_instock:
                toLocationStore.qty_instock + parseInt(products[i].quantity),
              qty_transfer: parseInt(products[i].quantity),
            },
          });
        } else {
          await Prisma.inv_stores.create({
            data: {
              company_id: user.company_id,
              sub_company_id: user.sub_company_id,
              department_code: products[i].departmentCode,
              product_code: products[i].productCode,
              location_code: toLocation,
              qty_instock: parseInt(products[i].quantity),
              qty_transfer: parseInt(products[i].quantity),
            },
          });
        }

        await Prisma.inv_cardex.create({
          data: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            from_location: fromLocation,
            to_location: toLocation,
            trans_dt: new Date(),
            trans_no: transferNo,
            trans_type: "13",
            serial_no: parseInt(products[i].srl),
            department_code: products[i].departmentCode,
            product_code: products[i].productCode,
            quantity: parseInt(products[i].quantity),
            username: user.username,
          },
        });

        await Prisma.inv_cardex.create({
          data: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            from_location: toLocation,
            to_location: fromLocation,
            trans_dt: new Date(),
            trans_no: transferNo,
            trans_type: "4",
            serial_no: parseInt(products[i].srl),
            department_code: products[i].departmentCode,
            product_code: products[i].productCode,
            quantity: parseInt(products[i].quantity),
            username: user.username,
          },
        });
      }

      res.status(200).json({
        message: "Stock Transfer Created Successfully",
      });
    });
  } catch (err) {
    next(err);
  }
};

export const getAllStockTransfer = async (req, res, next) => {
  try {
    const { user } = req.body;

    const transfers = await Prisma.inv_transfer.findMany({
      where: {
        company_id: user.company_id,
        sub_company_id: user.sub_company_id,
      },
    });

    res.status(200).json({
      res: transfers,
    });
  } catch (err) {
    next(err);
  }
};

export const getSingleStockTransfer = async (req, res, next) => {
  try {
    const { fromLocation, toLocation, transferNo } = req.query;
    const { user } = req.body;

    if (!fromLocation || !toLocation || !transferNo) {
      next(createHttpError.BadRequest("All fields not found"));
    }

    const transfer = await Prisma.inv_transfer.findUnique({
      where: {
        company_id_sub_company_id_from_location_to_location_transfer_no: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
          from_location: fromLocation,
          to_location: toLocation,
          transfer_no: transferNo,
        },
      },
    });

    const details = await Prisma.inv_transfer_detail.findMany({
      where: {
        company_id: user.company_id,
        sub_company_id: user.sub_company_id,
        from_location: fromLocation,
        to_location: toLocation,
        transfer_no: transferNo,
      },
    });

    res.status(200).json({
      res: {
        transfer,
        details,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const acknowledgeStockTransfer = async (req, res, next) => {
  try {
    const { user, fromLocation, toLocation, transferNo } = req.body;

    if (!fromLocation || !toLocation || !transferNo) {
      next(createHttpError.BadRequest("All fields not found"));
    }

    await Prisma.inv_transfer.update({
      where: {
        company_id_sub_company_id_from_location_to_location_transfer_no: {
          company_id: parseInt(user.company_id),
          sub_company_id: user.sub_company_id,
          from_location: fromLocation,
          to_location: toLocation,
          transfer_no: transferNo,
        },
      },
      data: {
        acknowledge_dt: new Date(),
        received_by: user.username,
      },
    });

    res.status(200).json({
      message: "Stock Acknowledge Successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getProductQtyFromStore = async (req, res, next) => {
  try {
    const { locationCode, departmentCode, productCode } = req.query;
    const { user } = req.body;

    const storeQty = await Prisma.inv_stores.findUnique({
      where: {
        company_id_sub_company_id_location_code_department_code_product_code: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
          location_code: locationCode,
          department_code: departmentCode,
          product_code: productCode,
        },
      },
      select: {
        qty_instock: true,
      },
    });

    res.status(200).json({
      res: {
        storeQty,
      },
    });
  } catch (err) {
    next(err);
  }
};
