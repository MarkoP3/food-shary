const express = require('express');
const app = express();
app.set('view-engine', 'ejs');
app.get('/', (req, res) => {
    res.render(__dirname+'/public/views/index.ejs')
});

app.listen(8080);