
var mysql   = require('mysql');
var express = require('express');

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'payme'
});

transaction(0,1,20);

function transaction(sender,reciver, amount){
	con.connect(function(err) {
	var user_one = sender;
	var user_two = reciver;

 	 if (err) {
  		console.log('Failed to connect to DB rescuePoints');
  		return;
  	 }
 	 console.log('Connected to DB');
 	 getDayLimits(user_one, function(days_count_one, days_amount_one){
  		getDayLimits(user_two, function(days_count_two, days_amount_two){
  			getMonthLimits(user_one, function(month_count_one, month_amount_one){
  				getMonthLimits(user_two, function(month_count_two, month_amount_two){
  					getLimits(user_one, user_two, function(one_limits, two_limits){
  					var day_limit = (days_count_one < one_limits.day_count) && (days_count_two < two_limits.day_count) &&
  									((days_amount_one+amount) <= one_limits.day_amount) && ((days_amount_two+amount) <= two_limits.day_amount);
  					
  					var month_limit = (month_count_one < one_limits.month_count) && (month_count_two < two_limits.month_count) &&
  									  ((month_amount_one+amount) <= one_limits.month_amount) && ((month_amount_two+amount) <= two_limits.month_amount);
  				
  					console.log(day_limit);
  					console.log(month_limit);
  					if (day_limit && month_limit){
  						execTrans(user_one, user_two, amount, function(res){
  							if (res == 1)
  							  	console.log('success');
  							else console.log('fail');
  						});
  					}
  					else console.log('fail');
  				});
  			});
  		});
  	});
  });
});
}

function execTrans(user_one, user_two, amount, cb){
	let sql_sender = 'UPDATE balance SET balance = balance -' + amount+ ' WHERE user_id = '+ user_one;
	let sql_reciever = 'UPDATE balance SET balance = balance + ' +amount+ ' WHERE user_id = '+ user_two;
	let sql_insert = 'INSERT INTO transaction (sender_id, reciever_id, amount) VALUES ('+user_one+ ' , '+ user_two+ ' , '+amount+')'

	con.query('SELECT balance from balance WHERE user_id = ?', [user_one],function(err,rows){
		if(err) throw err;
		console.log(rows);
		console.log(rows[0].balance);
		if (rows[0].balance >= amount){
			con.query(sql_sender, function(err){
				if (err)throw err;
				con.query(sql_reciever, function(err){
					if(err) throw err;
					con.query(sql_insert,  function(err){
					if(err) throw err;
					console.log('Inserted');
					cb(1);
				});
			});
		});
		}else cb(0);
});

}

/*Returns the daily limits and the monthly limits for two user id*/
function getLimits(user_one, user_two, cb){
	sql = 'SELECT * from limits WHERE user_id = '+ con.escape(user_one) + ' OR user_id = ' + con.escape(user_two);
	con.query(sql, function(err, rows){
		if(err) throw err;
		console.log(rows[0]);
		cb(rows[0], rows[1]);
	});
}
/* Returns the number of transaction that happend today and their amount for userID*/
function getDayLimits(userID, cb) {
	var count = 0;
	var amount = 0;

	var dateTime = require('node-datetime');
	var dt = dateTime.create();
	var formatted = dt.format('Y-m-d');

	let sql = 'SELECT amount from transaction WHERE (sender_id = '+ con.escape(userID) + ' OR reciever_id = '+con.escape(userID)
	sql  = sql+') AND DATE(time) = ' + con.escape(formatted)

	con.query(sql , function(err, rows){
		if(err) throw err;
		count = rows.length;
		for (var i=0; i< rows.length; i++)
			amount = amount + rows[i].amount;
		cb(count, amount);
	});
}

/* Returns the number of transaction that happend this month and their amount for userID*/
function getMonthLimits(userID, cb) {
	var count = 0;
	var amount = 0;

	var dateObj = new Date();
	var month 	= dateObj.getUTCMonth() + 1; //months from 1-12
	var year 	= dateObj.getUTCFullYear();

	let sql = 'SELECT amount from transaction WHERE (sender_id = '+ con.escape(userID) + ' OR reciever_id = '+con.escape(userID)
	sql  = sql+') AND ( (month(DATE(time)) = ' + month + ') AND ( year(DATE(time)) = '+ year+ '))'

	con.query(sql , function(err, rows){
		if(err) throw err;
		count = rows.length;
		for (var i=0; i< rows.length; i++)
			amount = amount + rows[i].amount;
		cb(count, amount);
	});
}
