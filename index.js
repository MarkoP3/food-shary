const express = require('express');
const app = express();
app.set('view-engine', 'ejs');
app.get('/', (req, res) => {
    res.render(__dirname+'/public/views/index.ejs')
});
port=(process.env.PORT!=undefined? process.env.PORT:8080);
app.listen(port);