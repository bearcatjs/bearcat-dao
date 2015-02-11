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

DROP TABLE IF EXISTS ba_blog;
create table ba_blog(
	id bigint(20) NOT NULL COMMENT 'blog id',	
    aid bigint(20) NOT NULL COMMENT 'author id',
    title varchar(1024) NOT NULL COMMENT 'blog title',
    content varchar(65535) COMMENT 'blog content',

    create_at bigint(20) NOT NULL COMMENT '创建时间',
 	update_at bigint(20) NOT NULL COMMENT '更新时间',
    
    PRIMARY KEY (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS ba_comment;
create table ba_comment(
	id bigint(20) NOT NULL COMMENT 'comment id',	
    aid bigint(20) NOT NULL COMMENT 'author id',
	bid bigint(20) NOT NULL COMMENT 'blog id',	
	content varchar(1024) NOT NULL COMMENT 'comment',
	
	create_at bigint(20) NOT NULL COMMENT '创建时间',
 	update_at bigint(20) NOT NULL COMMENT '更新时间',
	PRIMARY KEY (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;	

DROP TABLE IF EXISTS ba_author;
create table ba_author(
    id bigint(20) NOT NULL COMMENT 'comment id',    
    name varchar(255) NOT NULL COMMENT 'author',
    
    create_at bigint(20) NOT NULL COMMENT '创建时间',
    update_at bigint(20) NOT NULL COMMENT '更新时间',
    PRIMARY KEY (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;   

DROP TABLE IF EXISTS IDGenerator;
create table IDGenerator(
    name varchar(50) NOT NULL,
    id bigint(20) unsigned NOT NULL DEFAULT 0,
    
    PRIMARY KEY (name)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into IDGenerator (name, id) values ('bearcat_dao_test', 1);
insert into IDGenerator (name, id) values ('bearcat_dao_test1', 1);
insert into IDGenerator (name, id) values ('ba_blog', 1);
insert into IDGenerator (name, id) values ('ba_comment', 1);
insert into IDGenerator (name, id) values ('ba_author', 1);

insert into ba_blog (id, aid, title, content, create_at, update_at) values (1, 1, 'test_title', 'test_content', 1423188291391, 1423188291391);
insert into ba_author (id, name, create_at, update_at) values(1, 'test_author', 1423188291391, 1423188291391);    
insert into ba_comment (id, aid, bid, content, create_at, update_at) values(1, 1, 1, 'test_comment_1', 1423188291391, 1423188291391);
insert into ba_comment (id, aid, bid, content, create_at, update_at) values(2, 1, 1, 'test_comment_2', 1423188291391, 1423188291391);
insert into ba_comment (id, aid, bid, content, create_at, update_at) values(3, 1, 1, 'test_comment_3', 1423188291391, 1423188291391);

insert into ba_blog (id, aid, title, content, create_at, update_at) values (2, 2, 'test_title_2', 'test_content_2', 1423188291391, 1423188291391);
insert into ba_author (id, name, create_at, update_at) values(2, 'test_author_2', 1423188291391, 1423188291391);  