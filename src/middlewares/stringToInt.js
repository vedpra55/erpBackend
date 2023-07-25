export const companySubComapnyToInt = (req, res, next) => {
  try {
    let { companyId, subCompanyId } = req.query || req.body;

    companyId = parseInt(companyId);
    subCompanyId = parseInt(subCompanyId);

    req.query.companyId = companyId;
    req.query.subCompanyId = subCompanyId;

    req.body.companyId = companyId;
    req.body.subCompanyId = subCompanyId;

    next();
  } catch (err) {
    next(err);
  }
};
