import Prisma from "../../../prisma/index.js";
import createHttpError from "http-errors";
import {
  calulateAvarageNumber,
  calulatePurhcaseOrderNumbers,
} from "../../services/product.service.js";

export const createPurchaseOrder = async (req, res, next) => {
  try {
    const {
      user,

      orderNo,
      orderDate,
      supplierCode,
      remarks,
      currency,
      locationCode,
      supplierInvo,
      dueDate,
      costRate,
      freight,
      nonVendorCost,
      paidAmount,
      products,
      total,
    } = req.body;

    if (products?.length === 0 || !products) {
      return next(createHttpError.BadRequest("Order Details not found "));
    }

    if (
      !orderNo ||
      !orderDate ||
      !supplierCode ||
      !remarks ||
      !currency ||
      !locationCode ||
      !supplierInvo ||
      !dueDate ||
      !costRate ||
      !freight ||
      !total ||
      !nonVendorCost
    ) {
      return next(createHttpError.BadRequest("Please fill all fields"));
    }

    Prisma.$transaction(async (Prisma) => {
      const isOrderNoExist = await Prisma.inv_purchase_order.findUnique({
        where: {
          company_id_sub_company_id_order_no: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            order_no: orderNo,
          },
        },
      });

      if (isOrderNoExist) {
        return next(createHttpError.BadRequest("Order no already exists"));
      }

      await Prisma.inv_purchase_order.create({
        data: {
          company_id: parseInt(user.company_id),
          sub_company_id: user.sub_company_id,
          order_no: orderNo,
          location_code: locationCode,
          order_dt: new Date(orderDate),
          supplier_code: supplierCode,
          supplier_invno: supplierInvo,
          currency: currency,
          remarks: remarks,
          eta: new Date(dueDate),
          order_amount: parseFloat(total),
          freight: parseFloat(freight),
          non_vendor_cost: parseFloat(nonVendorCost),
          cost_rate: parseFloat(costRate),
          amount_paid: parseFloat(paidAmount),
          fulfilled_flag: false,
          closed_flag: false,
          paid_flag: false,
          created_by: user.username,
        },
      });
      for (let i = 0; i < products.length; i++) {
        await Prisma.inv_purchase_order_detail.create({
          data: {
            company_id: parseInt(user.company_id),
            sub_company_id: user.sub_company_id,
            order_no: orderNo,
            serial_no: products[i].serialNo,
            department_code: products[i].departmentCode,
            product_code: products[i].productCode,
            qty_ordered: parseInt(products[i].qtyBackorder),
            qty_received: 0,
            cost_local:
              parseFloat(products[i].unitPrice) * parseFloat(costRate),
            cost_fc: parseFloat(products[i].unitPrice),
          },
        });

        const product = await Prisma.inv_products.findUnique({
          where: {
            company_id_sub_company_id_department_code_product_code: {
              company_id: user.company_id,
              sub_company_id: user.sub_company_id,
              department_code: products[i].departmentCode,
              product_code: products[i].productCode,
            },
          },
        });

        const qty_backorder = product.qty_backorder;

        await Prisma.inv_products.update({
          where: {
            company_id_sub_company_id_department_code_product_code: {
              company_id: user.company_id,
              sub_company_id: user.sub_company_id,
              department_code: products[i].departmentCode,
              product_code: products[i].productCode,
            },
          },
          data: {
            qty_backorder: qty_backorder + parseInt(products[i].qtyBackorder),
          },
        });

        const isStorExit = await Prisma.inv_stores.findUnique({
          where: {
            company_id_sub_company_id_location_code_department_code_product_code:
              {
                company_id: user.company_id,
                sub_company_id: user.sub_company_id,
                department_code: products[i].departmentCode,
                location_code: locationCode,
                product_code: products[i].productCode,
              },
          },
        });

        if (isStorExit) {
          await Prisma.inv_stores.update({
            where: {
              company_id_sub_company_id_location_code_department_code_product_code:
                {
                  company_id: user.company_id,
                  sub_company_id: user.sub_company_id,
                  department_code: products[i].departmentCode,
                  location_code: locationCode,
                  product_code: products[i].productCode,
                },
            },
            data: {
              qty_backorder: qty_backorder + parseInt(products[i].qtyBackorder),
            },
          });
        } else {
          await Prisma.inv_stores.create({
            data: {
              company_id: user.company_id,
              sub_company_id: user.sub_company_id,
              department_code: products[i].departmentCode,
              location_code: locationCode,
              qty_backorder: parseInt(products[i].qtyBackorder),
              qty_instock: parseInt(product.qty_instock),
              product_code: products[i].productCode,
            },
          });
        }
      }

      res.status(200).json({
        message: "Purchase Order Created Successfully",
      });
    });
  } catch (err) {
    next(err);
  }
};

export const handleOrderFullFill = async (req, res, next) => {
  try {
    const {
      user,

      orderNo,
      orderDate,
      locationCode,
      costRate,
      freight,
      nonSupplierCost,
      products,
      subTotal,
      total,
    } = req.body;

    if (
      !orderNo ||
      !orderDate ||
      !locationCode ||
      !costRate ||
      !freight ||
      !nonSupplierCost ||
      !subTotal ||
      !subTotal ||
      !total
    ) {
      return next(createHttpError.BadRequest("Please fill all fields"));
    }

    if (products?.length <= 0) {
      return next(createHttpError.BadRequest("No Products found"));
    }

    let costFc = 0;
    let costLocal = 0;

    await Prisma.$transaction(async (Prisma) => {
      for (let i = 0; i < products.length; i++) {
        const product = products[i];

        /// Fething product by product code
        const myProduct = await Prisma.inv_products.findUnique({
          where: {
            company_id_sub_company_id_department_code_product_code: {
              company_id: user.company_id,
              sub_company_id: user.sub_company_id,
              department_code: product.department_code,
              product_code: product.product_code,
            },
          },
        });

        // Total Instock qty in store
        const storeQtyInStock = await Prisma.inv_stores.aggregate({
          where: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            location_code: locationCode,
            department_code: product.department_code,
            product_code: product.product_code,
          },
          _sum: {
            qty_instock: true,
          },
        });

        // Normal Calulation
        const { costFc: costFcT, costLocal: costLocalT } =
          calulatePurhcaseOrderNumbers(
            product,
            parseFloat(costRate),
            parseFloat(freight),
            parseFloat(nonSupplierCost),
            parseFloat(subTotal),
            parseFloat(total)
          );

        console.log(costFcT, costLocalT);

        if (!costFcT || !costLocalT) {
          return next(createHttpError.BadRequest("No cost price"));
        }

        costFc = costFcT;

        // Caluclating Avarage Cost if qty > 0 in pod
        if (storeQtyInStock._sum.qty_instock > 0) {
          const { averageCost } = calulateAvarageNumber(
            storeQtyInStock._sum.qty_instock,
            myProduct.cost_price,
            costLocalT,
            parseInt(product.qty_ordered)
          );
          costLocal = averageCost;
        } else {
          costLocal = costLocalT;
        }

        if (!costLocal) {
          return next(createHttpError.BadRequest("No cost price 2"));
        }

        /// Update costfc and costLocal in pod
        await Prisma.inv_purchase_order_detail.update({
          where: {
            company_id_sub_company_id_order_no_serial_no: {
              company_id: user.company_id,
              sub_company_id: user.sub_company_id,
              order_no: orderNo,
              serial_no: product.serial_no,
            },
          },
          data: {
            qty_received: product.qty_ordered,
          },
        });

        const qty_backorder = myProduct.qty_backorder;
        const qty_instock = myProduct.qty_instock;
        const qty_purchase = myProduct.qty_purchase;

        /// Update product const and qty
        await Prisma.inv_products.update({
          where: {
            company_id_sub_company_id_department_code_product_code: {
              company_id: user.company_id,
              sub_company_id: user.sub_company_id,
              department_code: products[i].department_code,
              product_code: products[i].product_code,
            },
          },
          data: {
            cost_price: costLocal,
            qty_backorder: qty_backorder - parseInt(products[i].qty_ordered),
            qty_instock: qty_instock + parseInt(products[i].qty_ordered),
            qty_purchase: qty_purchase + parseInt(products[i].qty_ordered),
          },
        });

        /// Update store qty
        await Prisma.inv_stores.update({
          where: {
            company_id_sub_company_id_location_code_department_code_product_code:
              {
                company_id: user.company_id,
                sub_company_id: user.sub_company_id,
                department_code: products[i].department_code,
                product_code: products[i].product_code,
                location_code: locationCode,
              },
          },
          data: {
            qty_backorder: qty_backorder - parseInt(products[i].qty_ordered),
            qty_instock: qty_instock + parseInt(products[i].qty_ordered),
            qty_purchase: qty_purchase + parseInt(products[i].qty_ordered),
          },
        });

        /// Create cardex
        await Prisma.inv_cardex.create({
          data: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            from_location: locationCode,
            trans_dt: orderDate,
            trans_no: orderNo,
            trans_type: "2",
            serial_no: parseInt(products[i].serial_no),
            department_code: products[i].department_code,
            product_code: products[i].product_code,
            quantity: products[i].qty_ordered,
            username: user.username,
            cost_price: costLocal,
          },
        });
      }

      await Prisma.inv_purchase_order.update({
        where: {
          company_id_sub_company_id_order_no: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            order_no: orderNo,
          },
        },
        data: {
          fulfilled_flag: true,
        },
      });

      res.status(200).json({
        message: "Purchase Order Fullfiled Successfully",
      });
    });
  } catch (err) {
    next(err);
    console.log(err);
  }
};

export const handlePayment = async (req, res, next) => {
  try {
    const { user, orderNo, payments, subTotal, totalOrderValue } = req.body;

    if (!orderNo || !subTotal || !totalOrderValue) {
      next(createHttpError.BadRequest("Please fill all fields"));
    }

    if (payments?.length <= 0 || !payments) {
      next(createHttpError.BadRequest("Payments not found"));
    }

    await Prisma.$transaction(async (Prisma) => {
      for (let i = 0; i < payments.length; i++) {
        const payment = payments[i];

        const poPayment = await Prisma.inv_purchase_payment.findUnique({
          where: {
            company_id_sub_company_id_order_no_payment_no: {
              company_id: user.company_id,
              sub_company_id: user.sub_company_id,
              order_no: orderNo,
              payment_no: parseInt(payment.srl),
            },
          },
        });

        const paymentNo = poPayment
          ? poPayment.payment_no + parseInt(payment.srl)
          : parseInt(payment.srl);

        await Prisma.inv_purchase_payment.create({
          data: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            order_no: orderNo,
            payment_no: paymentNo,
            payment_dt: new Date(payment.date).toISOString(),
            remarks: payment.remarks,
            amount: parseFloat(payment.amount),
            created_by: user.username,
          },
        });

        const sumOfAmount = await Prisma.inv_purchase_payment.aggregate({
          where: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
            order_no: orderNo,
          },
          _sum: {
            amount: true,
          },
        });

        await Prisma.inv_purchase_order.update({
          where: {
            company_id_sub_company_id_order_no: {
              company_id: user.company_id,
              sub_company_id: user.sub_company_id,
              order_no: orderNo,
            },
          },
          data: {
            amount_paid: sumOfAmount._sum.amount,
          },
        });
      }

      const purchasePayment = await Prisma.inv_purchase_payment.aggregate({
        where: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
          order_no: orderNo,
        },
        _sum: {
          amount: true,
        },
      });

      if (
        parseFloat(totalOrderValue) == parseFloat(purchasePayment._sum.amount)
      ) {
        await Prisma.inv_purchase_order.update({
          where: {
            company_id_sub_company_id_order_no: {
              company_id: user.company_id,
              sub_company_id: user.sub_company_id,
              order_no: orderNo,
            },
          },
          data: {
            paid_flag: true,
          },
        });
      } else {
        await Prisma.inv_purchase_order.update({
          where: {
            company_id_sub_company_id_order_no: {
              company_id: user.company_id,
              sub_company_id: user.sub_company_id,
              order_no: orderNo,
            },
          },
          data: {
            paid_flag: false,
          },
        });
      }

      res.status(200).json({
        message: "Payment Created Successfully",
      });
    });
  } catch (err) {
    next(err);
  }
};

export const getAllPurhcaseOrder = async (req, res, next) => {
  try {
    const { user } = req.body;

    const purchaseOrders = await Prisma.inv_purchase_order.findMany({
      where: {
        company_id: user.company_id,
        sub_company_id: user.sub_company_id,
      },
    });

    return res.status(200).json({
      res: purchaseOrders,
    });
  } catch (err) {
    next(err);
  }
};

export const getSinglePurchaseOrder = async (req, res, next) => {
  try {
    const { orderNo } = req.query;
    const { user } = req.body;

    const purchaseOrder = await Prisma.inv_purchase_order.findUnique({
      where: {
        company_id_sub_company_id_order_no: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
          order_no: orderNo,
        },
      },
    });

    const purchaseOrderDetails =
      await Prisma.inv_purchase_order_detail.findMany({
        where: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
          order_no: orderNo,
        },
      });

    const paymentDetails = await Prisma.inv_purchase_payment.findMany({
      where: {
        company_id: user.company_id,
        sub_company_id: user.sub_company_id,
        order_no: orderNo,
      },
    });

    res.status(200).json({
      res: {
        purchaseOrder,
        purchaseOrderDetails,
        paymentDetails,
      },
    });
  } catch (err) {
    next(err);
  }
};
