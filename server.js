const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); // Move this line up
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json()); // Move this line up
app.use(bodyParser.urlencoded({ extended: true })); // To handle URL encoded data


// URL encode your password
const encodedPassword = encodeURIComponent('0o9i8u7y'); // Replace with your actual password
const mongoURI = `mongodb+srv://joeljandrew:${encodedPassword}@cluster0.ckig8pv.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// this is the defined schema
const contentSchema = new mongoose.Schema({
    content: String
  });
  
  const Content = mongoose.model('Content', contentSchema);
  

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/api', (req, res) => {
  res.json({ key: 'value' });
});

// Setup POST route (body-parser should be registered before this)


app.post('/api/submit', async (req, res) => {
    console.log(req.body);
    try {
      const newContent = new Content({ content: req.body.content });
      await newContent.save();
      res.json({ message: 'Data saved' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

 // Setup GET route
app.get('/search-results', async (req, res) => {
  const query = req.query.query;
  console.log("Search Query Received: ", query);  // New line for debugging
  try {
    const results = await Content.find({ content: new RegExp(query, 'i') });
    console.log("Search Results: ", results);  // New line for debugging
    
    let resultsHTML = "";
    results.forEach(result => {
      resultsHTML += `<p>${result.content}</p>`;
    });

    fs.readFile(path.join(__dirname, 'public', 'search-results.html'), 'utf8', (err, htmlData) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
  
      const renderedHtml = htmlData.replace('{{SEARCH_RESULTS}}', resultsHTML);
      res.send(renderedHtml);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
