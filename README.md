## Bearcat-dao -- a SQL mapping dao framework  

## Overview
[bearcat-dao](https://github.com/bearcatjs/bearcat-dao) is a DAO (domain access objects) framework for [node.js](http://nodejs.org/). It implements SQL mapping as its main concept compared to O/R mapping, therefore SQL is still the main concern using with bearcat-dao, and bearcat-dao will map the datebase resultset into [bearcat model](http://bearcatjs.org/guide/model.html) object.  

## SQL mapping vs O/R mapping
Structured Query Language (SQL) has been around for a long time, relational database and SQL have been claimed to have stood the test of time. Moreover, we have experiences whereby the database and even the SQL itself have outlived the application source code, and even mulitiple versions of the source code.  
SQL mapping is on the idea that there is value in relational database and SQL, developers write SQL and maps data resultsets into objects. Therefore, it is easy for enterprise application to optimize, reuse SQL, maintain.  
In another way, O/R mapping enables developers to write mapping object to database table, ORM framework then generates the specific SQL to execute on the database. So, as we can see, developers have to take great knowledge of the ORM framework in order to use the database well, especially when optimization is needed.  

## Model
model definition is using [bearcat model](http://bearcatjs.org/guide/model.html)  
therefore it is easy to be mapped into table and setup constraint, relation  

for example, if we have a test table with single primary id  

```
create table test(
    id bigint(20) NOT NULL COMMENT 'id',	
    
    PRIMARY KEY (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

the we can define the following model  

```
var TestModel = function() {
    this.$mid = "testModel";
    this.$table = "test";
    this.id = "$primary;type:Number";
}
  
module.exports = TestModel;
```

in the ***TestModel***, we use ***$table*** attribute to setup the mapping table name, in ***id*** attribute we use ***primary*** to mark it as a primary key, then we add with a type constraint    

## Relation
Tables in relational database can have relations, there are one-to-one relation, one-to-many relation, many-to-many relation  

### One-to-one relation
One-to-one relation means in two models, one model has the reference of the other model  

for example, if we have a ***test1*** table with primary id and reference id of the ***test2*** table  

```
create table test1(
    id bigint(20) NOT NULL COMMENT 'id',	
    rid bigint(20) NOT NULL COMMENT 'reference to test2 id',	
      
    PRIMARY KEY (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

```
create table test2(
    id bigint(20) NOT NULL COMMENT 'id',	
    
    PRIMARY KEY (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

then we can define the following two models  

```
var Test1Model = function() {
    this.$mid = "test1Model";
    this.$table = "test1";
    this.id = "$primary;type:Number";
    this.test2 = "$type:Object;ref:test2Model"
}
  
module.exports = Test1Model;
```

```
var Test2Model = function() {
    this.$mid = "test2Model";
    this.$table = "test2";
    this.id = "$primary;type:Number";
}
  
module.exports = Test2Model;
```

as we can see, in ***Test1Model.test2*** attribute we use ***ref:test2Model*** to set the reference to ***test2Model***  

### One-to-many relation
One-to-many relation means one model refer to the array of other model. In the real world, for example, we can have a blog, and a blog have many commnets, so blog and comment are one-to-many relation.  

```
var Test1Model = function() {
    this.$mid = "test1Model";
    this.$table = "test1";
    this.id = "$primary;type:Number";
    this.test2 = "$type:Array;ref:test2Model"
}
  
module.exports = Test1Model;
```

therefore, in the above example, we simply modify the ***test2*** attribute type to ***Array***, it becomes a one-to-many relation  

### Many-to-many relation
many-to-many relation can be spilted into two one-many relation through middle table  

## SQL template
When writing complex sql, it is not quite well writing as a String, the better way is using SQL template.  

write SQL tempalte is easy  

for example, we can define SQL template with id ***testResultSql***

```
sql testResultSql
select * from test 
end
```

then we can use this sql in dao, like this  

```
domainDaoSupport.getList("$testResultSql", null, "testModel", function(err, results) {
     // results is testModel type array
});
```

in domainDaoSupport.getList api, the first argument can be SQL tempalte id, the second argument is the SQL arguments, the third argument is the SQL result mapping model id, then in the callback function, we can get the results which are already mapped with testModel array  

Moreover, SQL template can include other SQL template

for example  
```
sql testResultSql
select * from ${testResultTable} 
end

sql testResultTable
test
end
```

then testResultSql template is equal to the above 

## ResultSet mapping
ResultSet is an array of field/value objects, therefore the process of mapping resultSet is like filling objects with specific key/value pairs, to make the key match with the resultSet, we can use ***prefix*** in [model magic attribute value](http://bearcatjs.org/guide/model.html#model_magic_attribute_value) or use ***prefix*** in [model attribute](http://bearcatjs.org/guide/magic-javaScript-objects-in-details.html) to mark all attributes in this model will be prefixed  

for example, if you query for a resultSet like this  

```
[{
	"id": 1,
	"title": "blog_title",
	"content": "blog_content",
	"create_at": 1234567,
	"update_at": 1234567
}]
```

then mapping model can be like this  

```
var BlogModel = function() {
    this.$mid = "blogModel";
    this.$table = "ba_blog";
    this.id = "$primary;type:Number";
    this.aid = "$type:Number";
    this.title = "$type:String";
    this.content = "$type:String";
    this.create_at = "$type:Number";
    this.update_at = "$type:Number";
}
  
module.exports = BlogModel;
```

if your resultSet is prefixed with ***blog_*** like this  
```
[{
	"blog_id": 1,
	"blog_title": "blog_title",
	"blog_content": "blog_content",
	"blog_create_at": 1234567,
	"blog_update_at": 1234567
}]
```

then mapping model will be like this  

```
var BlogModel = function() {
    this.$mid = "blogModel";
    this.$table = "ba_blog";
    this.$prefix = "blog_";
    this.id = "$primary;type:Number";
    this.aid = "$type:Number";
    this.title = "$type:String";
    this.content = "$type:String";
    this.create_at = "$type:Number";
    this.update_at = "$type:Number";
}
  
module.exports = BlogModel;
```

just add ***this.$prefix*** model attribute  

## DAO
DAO is short for domain access object, we can use DAO objects to manage database

bearcat-dao provides ***domainDaoSupport*** wrapping basic sql and cache operations  
add it with properties dependency injection, and init it by invoking ***initConfig*** method  
then you can use domainDaoSupport convenient methods to wrap your own daos 

simpleDao.js
```
var SimpleDao = function() {
    this.$id = "simpleDao";
    this.$init = "init";
    this.$domainDaoSupport = null;
}
  
SimpleDao.prototype.init = function() {
    // init with SimpleModel id to set up model mapping
    this.domainDaoSupport.initConfig("simpleModel");
}
  
// query list all
// callback return mapped SimpleModel array results
SimpleDao.prototype.getList = function(cb) {
    var sql = ' 1 = 1';
    this.$domainDaoSupport.getListByWhere(sql, null, null, cb);
}
  
module.exports = SimpleDao;
```

api reference for [domainDaoSupport](http://bearcatjs.github.io/bearcat-dao/domainDaoSupport.js.html)

## Configuration
add bearcat-dao to your project  

```
npm install bearcat-dao --save
```  

modify context.json used by your project  
[placeholds](http://bearcatjs.org/guide/consistent-configuration.html) can be nicely used to switch between contexts  

```
"dependencies": {
	"bearcat-dao": "*"
},
"beans": [{
    "id": "mysqlConnectionManager",
    "func": "node_modules.bearcat-dao.lib.connection.sql.mysqlConnectionManager",
    "props": [{
        "name": "port",
        "value": "${mysql.port}"
    }, {
        "name": "host",
        "value": "${mysql.host}"
    }, {
        "name": "user",
        "value": "${mysql.user}"
    }, {
        "name": "password",
        "value": "${mysql.password}"
    }, {
        "name": "database",
        "value": "${mysql.database}"
    }]
}, {
    "id": "redisConnectionManager",
    "func": "node_modules.bearcat-dao.lib.connection.cache.redisConnectionManager",
    "props": [{
        "name": "port",
        "value": "${redis.port}"
    }, {
        "name": "host",
        "value": "${redis.host}"
    }]
}]
```

if you do not use redis, you can remove ***redisConnectionManager*** definition  

## Transaction

bearcat-dao provides transaction support based on [bearcat AOP](http://bearcatjs.org/guide/aop.html). The aspect is [transactionAspect](https://github.com/bearcatjs/bearcat-dao/blob/master/lib/aspect/transactionAspect.js) which provides around advice, when target transaction method calls cb function with ***err***, rollback will be emited, otherwise it will commit the operations.  

The pointcut defined is:  
```
"pointcut": "around:.*?Transaction$"
```  

Therefore, any POJO method match this pointcut can a transcation method  
Since transaction must be within the same connection, in Bearcat-dao it is ***transactionStatus***, daos under the transaction method must hold the same transactionStatus  
```
SimpleService.prototype.testMethodTransaction = function(cb, txStatus) {
    var self = this;
  
    this.simpleDao1.transaction(txStatus).addPerson(['aaa'], function(err, results) {
        if (err) {
             return cb(err); // if err occur, rollback will be emited
        }
  
        self.simpleDao2.transaction(txStatus).getList([1, 2], function(err, results) {
            if (err) { 
                 return cb(err); // if err occur, rollback will be emited
            }

            cb(null, results); // commit the operations
        });
    });
}
```

## Enable Debug Mode
run with BEARCAT_DEBUG flag true  
```
BEARCAT_DEBUG=true node xxx.js
```

## Examples
- [bearcat-todo](https://github.com/bearcatnode/todo) 
- [bearcat-dao example](https://github.com/bearcatjs/bearcat-examples/tree/master/bearcat-dao-example)

## License

(The MIT License)

Copyright (c) fantasyni and other contributors

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.