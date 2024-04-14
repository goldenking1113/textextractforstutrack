const express = require('express');
const pdf = require('pdf-parse');
const cors = require('cors');
const { getSubtitles } = require('youtube-captions-scraper');
const axios = require('axios');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Middleware to parse multipart form data
const multer = require('multer');
const upload = multer();

// Endpoint to extract text from a PDF file
app.post('/extractText', upload.single('pdfData'), async (req, res) => {
    const pdfData = req.file.buffer;
    try {
        const pdfContent = await pdf(pdfData);
        const text = pdfContent.text;
        res.send(text); // Sending only the extracted text
    } catch (err) {
        res.status(500).json({ error: 'Error extracting text from PDF' });
    }
});


// Endpoint to get YouTube captions
app.get('/youtubeCaptions', async (req, res) => {
  const videoID = req.query.videoID;
  const lang = req.query.lang || 'en'; // default language is English
  try {
      const captions = await getSubtitles({ videoID, lang });
      const text = captions.map(caption => caption.text).join(' '); // Extract text from each caption and join into a single string
      res.set('Content-Type', 'text/plain'); // Set response content type as plain text
      res.send(text); // Send plain text
  } catch (err) {
      res.status(500).send('Error getting YouTube captions');
  }
});


// Endpoint to fetch text from a website
app.get('/website', async (req, res) => {
    const url = req.query.url;
    try {
        const apyToken = 'APY0ke0mcxMgjyYda0DxG2SCyHuHZMsEq2fgcyt9udMdsRvQf51PEVcyEYthy5fZUohr2dwru0mBn'; // Replace with your actual API token
        const apyhubResponse = await axios.get('https://api.apyhub.com/extract/text/webpage', {
            params: {
                url: url
            },
            headers: {
                'apy-token': apyToken
            }
        });
        const extractedText = apyhubResponse.data;
        res.send(extractedText);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching text from website using apyhub' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
