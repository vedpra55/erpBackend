export const fillterSuppliers = (suppliers, suppliers2) => {
  const supplier = suppliers.filter(
    (item1) =>
      !suppliers2.some((item2) => item1.supplier_code === item2.supplier_code)
  );

  return supplier;
};

export const calulatePurhcaseOrderNumbers = (
  product,
  costRate,
  freight,
  supplierCostRate,
  subTotal,
  total
) => {
  console.log(costRate, freight, supplierCostRate, total, product, "service");

  const supplierCostValue = (supplierCostRate / 100) * total;

  const unitPrice = parseFloat(product.cost_fc);
  const qty = parseInt(product.qty_ordered);

  const productTotal = unitPrice * qty;

  const nonVendorCostWeightage = (productTotal / total) * supplierCostValue;

  let newProductTotal = productTotal + freight + nonVendorCostWeightage;

  let costFc = newProductTotal / qty;
  let costLocal = costFc * costRate;

  return {
    costFc,
    costLocal,
  };
};

export const calulateAvarageNumber = (
  existingQty,
  costLocal,
  newCostLocal,
  newQty
) => {
  const qty_received = parseInt(existingQty);
  const productTotal = qty_received * costLocal;
  const newValue = newQty * newCostLocal;
  const totalQty = qty_received + newQty;
  const averageCost = (productTotal + newValue) / totalQty;
  return {
    averageCost,
  };
};
