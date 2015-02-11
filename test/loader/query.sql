sql blogResultList1
select 
	ba_blog.id as blog_id, 
	title as blog_title, 
	content as blog_content, 
	ba_author.name as author_name 
	from ${blogResultTable}
	where ba_blog.id = ba_author.id 
	order by ba_blog.create_at desc limit ? , ?
end

sql blogResultList2
select
	${blogResultList1} 
	ba_blog.id as blog_id, 
	title as blog_title, 
	content as blog_content, 
	ba_author.name as author_name 
	from ${blogResultTable}
	where ba_blog.id = ba_author.id 
	order by ba_blog.create_at desc limit ? , ? 
end

sql blogResultTable
xxxxxxxxxxx
${test}
end

sql test
~~~~~~~~~~~~~~~~~~~~~
end