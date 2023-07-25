import createHttpError from "http-errors";
import Prisma from "../../prisma/index.js";
import { hashPassword } from "../utils/hashPassword.js";

export const createUser = async (email, password, username, companyName) => {
  let user;
  try {
    if (!email || !password || !username || !companyName) {
      createHttpError.BadRequest("Please Fill all fields");
    }

    await Prisma.$transaction(async (Prisma) => {
      // check Company name exits
      const isNameExit = await Prisma.gl_companies.findUnique({
        where: {
          company_name: companyName,
        },
      });

      if (isNameExit) {
        throw createHttpError.BadRequest("Comapny already in use");
      }

      // check name or email of user exit
      const userExist = await Prisma.sys_users.findFirst({
        where: {
          OR: [{ email: email }, { username: username }],
        },
      });

      if (userExist) {
        throw createHttpError.BadRequest("Name or email already exist");
      }

      // Create Company
      const company = await Prisma.gl_companies.create({
        data: {
          company_name: companyName,
        },
      });

      // Create Sub company
      const subCompany = await Prisma.gl_sub_companies.create({
        data: {
          sub_company_id: 1,
          sub_company_name: companyName,
          company_id: company.company_id,
        },
      });

      // Create admin role
      const adminRole = await Prisma.sys_roles.create({
        data: {
          role_name: "admin",
          company_id: company.company_id,
          sub_company_id: subCompany.sub_company_id,
        },
      });

      // list of programs
      const programsData = [
        {
          program_name: "Categories",
          sub_company_id: subCompany.sub_company_id,
          company_id: company.company_id,
        },
        {
          program_name: "Suppliers",
          sub_company_id: subCompany.sub_company_id,
          company_id: company.company_id,
        },
        {
          program_name: "Locations",
          sub_company_id: subCompany.sub_company_id,
          company_id: company.company_id,
        },
        {
          program_name: "Products",
          sub_company_id: subCompany.sub_company_id,
          company_id: company.company_id,
        },
        {
          program_name: "Purchase Order Creation",
          sub_company_id: subCompany.sub_company_id,
          company_id: company.company_id,
        },
        {
          program_name: "Transfer Creation",
          sub_company_id: subCompany.sub_company_id,
          company_id: company.company_id,
        },
        {
          program_name: "Purchase Document",
          sub_company_id: subCompany.sub_company_id,
          company_id: company.company_id,
        },
        {
          program_name: "Transfer Document",
          sub_company_id: subCompany.sub_company_id,
          company_id: company.company_id,
        },
        {
          program_name: "Stock Balance Report",
          sub_company_id: subCompany.sub_company_id,
          company_id: company.company_id,
        },
        {
          program_name: "Create roles",
          sub_company_id: subCompany.sub_company_id,
          company_id: company.company_id,
        },
        {
          program_name: "Create Users",
          sub_company_id: subCompany.sub_company_id,
          company_id: company.company_id,
        },
        {
          program_name: "Create Sub Company",
          sub_company_id: subCompany.sub_company_id,
          company_id: company.company_id,
        },
        {
          program_name: "Assign Programs",
          sub_company_id: subCompany.sub_company_id,
          company_id: company.company_id,
        },
      ];

      // Create  programs

      programsData.forEach(async (item) => {
        await Prisma.sys_programs.create({
          data: {
            program_name: item.program_name,
            sub_company_id: item.sub_company_id,
            company_id: item.company_id,
          },
        });
      });

      // Get all programs
      const system_programs = await Prisma.sys_programs.findMany({
        where: {
          company_id: company.company_id,
          sub_company_id: subCompany.sub_company_id,
        },
      });

      // Create  Role programs

      system_programs.forEach(async (item) => {
        await Prisma.sys_roleprograms.create({
          data: {
            company_id: item.company_id,
            sub_company_id: item.sub_company_id,
            program_id: item.program_id,
            role_name: adminRole.role_name,
            access: true,
          },
        });
      });

      // Hash the password
      const hashedPassword = hashPassword(password);

      // Create the user
      user = await Prisma.sys_users.create({
        data: {
          email,
          password: hashedPassword,
          username,
          company_id: company.company_id,
          sub_company_id: subCompany.sub_company_id,
          role_name: adminRole.role_name,
          verified: false,
        },
      });
    });

    return {
      user,
    };
  } catch (err) {
    throw createHttpError.BadRequest(err.message);
  }
};
