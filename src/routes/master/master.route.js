import express from "express";

import departmentRoute from "./department.route.js";
import productRoute from "./product.route.js";
import supplierRoute from "./supplier.route.js";
import locationRoute from "./location.route.js";

const app = express();

app.use("/department", departmentRoute);
app.use("/product", productRoute);
app.use("/supplier", supplierRoute);
app.use("/location", locationRoute);

export default app;
