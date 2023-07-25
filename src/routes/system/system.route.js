import express from "express";
import authRoute from "./auth.route.js";
import companyRoute from "./company.route.js";
import subCompanyRoute from "./subCompany.route.js";
import programRoute from "./program.route.js";
import roleRoute from "./role.route.js";

const app = express();

app.use("/auth", authRoute);
app.use("/company", companyRoute);
app.use("/subCompany", subCompanyRoute);
app.use("/program", programRoute);
app.use("/role", roleRoute);

export default app;
