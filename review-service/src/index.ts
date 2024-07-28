const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.REVIEW_PORT || 3001;
app.listen(PORT, () => console.log(`Review-Service running on port ${PORT}`));

module.exports = { app };