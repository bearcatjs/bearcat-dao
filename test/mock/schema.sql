 /* bearcat_dao_test table */
 DROP TABLE IF EXISTS bearcat_dao_test;
 create table bearcat_dao_test ( 
 	id bigint(20) NOT NULL COMMENT 'id',
 	name varchar(100) NOT NULL COMMENT '姓名',
 	num int(20) NOT NULL COMMENT 'num',
 	create_at bigint(20) NOT NULL COMMENT '创建时间',

 	primary key(id)
 )ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='bearcat_dao_test';

 DROP TABLE IF EXISTS bearcat_dao_test1;
 create table bearcat_dao_test1 ( 
 	id bigint(20) NOT NULL COMMENT 'id',
 	name varchar(100) NOT NULL COMMENT '姓名',
 	create_at bigint(20) NOT NULL COMMENT '创建时间',

 	primary key(id, name)
 )ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='bearcat_dao_test1';

DROP TABLE IF EXISTS IDGenerator;
create table IDGenerator(
    name varchar(50) NOT NULL,
    id bigint(20) unsigned NOT NULL DEFAULT 0,
    
    PRIMARY KEY (name)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into IDGenerator (name, id) values ('bearcat_dao_test', 1);
insert into IDGenerator (name, id) values ('bearcat_dao_test1', 1);