var mysql   = require('mysql');
var express = require('express');

var app = express();

app.listen('2000' , () => {
	console.log('Server Listening on 2000');
});

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'payme'
});

con.connect(function(err) {
  if (err) {
  	console.log('Failed to connect to DB rescuePoints');
  	return;
}
  console.log('Connected to DB');
  let balance_table = 'CREATE TABLE balance(user_id int AUTO_INCREMENT , name VARCHAR(255) NOT NULL, balance FLOAT(9,6) NOT NULL, PRIMARY KEY (user_id))'
  let limit_table = 'CREATE TABLE limits(user_id int , day_count int NOT NULL, day_amount FLOAT(9,6) NOT NULL, month_count int NOT NULL, month_amount FLOAT(9,6) NOT NULL)'
  let trans_table = 'CREATE TABLE transaction(id int AUTO_INCREMENT, sender_id int NOT NULL , reciever_id int NOT NULL, amount FLOAT(9,6) NOT NULL, time TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(id))'

 con.query( balance_table, function(err){
  		if (err) throw err;
		console.log('Balance table created');
   
  });

  con.query( limit_table, function(err){
      if (err) throw err;
      console.log('Limits table created');
  });
  
  con.query(trans_table, function(err){
  		if (err) throw err;
		console.log('Balance table created');
  });

});

