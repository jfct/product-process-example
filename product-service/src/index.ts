const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PRODUCT_PORT || 3000;
app.listen(PORT, () => console.log(`Product-Service running on port ${PORT}`));

module.exports = { app };