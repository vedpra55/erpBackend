import Prisma from "../../../prisma/index.js";
import { getSummaryData } from "../filterData.js";
import createHttpError from "http-errors";
import puppeteer from "puppeteer";

export const StockLevelReport = async (req, res, next) => {
  try {
    const { departmentCode, locationCode, status, closed, user } = req.body;

    let locStatus = "";
    let deparmentStatus = "";

    const company = await Prisma.gl_companies.findUnique({
      where: {
        company_id: user.company_id,
      },
    });

    let departments;
    let location;
    if (departmentCode[0] === "All") {
      deparmentStatus = "All";
      departments = await Prisma.inv_department.findMany({
        where: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
        },
      });
    } else {
      const depCodes = departmentCode
        .map((item) => item.department_code)
        .join(", ");
      deparmentStatus = depCodes;
      departments = departmentCode;
    }

    if (locationCode === "All") {
      locStatus = "All";
      location = await Prisma.inv_locations.findMany({
        where: {
          company_id: user.company_id,
          sub_company_id: user.sub_company_id,
        },
      });
    } else {
      locStatus = locationCode;
      location = locationCode;
    }

    if (!location || location?.length === 0 || departments?.length === 0) {
      return next(createHttpError.BadRequest("No data found"));
    }

    const filter = {
      departments,
      location,
      closed,
      status,
    };

    const { summaryData, result } = await getSummaryData(filter, user);

    if (summaryData.length === 0) {
      return next(createHttpError.BadRequest("No data found"));
    }

    const productQuantities = {};

    for (const item of result) {
      for (const product of item.products) {
        for (const location of product.locations) {
          if (!productQuantities[product.product_code]) {
            productQuantities[product.product_code] = 0;
          }
          productQuantities[product.product_code] += location.qty_instock;
        }
      }
    }

    const departmentQuantities = [];

    for (const item of result) {
      const { department_code, products } = item;
      let departmentData = departmentQuantities.find(
        (dept) => dept.department_code === department_code
      );

      if (!departmentData) {
        departmentData = { department_code, quantities: [] };
        departmentQuantities.push(departmentData);
      }

      for (const product of products) {
        for (const location of product.locations) {
          const locationData = departmentData.quantities.find(
            (qty) => qty.location_code === location.location_code
          );
          if (!locationData) {
            departmentData.quantities.push({
              location_code: location.location_code,
              qty_instock: location.qty_instock,
            });
          } else {
            locationData.qty_instock += location.qty_instock;
          }
        }
      }
    }

    const mainDepartmentQuantities = [];

    for (const item of result) {
      const { department_code, products } = item;
      let departmentData = mainDepartmentQuantities.find(
        (dept) => dept.department_code === department_code
      );

      if (!departmentData) {
        departmentData = { department_code, total_qty_instock: 0 };
        mainDepartmentQuantities.push(departmentData);
      }

      for (const product of products) {
        for (const location of product.locations) {
          departmentData.total_qty_instock += location.qty_instock;
        }
      }
    }

    const departmentQuantities2 = [];

    const allLocationCodes = [];

    for (const item of result) {
      const { department_code, products } = item;
      let departmentData = departmentQuantities2.find(
        (dept) => dept.department_code === department_code
      );

      if (!departmentData) {
        departmentData = {
          department_code,
          total_qty_instock: 0,
          quantities: [],
        };
        departmentQuantities2.push(departmentData);
      }

      for (const product of products) {
        for (const location of product.locations) {
          departmentData.total_qty_instock += location.qty_instock;

          if (!allLocationCodes.includes(location.location_code)) {
            allLocationCodes.push(location.location_code);
          }

          const locationData = departmentData.quantities.find(
            (qty) => qty.location_code === location.location_code
          );
          if (!locationData) {
            departmentData.quantities.push({
              location_code: location.location_code,
              qty_instock: location.qty_instock,
            });
          } else {
            locationData.qty_instock += location.qty_instock;
          }
        }
      }
    }

    const allDepartments = await getDepartments(user);

    const allLocations = await getLocations(user);

    function getDepartmentName(department_code) {
      const name = allDepartments.filter(
        (res) => res.department_code === department_code
      )[0];

      return name.department_name;
    }

    function getLocationName(location_code) {
      const name = allLocations.filter(
        (res) => res.location_code === location_code
      )[0];

      return name.location_name;
    }

    const htmlContent = `
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
      .queryDataContainer {
        margin-bottom: 10px;
        font-weight: 600;
        width: 300px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .grid-container {
        display: grid;
        grid-template-columns: 0.5fr 0.5fr 3fr 0.5fr;
      }

      .grid-item {
        background-color: #f2f2f2;
        padding: 5px;
        text-align: center;
        border: 1px solid;
        font-size: 14px;
      }

      .smallest {
        grid-column: 1, 4;
      }

      .largest {
        grid-column: 3;
      }
      .grid-container2 {
        display: grid;
        grid-template-columns: repeat(9, 1fr);
      }

      .grid-item2 {
        background-color: #f2f2f2;
        padding: 5px;
        border: 1px solid;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <main class="mainContainer">
      <section style="margin-top: 20px">
        <h2 style="text-align: center">${company.company_name}</h2>
        <h4 style="text-align: center; margin-top: 10px">
          Stock Levels Report
        </h4>
      </section>
      <section class="infoContainer">
        <div>
          <div class="queryDataContainer">
            <p>Location</p>
            <p>${locStatus}</p>
          </div>
          <div class="queryDataContainer">
            <p>Department</p>
            <p>${deparmentStatus}</p>
          </div>
          <div class="queryDataContainer">
            <p>Closed</p>
            <p>All</p>
          </div>
          <div class="queryDataContainer">
            <p>Status</p>
            <p>${status.type} ${status.value}</p>
          </div>
        </div>
        <div style="font-weight: 600">
          <p>Date : <span style="margin-left: 30px">28/06/2023</span></p>
        </div>
      </section>
      ${result
        ?.map(
          (mainItem, index) =>
            `
        <div class="grid-container">
          <div class="grid-item smallest">Department</div>
          <div class="grid-item">${mainItem.department_code}</div>
          <div class="grid-item largest">${getDepartmentName(
            mainItem.department_code
          )}</div>
          <div class="grid-item smallest"></div>
        </div>
        <div class="grid-container2">
        <div style="background-color: white" class="grid-item2"></div>
        <div class="grid-item2"></div>

        ${allLocationCodes
          .map(
            (loc) => ` <div class="grid-item2">${getLocationName(loc)}</div>`
          )
          .join(" ")}
        <div class="grid-item2"></div>
      </div>
      <div class="grid-container2">
        <div style="background-color: white" class="grid-item2"></div>
        <div class="grid-item2">Product</div>
        ${allLocationCodes
          .map(
            (loc) =>
              ` <div style="background-color: white" class="grid-item2"></div>`
          )
          .join(" ")}
      <div class="grid-item2">Total</div>
    </div>

    ${mainItem.products
      .map(
        (res, i) =>
          `
      <div class="grid-container2">
      <div style="background-color: white" class="grid-item2"></div>
      <div style="background-color: white" class="grid-item2">${
        res.product_code
      }</div>
      ${allLocationCodes
        .map(
          (item, ii) =>
            `<div style="background-color: white" class="grid-item2">
          ${
            res.locations[ii]?.location_code === item
              ? res.locations[ii]?.qty_instock
              : 0
          }
        </div>`
        )

        .join(" ")}
        <div style="background-color: white" class="grid-item2">${
          productQuantities[res.product_code]
        }</div>
    </div>
      `
      )
      .join(" ")}
        
      <div class="grid-container2">
      <div style="background-color: white" class="grid-item2"></div>
      <div class="grid-item2">Total</div>



        ${departmentQuantities[index].quantities
          .map(
            (item, i) => `<div class="grid-item2">${item.qty_instock}</div>

          `
          )
          .join(" ")}  
          <div class="grid-item2">${
            mainDepartmentQuantities[index].total_qty_instock
          }</div>

    </div>
      `
        )
        .join(" ")}

    </main>
  </body>
</html>

    `;

    // Launch a headless browser
    const browser = await puppeteer.launch();

    // Open a new page
    const page = await browser.newPage();

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

const getDepartments = async (user) => {
  const departments = await Prisma.inv_department.findMany({
    where: {
      company_id: user.company_id,
      sub_company_id: user.sub_company_id,
    },
  });

  return departments;
};

const getLocations = async (user) => {
  const locations = await Prisma.inv_locations.findMany({
    where: {
      company_id: user.company_id,
      sub_company_id: user.sub_company_id,
    },
  });

  return locations;
};
