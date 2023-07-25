import jwt from "jsonwebtoken";

const generateAuthToken = (email, companyId, subCompanyId) => {
  return jwt.sign(
    { email, companyId, subCompanyId },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "500d",
    }
  );
};

export default generateAuthToken;
