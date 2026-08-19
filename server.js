const express = require('express');
const cors = require('cors');
const {testDatabaseConnection} = require('./config/database.js');
const incidentsRouter = require("./routes/incidents");
const dashboardRoutes = require("./routes/dashboard");
const systemHealthRoutes = require("./routes/systemHealth");


const app = express();

//Middlewares
app.use(cors());
app.use(express.json());

app.use("/api/incidents", incidentsRouter);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/system-health", systemHealthRoutes);


//Checking database connection
testDatabaseConnection();

app.get('/api/health', (req,res) =>{
  res.json({
    success: true,
    message: 'Incident Explorer API is running',
  });
});


const PORT = process.env.PORT || 5000;
//Port 5000
app.listen(PORT, () =>{
  console.log(`Server running on ${PORT}`);
});