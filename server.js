const express = require('express');
const app = express();
const bodyParser = require('body-parser')

const MongoClient = require('mongodb').MongoClient;

app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs');

var db;

MongoClient.connect('mongodb+srv://Gaseong:q2ewrq2ewr@cluster0.qney5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function (error, client) {
//connect = 연결해주세요. 이후 연결이 된다면 아래의 함수 실행    
    
    if(error) 
        return console.log(error)
    
    db = client.db('gaseong');
    
    //object 저장되고, 스키마 신경 안써도됨.
    db.collection('post').insertOne({_id : 1, Name : 'John', Age : 18 }, function(error,result){
        console.log('저장완료');
    });

    app.listen(8080, function (request, answer) {
        console.log('listen on 8080');
    });
});



app.get('/', function (request, answer) {
    answer.sendFile(__dirname + '/index.html');
});

app.get('/write', function (request, answer) {
    answer.sendFile(__dirname + '/write.html');
});

app.get('/list', function(request, answer){
    //디비에 저장된 post 라는 collection 안의 모든 데이터를 꺼내주세요.
    db.collection('post').find().toArray(function(error, result){
        console.log(result);
        answer.render('list.ejs', { posts : result });
    });
    
    
});

app.post('/add', function (request, answer) {
    db.collection('post').insertOne({title : request.body.title, date : request.body.date }, function(){
        console.log('저장완료');
    });
});

