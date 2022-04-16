const express = require('express');
const app = express();
const bodyParser = require('body-parser')

const MongoClient = require('mongodb').MongoClient;

//html(ejs) 파일에서 put 요청을 하기 위한 코드 2줄
const methodOverride = require('method-override');
app.use(methodOverride('_method'))

app.use('/public', express.static('public'))
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
    answer.render('write.ejs'); 
});

app.get('/list', function(request, answer){
    //디비에 저장된 post 라는 collection 안의 모든 데이터를 꺼내주세요.
    db.collection('post').find().toArray(function(error, result){
        console.log(result);
        answer.render('list.ejs', { posts : result });
    });
    
    
});


app.delete('/delete', function(요청,응답){
    console.log(요청.body);
    요청.body._id = parseInt(요청.body._id);
    // 요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요.
    db.collection('post').deleteOne(요청.body, function(에러,결과){
        console.log('삭제완료');
        응답.status(200).send({ message : '성공했습니다.'}); //200은 일반적으로 응답이 성공했다 ~ 이런 뜻임.
    });
});

            // /뒤에 문자열 적으면 아래것을 실행시켜주세요.
            // URL 의 파라미터라고합니다.
app.get('/detail/:id', function(요청,응답){
                              // 파라미터 중 :id 라는 뜻
    db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과){
        console.log(결과)
        응답.render('detail.ejs', { data : 결과 });

    });
    

})

app.get('/edit/:id', function(request,answer){
    db.collection('post').findOne({_id: parseInt(request.params.id)}, function(error,result){
        console.log(result);
        answer.render('edit.ejs', { post : result })
    });
    
})

app.put('/edit', function(request,answer){
    // 어떤 사람이 /edit 경로로 요청을 했다.
    // 폼에 담긴 제목,날짜 데이터를 가지고 db.collection 에다가 업데이트를 해줌.
                        //findOne 이랑은 다르게 업데이트를 해준다는 개념임.
                        //첫번째 데이터를 찾아서 두번째 데이터로 업데이트 시켜주세요 ~ 이런 느낌.
    db.collection('post').updateOne({ _id : parseInt(request.body.id) }, { $set : { 제목:request.body.title, 날짜 : request.body.date} }, function(error, result){
        console.log('수정완료');
        //안되는 이유가 뭘까? 흐으음.. 영상을 보지 않고 스스로의 힘으로 해결해보도록하자.
        answer.redirect('/list');
    });

})
// 누가 폼에서 /add post 로 요청하면
// db counter 내의 게시물갯수 라는 이름을 가진 것?을 찾음.
// 게시물 갯수를 변수에 저장.
// db.post에 새게시물 기록.
// id, 제목, 날짜 등을 추가함.
// 이게 완료가 되면 db.counter 내의 총 게시물 갯수 + 1

app.post('/add', function(요청, 응답){
    응답.send('전송완료');
    db.collection('counter').findOne({name : '게시물갯수'}, function(에러, 결과){
      var 총게시물갯수 = 결과.totalPost;
       
      db.collection('post').insertOne( { _id : (총게시물갯수 + 1), 제목 : 요청.body.title, 날짜 : 요청.body.date } , function(){
        console.log('저장완료')

        //operator
        //$set : 바꿔달라는 요청을 할 때 쓰는 연산자
        //$inc : 기존값에 값을 더 해줄때 쓰는 연산자

        //counter 라는 콜렉션에 있는 totalPost 라는 항목도 1 증가시켜야함 (수정);
        db.collection('counter').updateOne({name:'게시물갯수'},{ $inc : {totalPost:1} },function(error, result){
            if(error){ return console.log(error)}
            
        });
      });



    });
     
  });


// session 방식 로그인 기능 구현
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const session = require('express-session');
const { localsName } = require('ejs');

// app.use(미들웨어) : 요청 - 응답 중간에 뭔가 실행되는 코드
app.use(session({secret : '비밀코드', resave : true , saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(request,answer){
    answer.render('login.ejs');
});
                //pastport : 로그인 기능을 쉽게 도와주는 라이브러리
app.post('/login', passport.authenticate('local', {
    //실패하면 fail 경로로 이동시켜주세요
    failureRedirect : '/fail'
}), function(request,answer){
    answer.redirect('/');
});

passport.use(new localStrategy({
    // 유저가 입력한 아이디/비번 항목이 뭔지 정의(name 속성)
    usernameField : 'id',
    passwordField : 'pw',
    // 로그인후 세션정보를 저장할 것인지, 아래는 특수한 경우라서 false (아이디 비번 말고도 다른 정보를 검사하는거임)
    session : true,
    passReqToCallback: false,
}), function(inputId, inputPw, done){
    console.log(inputId, inputPw);
    db.collection('login').findOne({id : inputId}, function(error, result){
        if (error) return done(error)
        if (!result) return done(null, false, {message : '존재하지 않는 아이디에요.'})
        if (inputPw == result.pw){
            return done(null, 결과)
        } else{
            return done(null, false, {message : '비밀번호를 다시 입력해주세요.'})
        }
    })
});

