import Prisma from "../../../prisma/index.js";
import puppeteer from "puppeteer";

export const purchaseOrderPdf = async (req, res, next) => {
  const { user } = req.body;
  const { orderNo } = req.query;

  try {
    const { company, purchaseOrder, supplier, purchaseOrderDetails } =
      await purchaseOrderData(user, orderNo);

    let products = [];

    // fetch all product of purchase order
    for (let i = 0; i < purchaseOrderDetails.length; i++) {
      const item = purchaseOrderDetails[i];
      const product = await fethProduct(
        item.product_code,
        item.department_code,
        user
      );
      products.push(product);
    }

    const purchaseOrderDate = new Date(purchaseOrder.order_dt);

    const dateText = `${purchaseOrderDate.getDate()} / ${
      purchaseOrderDate.getMonth() + 1
    } / ${purchaseOrderDate.getFullYear()}`;

    // Launch a headless browser
    const browser = await puppeteer.launch();

    // Open a new page
    const page = await browser.newPage();

    const subTotal = purchaseOrderDetails.reduce(
      (total, item) =>
        total + parseFloat(item.qty_ordered) * parseFloat(item.cost_fc),
      0
    );

    // Set the HTML content to render
    const htmlContent = `
        <!DOCTYPE html>
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
    
        <style>
          body,
          h1,
          h2,
          h3,
          h4,
          p {
            padding: 0;
            margin: 0;
          }
          .mainContainer {
            margin-left: 50px;
            margin-right: 50px;
          }
          .infoContainer {
            margin-top: 40px;
            margin-bottom: 20px;
            display: flex;
    
            justify-content: space-between;
          }
          .supplierInfo {
            display: flex;
            flex-direction: column;
            row-gap: 2px;
            margin-top: 10px;
            border: 1px solid black;
            padding: 10px;
          }
          .supplierContact {
            margin-top: 20px;
          }
          .shipToInfo {
            display: flex;
            flex-direction: column;
            row-gap: 2px;
            margin-top: 10px;
            border: 1px solid black;
            padding: 10px;
          }
    
          .grid-container {
            display: grid;
            align-content: center;
            grid-template-columns: 1fr 1fr 1fr 3fr 1fr 1fr 1fr;
          }
    
          .grid-item {
            font-size: 12px;
            padding: 10px;
            border: 1px solid;
          }
    
          .smallest {
            grid-column: 1;
          }
    
          .largest {
            grid-column: 4;
          }
        </style>
      </head>
      <body>
        <main class="mainContainer">
          <section style="margin-top: 20px">
            <h2 style="text-align: center">${company.company_name}</h2>
            <h4 style="text-align: center; margin-top: 10px">Purchase Order</h4>
          </section>
          <section class="infoContainer">
            <section>
              <p>
                Order #
                <span style="padding-left: 100px; font-weight: 600">${orderNo}</span>
              </p>
              <div class="supplierInfo">
                <p>${supplier.supplier_name}</p>
                <p>${supplier.address_1}</p>
                <p>${supplier.address_2}</p>
                <p>${supplier.country}</p>
              </div>
              <div>
                <div class="supplierContact">
                  <p style="font-weight: 600; margin-bottom: 5px">Contact</p>
                  <p>${supplier.telephone_no}</p>
                </div>
                <div class="supplierContact">
                  <p style="font-weight: 600; margin-bottom: 5px">Phone</p>
                  <p>${supplier.mobile_no}</p>
                </div>
                <div class="supplierContact">
                  <p style="font-weight: 600; margin-bottom: 5px">Email</p>
                  <p>${supplier.email}</p>
                </div>
              </div>
            </section>
            <section>
              <p>
                Date:
                <span style="padding-left: 100px; font-weight: 600">${dateText}</span>
              </p>
              <div style="text-align: right" class="shipToInfo">
                <p style="text-align: center; margin-bottom: 10px">
                  Ship To Address
                </p>
                <p>${supplier.supplier_name}</p>
                <p>${supplier.address_1}</p>
                <p>${supplier.address_2}</p>
                <p>${supplier.country}</p>
              </div>
            </section>
          </section>
          <div class="grid-container">
            <div style="background-color: #f2f2f2" class="grid-item smallest">
              Srl
            </div>
            <div style="background-color: #f2f2f2" class="grid-item">
              Department
            </div>
            <div style="background-color: #f2f2f2" class="grid-item">Product</div>
            <div style="background-color: #f2f2f2" class="grid-item largest">
              Description
            </div>
            <div style="background-color: #f2f2f2" class="grid-item">
              Unit Price
            </div>
            <div style="background-color: #f2f2f2" class="grid-item">Quantity</div>
            <div style="background-color: #f2f2f2" class="grid-item">Value</div>
          </div>
    
          ${purchaseOrderDetails
            ?.map(
              (item, i) =>
                `<div class="grid-container">
            <div class="grid-item smallest">${item.serial_no}</div>
            <div class="grid-item">${item.department_code}</div>
            <div class="grid-item">${item.product_code}</div>
            <div class="grid-item largest">${
              products[i].product_description
            }</div>
            <div class="grid-item">${item.cost_fc}</div>
            <div class="grid-item">${item.qty_ordered}</div>
            <div class="grid-item">${
              parseInt(item.cost_fc) * parseInt(item.qty_ordered)
            }
            </div>
          </div>`
            )
            .join("")}
    
          <div style="display: flex; justify-content: flex-end;">
            <p style="border: 1px solid; padding: 10px">Sub Total</p>
            <p style="border: 1px solid; padding: 10px; font-size:14px;">${subTotal}</p>
          </div>
        </main>
      </body>
    </html>
    
        `;

    // Set the content of the page
    await page.setContent(htmlContent);

    // Generate the PDF
    const pdf = await page.pdf();

    // Set the response headers for PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=custom.pdf");

    // Send the generated PDF to the client
    res.send(pdf);

    // Close the browser
    await browser.close();
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const purchaseOrderData = async (user, orderNo) => {
  const company = await Prisma.gl_companies.findUnique({
    where: {
      company_id: user.company_id,
    },
    select: {
      company_name: true,
    },
  });

  const purchaseOrder = await Prisma.inv_purchase_order.findUnique({
    where: {
      company_id_sub_company_id_order_no: {
        company_id: user.company_id,
        sub_company_id: user.sub_company_id,
        order_no: orderNo,
      },
    },
  });

  const supplier = await Prisma.inv_suppliers.findUnique({
    where: {
      company_id_sub_company_id_supplier_code: {
        company_id: user.company_id,
        sub_company_id: user.sub_company_id,
        supplier_code: purchaseOrder.supplier_code,
      },
    },
  });

  const purchaseOrderDetails = await Prisma.inv_purchase_order_detail.findMany({
    where: {
      company_id: user.company_id,
      sub_company_id: user.sub_company_id,
      order_no: purchaseOrder.order_no,
    },
  });

  return {
    company,
    purchaseOrder,
    supplier,
    purchaseOrderDetails,
  };
};

const fethProduct = async (productId, departmentCode, user) => {
  const product = await Prisma.inv_products.findUnique({
    where: {
      company_id_sub_company_id_department_code_product_code: {
        company_id: user.company_id,
        sub_company_id: user.sub_company_id,
        product_code: productId,
        department_code: departmentCode,
      },
    },
  });

  return product;
};
