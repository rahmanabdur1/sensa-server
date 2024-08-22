const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://senca-health:m0rMvJ0n2W2CGIcv@cluster0.gzkpw83.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const sencaCollection = client.db('sensa-health').collection('sensa-category');
    const quizeCollections = client.db('sensa-health').collection('quize-category');
    const blogCollections = client.db('sensa-health').collection('blog-collection');

    app.get('/senca-health', async (req, res) => {
      try {
        const data = await sencaCollection.find().toArray();
        res.json(data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    
    app.get('/blogs', async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 6;
        
        const totalBlogs = await blogCollections.countDocuments({});
        const totalPages = Math.ceil(totalBlogs / perPage);

        if (page < 1 || page > totalPages) {
          return res.status(404).json({ error: 'Invalid page number' });
        }

        const skip = (page - 1) * perPage;

        const data = await blogCollections.find().skip(skip).limit(perPage).toArray();
        res.json(data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/:categoryId', async (req, res) => {
      try {
        const categoryname = req.params.categoryId;

        const quizData = await quizeCollections.findOne({ category_name:(categoryname) });
        
        if (!quizData) {
          return res.status(404).json({ error: 'Quiz data not found' });
        }

        res.json(quizData);

      } catch (error) {
        console.error('Error fetching quiz data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });



    app.get('/:categoryId/quize/:currentQuestionInd/', async (req, res) => {
      try {
        const categoryId = req.params.categoryId;
        const cat = req.params.currentQuestionInd ? parseInt(req.params.currentQuestionInd) : null;
        const quizsData = await quizeCollections.findOne({ category_name: categoryId});    
        console.log(cat,'kd')
        if (!quizsData) {
          return res.status(404).json({ error: 'Quiz data not found' });
        }   

        const questions = quizsData.questions; 
         console.log(quizsData.questions.length,'ww')

        if (cat !== null) {
          const currentQuestion = questions.find(question => question.questionId === cat);
          console.log(currentQuestion.options,'k')
          if (!currentQuestion) {
            return res.status(404).json({ error: 'Question not found' });
          }else{
            const options = currentQuestion;          
            res.json(options);
          }
          
        } 
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    
    
    

  } finally {
 
  }
}

run().catch(console.dir);

app.get('/', async (req, res) => {
  res.send('Doctors portal server is running');
});

app.listen(port, () => console.log(`Doctors server listening on port ${port}`));