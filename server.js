const express = require('express');
const app = express();
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true})) 

app.listen(8080, function(request, answer){
    console.log('listen on 8080')
});

app.get('/write', function(request,answer){
    answer.sendFile(__dirname + '/write.html')
});

app.get('/', function(request, answer){
    answer.sendFile(__dirname + '/index.html')
});

app.post('/add', function(request,answer){
    answer.send('end');
    console.log(request.body.date);
});