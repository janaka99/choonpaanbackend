export const calculateTotalSales = (sales: any[]) => {
  return sales.reduce((total, sale) => {
    return total + Number(sale.sold) * Number(sale.price);
  }, 0);
};
