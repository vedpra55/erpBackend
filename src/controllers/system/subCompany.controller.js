import Prisma from "../../../prisma/index.js";

export const createSubCompany = async (req, res, next) => {
  try {
    const { user, name } = req.body;

    const companyId = user.company_id;

    await Prisma.$transaction(async (Prisma) => {
      // Total count of sub company
      const totalSubCompany = await Prisma.gl_sub_companies.findMany({
        select: {
          sub_company_id: true,
        },
        distinct: ["sub_company_id"],
      });

      // Creating subcompany
      const subCompany = await Prisma.gl_sub_companies.create({
        data: {
          sub_company_id: totalSubCompany.length + 1,
          sub_company_name: name,
          company_id: companyId,
        },
      });

      // creating admin role
      const adminRole = await Prisma.sys_roles.create({
        data: {
          role_name: "admin",
          company_id: companyId,
          sub_company_id: subCompany.sub_company_id,
        },
      });

      // Program Data
      const programsData = [
        {
          program_name: "Categories",
          sub_company_id: subCompany.sub_company_id,
          company_id: companyId,
        },
        {
          program_name: "Suppliers",
          sub_company_id: subCompany.sub_company_id,
          company_id: companyId,
        },
        {
          program_name: "Locations",
          sub_company_id: subCompany.sub_company_id,
          company_id: companyId,
        },
        {
          program_name: "Products",
          sub_company_id: subCompany.sub_company_id,
          company_id: companyId,
        },
        {
          program_name: "Purchase Order Creation",
          sub_company_id: subCompany.sub_company_id,
          company_id: companyId,
        },
        {
          program_name: "Transfer Creation",
          sub_company_id: subCompany.sub_company_id,
          company_id: companyId,
        },
        {
          program_name: "Purchase Document",
          sub_company_id: subCompany.sub_company_id,
          company_id: companyId,
        },
        {
          program_name: "Transfer Document",
          sub_company_id: subCompany.sub_company_id,
          company_id: companyId,
        },
        {
          program_name: "Stock Balance Report",
          sub_company_id: subCompany.sub_company_id,
          company_id: companyId,
        },
        {
          program_name: "Create roles",
          sub_company_id: subCompany.sub_company_id,
          company_id: companyId,
        },
        {
          program_name: "Create Users",
          sub_company_id: subCompany.sub_company_id,
          company_id: companyId,
        },
        {
          program_name: "Create Sub Company",
          sub_company_id: subCompany.sub_company_id,
          company_id: companyId,
        },
        {
          program_name: "Assign Programs",
          sub_company_id: subCompany.sub_company_id,
          company_id: companyId,
        },
      ];

      // Creating all programs
      await Prisma.sys_programs.createMany({
        data: [...programsData],
      });

      // geting all programs
      const system_programs = await Prisma.sys_programs.findMany({
        where: {
          company_id: companyId,
          sub_company_id: subCompany.sub_company_id,
        },
      });

      // role programe data
      const roleProgramData = system_programs.map((item, i) => {
        const role = {
          company_id: item.company_id,
          sub_company_id: item.sub_company_id,
          program_id: item.program_id,
          role_name: adminRole.role_name,
          access: true,
        };
        return role;
      });

      // creating all role programe
      await Prisma.sys_roleprograms.createMany({
        data: [...roleProgramData],
      });

      // create new user for new sub company
      await Prisma.sys_users.create({
        data: {
          ...user,
          sub_company_id: subCompany.sub_company_id,
        },
      });

      res.status(200).json({
        message: "Subcompany created successfully",
      });
    });
  } catch (err) {
    next(err);
  }
};

export const getSubCompanyById = async (req, res, next) => {
  try {
    const { subCompanyId } = req.query;
    const { user } = req.body;
    const subCompany = await Prisma.gl_sub_companies.findUnique({
      where: {
        company_id_sub_company_id: {
          company_id: user.company_id,
          sub_company_id: parseInt(subCompanyId),
        },
      },
    });
    res.status(200).json({
      res: subCompany,
    });
  } catch (err) {
    next(err);
  }
};

export const editSubCompany = async (req, res, next) => {
  try {
    const { name, subCompanyId, companyId } = req.body;

    await Prisma.$transaction(async (Prisma) => {
      await Prisma.gl_sub_companies.update({
        where: {
          company_id_sub_company_id: {
            company_id: parseInt(companyId),
            sub_company_id: parseInt(subCompanyId),
          },
        },
        data: {
          sub_company_name: name,
        },
      });

      res.status(200).json({
        message: "Sub company name updated",
      });
    });
  } catch {
    next(err);
  }
};

export const getSubCompanyOfCompany = async (req, res, next) => {
  try {
    const { user } = req.body;

    const subCompanyList = await Prisma.gl_sub_companies.findMany({
      where: {
        company_id: user.company_id,
      },
    });
    res.status(200).json({
      res: subCompanyList,
    });
  } catch {
    next(err);
  }
};
