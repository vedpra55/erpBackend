// inventoryService.js
import prisma from "../../prisma/index.js";

export async function getSummaryData(filter, user) {
  const { departments, location, closed, status } = filter;

  let where = {};

  const departmentCodes = departments.map((dept) => dept.department_code);
  let locationCodes;

  if (Array.isArray(location) && location.length !== 0) {
    locationCodes = location.map((dept) => dept.location_code);
  }

  if (departments && departments.length && departmentCodes) {
    where.department_code = { in: departmentCodes };
  }

  if (Array.isArray(location) && location.length !== 0) {
    where.location_code = { in: locationCodes };
  } else {
    where.location_code = location;
  }

  if (status) {
    if (status.type === "Greater Than") {
      where.qty_instock = { gt: parseInt(status.value) };
    } else if (status.type === "Less Than") {
      where.qty_instock = { lt: parseInt(status.value) };
    } else if (status.type === "Equal Than") {
      where.qty_instock = { equals: parseInt(status.value) };
    }
  }

  where.sub_company_id = user.sub_company_id;
  where.company_id = user.company_id;

  console.log(where);

  const summaryData = await prisma.inv_stores.findMany({
    where,
    select: {
      company_id: true,
      sub_company_id: true,
      location_code: true,
      department_code: true,
      product_code: true,
      qty_instock: true,
    },
  });

  function groupDataByDepartment(data) {
    const groupedData = {};
    data.forEach((item) => {
      const { department_code, product_code, location_code, qty_instock } =
        item;
      if (!groupedData[department_code]) {
        groupedData[department_code] = { department_code, products: [] };
      }
      const product = groupedData[department_code].products.find(
        (prod) => prod.product_code === product_code
      );
      if (product) {
        product.locations.push({ location_code, qty_instock });
      } else {
        groupedData[department_code].products.push({
          product_code,
          locations: [{ location_code, qty_instock }],
        });
      }
    });
    return Object.values(groupedData);
  }

  const result = groupDataByDepartment(summaryData);

  return {
    summaryData,
    result,
  };
}
