const getAllProduct = async (pgPool, page, pageSize) => {
  const client = await pgPool.connect();
  try {
    const skip = (page - 1) * pageSize;
    const query = `SELECT * FROM products LIMIT ${pageSize} OFFSET ${skip}`;
    await client.query('BEGIN');
    const result = await client.query(query);
    await client.query('COMMIT');
    return result.rows;
  } catch (err) {
    console.error("❌ Error occurred:", err.message);
    return [];
  } finally {
    client.release();
  }
};
const getProductById = async (pgPool, productId) => {
  const client = await pgPool.connect();
  try {
    const query = `SELECT * FROM products WHERE id = $1`;
    const values = [productId];
    await client.query('BEGIN');
    const result = await client.query(query, values);
    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    console.error("❌ Error occurred:", err.message);
    return null;
  } finally {
    client.release();
  }
};
const reduceStock = async (pgPool, productId, quantity) => {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    const query = `UPDATE products SET stock = stock - $1 WHERE id = $2`;
    const values = [quantity, productId];
    const result = await client.query(query, values);
    await client.query('COMMIT');
    return result.rowCount > 0;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Error occurred:", err.message);
    return false;
  } finally {
    client.release();
  }
};

export { getAllProduct, reduceStock, getProductById };
