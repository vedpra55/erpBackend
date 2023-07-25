import createHttpError from "http-errors";
import Prisma from "../../../prisma/index.js";
import { fillterSuppliers } from "../../services/product.service.js";

export const createProduct = async (req, res, next) => {
  try {
    const {
      departmentCode,
      productCode,
      productDescription,
      qtyInStock,
      qtyPurchase,
      qtyBackOrder,
      costPrice,
      sellingPrice,
      closedFlag,
      selectedSuppliers,
      user,
    } = req.body;

    if (!departmentCode || !productCode || !productDescription) {
      next(createHttpError.BadRequest("Please fill all fields"));
    }

    if (selectedSuppliers?.length <= 0) {
      next(createHttpError.BadRequest("No suppliers found"));
    }

    await Prisma.$transaction(async (Prisma) => {
      const productCodeExit = await Prisma.inv_products.findUnique({
        where: {
          company_id_sub_company_id_department_code_product_code: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            department_code: departmentCode,
            product_code: productCode,
          },
        },
        select: {
          product_code: true,
        },
      });

      if (productCodeExit) {
        next(createHttpError("Product code already exits"));
      }

      await Prisma.inv_products.create({
        data: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
          department_code: departmentCode,
          product_code: productCode,
          product_description: productDescription,
          qty_instock: qtyInStock ? parseInt(qtyInStock) : 0,
          qty_backorder: qtyBackOrder ? parseInt(qtyBackOrder) : 0,
          qty_purchase: qtyPurchase ? parseInt(qtyPurchase) : 0,
          cost_price: costPrice ? parseFloat(costPrice) : 0,
          selling_price: sellingPrice ? parseFloat(sellingPrice) : 0,
          created_by: user.username,
          closed_flag: closedFlag,
        },
      });

      for (let i = 0; i < selectedSuppliers?.length; i++) {
        await Prisma.inv_product_suppliers.create({
          data: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            supplier_code: selectedSuppliers[i].supplier_code,
            department_code: departmentCode,
            product_code: productCode,
            created_by: user.username,
          },
        });
      }

      res.status(200).json({
        message: "Product created sucessfully",
      });
    });
  } catch (err) {
    next(err);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const { user } = req.body;

    const products = await Prisma.inv_products.findMany({
      where: {
        company_id: user.company_id,
        sub_company_id: user.sub_company_id,
      },
    });
    res.status(200).json({
      res: products,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { departmentCode, productCode } = req.query;

    if (!departmentCode || !productCode) {
      next(createHttpError.BadRequest("Please provide ids"));
    }

    const { user } = req.body;

    const product = await Prisma.inv_products.findUnique({
      where: {
        company_id_sub_company_id_department_code_product_code: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
          department_code: departmentCode,
          product_code: productCode,
        },
      },
    });

    const productSuppliers = await Prisma.inv_product_suppliers.findMany({
      where: {
        company_id: user.company_id,
        sub_company_id: user.sub_company_id,
        product_code: productCode,
        department_code: departmentCode,
        closed_flag: false,
      },
      select: {
        supplier_code: true,
      },
    });

    let suppliers = [];

    for (let i = 0; productSuppliers.length > i; i++) {
      const supplier = await Prisma.inv_suppliers.findUnique({
        where: {
          company_id_sub_company_id_supplier_code: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            supplier_code: productSuppliers[i].supplier_code,
          },
        },
      });
      suppliers.push(supplier);
    }

    res.status(200).json({
      res: {
        product,
        suppliers,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const {
      departmentCode,
      productCode,
      productDescription,
      costPrice,
      sellingPrice,

      selectedSuppliers,
      oldSuppliers,
      user,
    } = req.body;

    if (
      !departmentCode ||
      !productCode ||
      !productDescription ||
      !costPrice ||
      !sellingPrice
    ) {
      next(createHttpError.BadRequest("Please fill all fields"));
    }

    if (selectedSuppliers?.length <= 0 || !selectedSuppliers) {
      next(createHttpError.BadRequest("No suppliers found"));
    }

    const orignialSupplier = fillterSuppliers(oldSuppliers, selectedSuppliers);
    const newSupplier = fillterSuppliers(selectedSuppliers, oldSuppliers);

    await Prisma.$transaction(async (Prisma) => {
      await Prisma.inv_products.update({
        where: {
          company_id_sub_company_id_department_code_product_code: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            department_code: departmentCode,
            product_code: productCode,
          },
        },
        data: {
          cost_price: parseFloat(costPrice),
          selling_price: parseFloat(sellingPrice),
          product_description: productDescription,
        },
      });

      if (oldSuppliers?.length < 0) {
        if (selectedSuppliers?.length > 0) {
          for (let i = 0; i < selectedSuppliers?.length; i++) {
            await Prisma.inv_product_suppliers.create({
              data: {
                company_id: user.company_id,
                sub_company_id: user.sub_company_id,
                department_code: departmentCode,
                product_code: productCode,
                supplier_code: newSupplier[i].supplier_code,
                closed_flag: false,
                created_by: user.username,
              },
            });
          }
        }
      }

      if (orignialSupplier?.length > 0) {
        for (let i = 0; i < orignialSupplier.length; i++) {
          await Prisma.inv_product_suppliers.update({
            where: {
              company_id_sub_company_id_supplier_code_department_code_product_code:
                {
                  company_id: parseInt(user.company_id),
                  sub_company_id: user.sub_company_id,
                  department_code: departmentCode,
                  product_code: productCode,
                  supplier_code: orignialSupplier[i].supplier_code,
                },
            },
            data: {
              closed_flag: true,
            },
          });
        }
      }

      if (newSupplier?.length > 0) {
        for (let i = 0; i < newSupplier.length; i++) {
          const isExit = await Prisma.inv_product_suppliers.findUnique({
            where: {
              company_id_sub_company_id_supplier_code_department_code_product_code:
                {
                  company_id: user.company_id,
                  sub_company_id: user.sub_company_id,
                  department_code: departmentCode,
                  product_code: productCode,
                  supplier_code: newSupplier[i].supplier_code,
                },
            },
          });
          if (isExit) {
            await Prisma.inv_product_suppliers.update({
              where: {
                company_id_sub_company_id_supplier_code_department_code_product_code:
                  {
                    company_id: user.company_id,
                    sub_company_id: user.sub_company_id,
                    department_code: departmentCode,
                    product_code: productCode,
                    supplier_code: newSupplier[i].supplier_code,
                  },
              },
              data: {
                closed_flag: false,
              },
            });
          }
          if (!isExit) {
            await Prisma.inv_product_suppliers.create({
              data: {
                company_id: user.company_id,
                sub_company_id: user.sub_company_id,
                department_code: departmentCode,
                product_code: productCode,
                supplier_code: newSupplier[i].supplier_code,
                closed_flag: false,
                created_by: user.username,
              },
            });
          }
        }
      }

      res.status(200).json({
        message: "Product update successfully",
      });
    });
  } catch (err) {
    next(err);
  }
};

export const getAllProductSuppliers = async (req, res, next) => {
  try {
    const { user } = req.body;

    const productSuppliers = await Prisma.inv_product_suppliers.findMany({
      where: {
        company_id: user.company_id,
        sub_company_id: user.sub_company_id,
      },
    });
    res.status(200).json({
      res: productSuppliers,
    });
  } catch (err) {
    next(err);
  }
};
