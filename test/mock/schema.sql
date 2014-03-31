 /* bearcat_dao_test table */
 DROP TABLE IF EXISTS bearcat_dao_test;
 create table bearcat_dao_test ( 
 	id bigint(20) NOT NULL COMMENT 'id',
 	name varchar(100) NOT NULL COMMENT '姓名',
 	num int(20) NOT NULL COMMENT 'num',
 	create_at bigint(20) NOT NULL COMMENT '创建时间',

 	primary key(id)
 )ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='bearcat_dao_test';