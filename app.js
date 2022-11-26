const express = require('express')
const cors = require('cors')
require('dotenv').config({
    path: "./dev.env"
});




const blog_Router = require('./Router/BlogRouter')
const user_Router = require('./Router/UserRouter')

const app = express()
const PORT = 3001;
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));

//router api call
app.use('/api/v1/blog', blog_Router)
app.use('/api/v1/user', user_Router)


app.listen(PORT, () => {
    console.log(`Listening to server on Port ${PORT}`);

})