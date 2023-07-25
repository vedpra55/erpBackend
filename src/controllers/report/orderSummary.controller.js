import Prisma from "../../../prisma/index.js";
import puppeteer from "puppeteer";
import createHttpError from "http-errors";

export const PurchaseOrderSummaryPdf = async (req, res, next) => {
  try {
    const { supplierCode, poDate, poToDate, status, user } = req.body;

    console.log(poDate);

    let summary;

    const company = await Prisma.gl_companies.findUnique({
      where: {
        company_id: user.company_id,
      },
      select: {
        company_name: true,
      },
    });

    const supplier = await Prisma.inv_suppliers.findUnique({
      where: {
        company_id_sub_company_id_supplier_code: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
          supplier_code: supplierCode,
        },
      },
    });

    const { purchaseOrder, purchaseOrderDetails } = await getPdfData(
      supplierCode,
      poDate,
      poToDate,
      status,
      user.company_id,
      user.sub_company_id
    );

    if (!purchaseOrder.length || !purchaseOrderDetails.length) {
      return next(createHttpError.BadRequest("No data found"));
    }

    summary = purchaseOrder.map((order) => {
      const purchaseOrderDetails2 = purchaseOrderDetails.find(
        (details) => details[0].order_no === order.order_no
      );
      return {
        purchaseOrder: order,
        purchaseOrderDetails: purchaseOrderDetails2 || [],
      };
    });

    //const products = [];

    async function fetchProducts() {
      const products = summary[0].purchaseOrderDetails?.map(
        async (item2) =>
          await fethProduct(item2.product_code, item2.department_code, user)
      );

      // Use Promise.all to wait for all the async calls to complete
      return await Promise.all(products);
    }

    const products = await fetchProducts();

    // Launch a headless browser
    const browser = await puppeteer.launch();

    // Open a new page
    const page = await browser.newPage();

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
            margin-left: 25px;
            margin-right: 25px;
            margin-bottom: 50px;
          }
          .infoContainer {
            margin-top: 40px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
          }
          .infoItem {
            margin-bottom: 20px;
            display: flex;
            flex-wrap: wrap;
            width: 350px;
            row-gap: 10px;
            justify-content: space-between;
            font-weight: 600;
            font-size: 14px;
          }
          .grid-container {
            display: grid;
            align-content: center;
            grid-template-columns: 1fr 4fr 1fr 1fr 1fr 1fr 1fr;
          }
          .grid-item {
            font-size: 12px;
            padding: 5px;
            border: 1px solid;
          }
          .smallest {
            grid-column: 1;
          }
    
          .largest {
            grid-column: 2;
          }
          .grid-container2 {
            display: grid;
            align-content: center;
            grid-template-columns: 1fr 2fr 1fr 1fr 2fr 1fr 1fr 1fr;
          }
          .grid-container3 {
            display: grid;
            align-content: center;
            grid-template-columns: 1fr 8fr 1fr;
          }
        </style>
      </head>
      <body>
        <main class="mainContainer">
          <section style="margin-top: 20px">
            <h2 style="text-align: center">${company.company_name}</h2>
            <h4 style="text-align: center; margin-top: 10px">
              Purchase Order Details
            </h4>
          </section>
          <section class="infoContainer">
            <section>
              <div class="infoItem">
                <p>Supplier: <span style="margin-left: 10px">${
                  supplier.supplier_code
                }</span></p>
                <p>
                  <span>${supplier.supplier_name}</span>
                </p>
              </div>
              <div class="infoItem">
                <p>PO Date: <span style="margin-left: 10px">${poDate}</span></p>
                <p>
                  PO To Date: <span style="margin-left: 10px">${poToDate}</span>
                </p>
              </div>
              <div class="infoItem">
                <p>Status: <span style="margin-left: 10px">${status}</span></p>
              </div>
            </section>
            <section>
              <p style="font-weight: 600">Date : <span>12/06/2023</span></p>
            </section>
          </section>
          <div>
            ${summary
              .map(
                (item, i) =>
                  `
                <div class="grid-container">
                <div style="background-color: #f2f2f2" class="grid-item smallest">
                  Supplier
                </div>
                <div style="background-color: #f2f2f2" class="grid-item">Name</div>
                <div style="background-color: #f2f2f2" class="grid-item">Order #</div>
                <div style="background-color: #f2f2f2" class="grid-item">Date</div>
                <div style="background-color: #f2f2f2" class="grid-item">Amount</div>
                <div style="background-color: #f2f2f2" class="grid-item">Paid</div>
                <div style="background-color: #f2f2f2" class="grid-item">Balance</div>
              </div>
              <div class="grid-container">
              <div class="grid-item smallest">${supplier.supplier_code}</div>
              <div class="grid-item">${supplier.supplier_name}</div>
              <div class="grid-item">${item.purchaseOrder.order_no}</div>
              <div class="grid-item">${new Date(
                item.purchaseOrder.order_dt
              ).getDate()} / 
              ${new Date(item.purchaseOrder.order_dt).getMonth() + 1} / 
              ${new Date(item.purchaseOrder.order_dt).getFullYear()}
              </div>
              <div class="grid-item">${item.purchaseOrder.order_amount}</div>
              <div class="grid-item">${item.purchaseOrder.amount_paid}</div>
              <div class="grid-item">${
                item.purchaseOrder.order_amount - item.purchaseOrder.amount_paid
              }</div>
            </div>
            
            <div class="grid-container2">
              <div class="grid-item smallest"></div>
              <div style="background-color: #f2f2f2" class="grid-item">Serial</div>
              <div style="background-color: #f2f2f2" class="grid-item">
                Department
              </div>
              <div style="background-color: #f2f2f2" class="grid-item">Product</div>
              <div style="background-color: #f2f2f2" class="grid-item">
                Description
              </div>
              <div style="background-color: #f2f2f2" class="grid-item">
                Unit Price
              </div>
              <div style="background-color: #f2f2f2" class="grid-item">Qty</div>
              <div style="background-color: #f2f2f2" class="grid-item">Value</div>
            </div>
            ${item.purchaseOrderDetails
              ?.map((item2, i) => {
                return `
                <div class="grid-container2">
                <div class="grid-item smallest"></div>
                <div class="grid-item">${item2.serial_no}</div>
                <div class="grid-item">${item2.department_code}</div>
                <div class="grid-item">${item2.product_code}</div>
                <div class="grid-item">${products[i].product_description}</div>
                <div class="grid-item">${item2.cost_fc}</div>
                <div class="grid-item">${item2.qty_ordered}</div>
                <div class="grid-item">${
                  item2.cost_fc * item2.qty_ordered
                }</div>
                </div>
            `;
              })
              .join("")}
    
              ${`
                <div class="grid-container3">
              <div class="grid-item"></div>
              <div style="text-align: center" class="grid-item">Total</div>
              <div class="grid-item">1,60,000</div>
                `}
            </div>
    
                `
              )
              .join("")}
    
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
    next(err);
    console.log(err);
  }
};

async function getPdfData(
  supplierCode,
  poDate,
  poToDate,
  status,
  companyId,
  subCompanyId
) {
  let purchaseOrder = null;
  let purchaseOrderDetails = [];
  let query = null;

  if (status === "All") {
    query = {
      company_id: parseInt(companyId),
      sub_company_id: parseInt(subCompanyId),
      supplier_code: supplierCode,
      order_dt: {
        gt: new Date(poDate).toISOString(),
        lt: new Date(poToDate).toISOString(),
      },
    };
  }
  if (status === "Paid") {
    query = {
      company_id: parseInt(companyId),
      sub_company_id: parseInt(subCompanyId),
      supplier_code: supplierCode,
      paid_flag: true,
      order_dt: {
        gt: new Date(poDate).toISOString(),
        lt: new Date(poToDate).toISOString(),
      },
    };
  }
  if (status === "FullFilled") {
    query = {
      company_id: parseInt(companyId),
      sub_company_id: parseInt(subCompanyId),
      supplier_code: supplierCode,
      fulfilled_flag: true,
      order_dt: {
        gt: new Date(poDate).toISOString(),
        lt: new Date(poToDate).toISOString(),
      },
    };
  }
  if (status === "Started") {
    query = {
      company_id: parseInt(companyId),
      sub_company_id: parseInt(subCompanyId),
      supplier_code: supplierCode,
      fulfilled_flag: false,
      order_dt: {
        gt: new Date(poDate).toISOString(),
        lt: new Date(poToDate).toISOString(),
      },
    };
  }

  purchaseOrder = await Prisma.inv_purchase_order.findMany({
    where: query,
  });

  for (let i = 0; i < purchaseOrder.length; i++) {
    const d = await Prisma.inv_purchase_order_detail.findMany({
      where: {
        company_id: parseInt(companyId),
        sub_company_id: parseInt(subCompanyId),
        order_no: purchaseOrder[i].order_no,
      },
    });
    purchaseOrderDetails.push(d);
  }

  return {
    purchaseOrder,
    purchaseOrderDetails,
  };
}

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
