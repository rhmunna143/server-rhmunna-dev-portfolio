const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

//middlewares
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('I am walking...!')
})



// MongoDB driver
const uri = process.env.URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });

        const db = client.db('yourDatabaseName');
        const projectCollection = db.collection('projectCollection');
        const blogCollection = db.collection('blogCollection');

        // Create a new project
        app.post('/projects', async (req, res) => {
            try {
                const result = await projectCollection.insertOne(req.body);
                res.json(result.ops[0]);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        });

        // Get all projects
        app.get('/projects', async (req, res) => {
            try {
                const projects = await projectCollection.find().toArray();
                res.json(projects);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        });

        // Get a single project by ID
        app.get('/projects/:id', async (req, res) => {
            try {
                const project = await projectCollection.findOne({ _id: ObjectId(req.params.id) });
                if (!project) {
                    return res.status(404).json({ message: 'Project not found' });
                }
                res.json(project);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        });

        // Update a project by ID
        app.put('/projects/:id', async (req, res) => {
            try {
                const updatedProject = await projectCollection.findOneAndUpdate(
                    { _id: ObjectId(req.params.id) },
                    { $set: req.body },
                    { returnOriginal: false }
                );
                if (!updatedProject.value) {
                    return res.status(404).json({ message: 'Project not found' });
                }
                res.json(updatedProject.value);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        });

        // Delete a project by ID
        app.delete('/projects/:id', async (req, res) => {
            try {
                const result = await projectCollection.deleteOne({ _id: ObjectId(req.params.id) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Project not found' });
                }
                res.json({ message: 'Project deleted successfully' });
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        });

        // Other CRUD operations for blogCollection can be similarly implemented



        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})