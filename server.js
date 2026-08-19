const express = require('express');
const cors = require('cors');


const app = express();

app.use(cors());
app.use(express.json());


app.get('/api/health', (req,res) =>{
  res.json({
    success: true,
    message: 'Incident Explorer API is running',
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{
  console.log(`Server running on ${PORT}`);
});