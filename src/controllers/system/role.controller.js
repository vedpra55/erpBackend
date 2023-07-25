import createHttpError from "http-errors";
import Prisma from "../../../prisma/index.js";

export const createRole = async (req, res, next) => {
  try {
    const { user, roleName, subCompanyId } = req.body;

    if (!roleName || !subCompanyId) {
      return next(createHttpError("Some fields are missing"));
    }

    await Prisma.$transaction(async (Prisma) => {
      // get roles
      const isRoleNameExit = await Prisma.sys_roles.findUnique({
        where: {
          company_id_sub_company_id_role_name: {
            company_id: user.company_id,
            sub_company_id: parseInt(subCompanyId),
            role_name: roleName,
          },
        },
      });

      // checking role name
      if (isRoleNameExit) {
        return next(createHttpError.BadRequest("Role name already exits"));
      }

      // creating role
      await Prisma.sys_roles.create({
        data: {
          role_name: roleName,
          company_id: user.company_id,
          sub_company_id: parseInt(subCompanyId),
        },
      });

      // geting programs
      const programs = await Prisma.sys_programs.findMany({
        where: {
          company_id: user.company_id,
          sub_company_id: parseInt(subCompanyId),
        },
      });

      // role programs data
      const roleProgramData = programs.map((item) => {
        const role = {
          company_id: item.company_id,
          sub_company_id: item.sub_company_id,
          role_name: roleName,
          program_id: item.program_id,
          access: false,
        };

        return role;
      });

      // creating role programs
      await Prisma.sys_roleprograms.createMany({
        data: [...roleProgramData],
      });

      res.status(200).json({
        message: "New Role added sucessfully",
      });
    });
  } catch (err) {
    next(err);
  }
};

export const updetUserRole = async (req, res, next) => {
  const { user, subCompanyId, roleName } = req.body;

  try {
    await Prisma.$transaction(async (Prisma) => {
      await Prisma.sys_users.update({
        where: {
          company_id_sub_company_id_username: {
            company_id: user.company_id,
            sub_company_id: parseInt(subCompanyId),
            username: user.username,
          },
        },
        data: {
          role_name: roleName,
        },
      });

      res.status(200).json({
        message: "User role updated sucessfully",
      });
    });
  } catch (err) {
    next(err);
  }
};

export const updateRoleProgramAccess = async (req, res, next) => {
  try {
    const { subCompanyId, roleName, programId, access } = req.body;
    const { user } = req.body;

    await Prisma.$transaction(async (Prisma) => {
      await Prisma.sys_roleprograms.update({
        where: {
          company_id_sub_company_id_role_name_program_id: {
            company_id: user.company_id,
            sub_company_id: subCompanyId,
            role_name: roleName,
            program_id: programId,
          },
        },
        data: {
          access: access,
        },
      });

      res.status(200).json({
        message: "Role access updated sucessfully",
      });
    });
  } catch (err) {
    next(err);
  }
};

export const getRoleByCompany = async (req, res, next) => {
  try {
    const { subCompanyId } = req.query;
    const { user } = req.body;

    const roles = await Prisma.sys_roles.findMany({
      where: {
        company_id: user.company_id,
        sub_company_id: parseInt(subCompanyId),
      },
    });

    res.status(200).json({
      res: roles,
    });
  } catch (err) {
    next(err);
  }
};
