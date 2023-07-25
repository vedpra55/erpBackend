import createHttpError from "http-errors";
import Prisma from "../../../prisma/index.js";
import { comparePassword, hashPassword } from "../../utils/hashPassword.js";
import generateAuthToken from "../../utils/generateToken.js";

export const register = async (req, res, next) => {
  try {
    const { email, password, username, companyName } = req.body;

    if (!email || !password || !username || !companyName) {
      next(createHttpError.BadRequest("Please Fill all fields"));
    }

    await Prisma.$transaction(async (Prisma) => {
      // check Company name exits
      const isNameExit = await Prisma.gl_companies.findUnique({
        where: {
          company_name: companyName,
        },
      });

      if (isNameExit) {
        return next(createHttpError.BadRequest("Comapny already in use"));
      }

      // check name or email of user exit
      const userExist = await Prisma.sys_users.findFirst({
        where: {
          OR: [{ email: email }, { username: username }],
        },
      });

      if (userExist) {
        return next(createHttpError.BadRequest("Name or email already exist"));
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
      await Prisma.sys_users.create({
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

      res.status(200).json({
        message: "Account Created. Please verify the email",
      });
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const signin = async (req, res, next) => {
  const { username, email, password, subCompanyId } = req.body;

  if (!email || !password || !username) {
    return next(createHttpError.BadRequest("Please fill all fields"));
  }

  try {
    await Prisma.$transaction(async (Prisma) => {
      const user = await Prisma.sys_users.findFirst({
        where: {
          email: email,
        },
      });

      if (!user) {
        return next(createHttpError("email not found"));
      }

      const checkPassword = comparePassword(password, user.password);

      if (!checkPassword) {
        return next(createHttpError.BadRequest("Wrong Password"));
      }

      const access_token = generateAuthToken(
        user.email,
        user.company_id,
        user.sub_company_id
      );

      const allSubCompany = await Prisma.gl_sub_companies.findMany({
        where: {
          company_id: user.company_id,
        },
        select: {
          sub_company_id: true,
          sub_company_name: true,
        },
        distinct: ["sub_company_name"],
      });

      if (
        user.role_name === "admin" &&
        allSubCompany.length > 1 &&
        !subCompanyId
      ) {
        return res.status(200).json({
          res: {
            verified: user.verified,
            roleName: user.role_name,
            subCompany: allSubCompany,
            message: "Please Select Sub Company",
          },
        });
      }

      res.status(200).json({
        res: {
          id: user.id,
          username: user.username,
          subCompanyId: user.sub_company_id,
          companyId: user.company_id,
          verified: user.verified,
          email: user.email,
          roleId: user.roleId,
          selectedSubCompany: subCompanyId,
          access_token,
        },
        message: "Signed In Sucessfully",
      });
    });
  } catch (err) {
    next(err);
  }
};

export const createUserByAdmin = async (req, res, next) => {
  const { user, email, password, username, roleName, subCompanyId } = req.body;

  if (!email || !password || !username || !subCompanyId || !roleName) {
    next(createHttpError.BadRequest("Please fill all fields"));
  }

  try {
    await Prisma.$transaction(async (Prisma) => {
      const userExist = await Prisma.sys_users.findFirst({
        where: {
          OR: [{ email: email }, { username: username }],
        },
      });

      if (userExist) {
        next(createHttpError.BadRequest("Email or name exit"));
      }

      const hashedPassword = hashPassword(password);

      const newUser = await Prisma.sys_users.create({
        data: {
          email,
          password: hashedPassword,
          username,
          company_id: user.company_id,
          sub_company_id: parseInt(subCompanyId),
          role_name: roleName,
          verified: true,
        },
      });

      res.status(200).json({
        res: {
          id: newUser.id,
          username: newUser.username,
          subCompanyId: newUser.sub_company_id,
          companyId: newUser.company_id,
          email: newUser.email,
          verified: newUser.verified,
          roleId: newUser.roleId,
        },
        message: "New user created sucessfully",
      });
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  const { user, roleName } = req.body;

  try {
    await Prisma.$transaction(async (Prisma) => {
      await Prisma.sys_users.update({
        where: {
          company_id_sub_company_id_username: {
            company_id: user.company_id,
            sub_company_id: user.sub_company_id,
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

export const getUsersBySubCompany = async (req, res, next) => {
  const { subCompanyId } = req.query;
  const { user } = req.body;

  try {
    const users = await Prisma.sys_users.findMany({
      where: {
        company_id: user.company_id,
      },
    });

    res.status(200).json({
      res: users,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyLoggedinUser = async (req, res, next) => {
  try {
    const { user } = req.body;

    if (!user) {
      next(createHttpError.Unauthorized("Somthing goes wrong"));
    }

    res.status(200).json({
      res: {
        id: user.id,
        username: user.username,
        subCompanyId: user.sub_company_id,
        companyId: user.company_id,
        verified: user.verified,
        email: user.email,
        roleName: user.role_name,
      },
    });
  } catch (err) {
    next(err);
  }
};
