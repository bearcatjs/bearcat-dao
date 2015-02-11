sql blogResultSql
select 
	ba_blog.id as blog_id,
	ba_blog.aid as blog_aid,
	ba_blog.title as blog_title,
	ba_blog.content as blog_content,
	ba_author.name as author_name,
	ba_comment.content as comment_content
	from ba_blog, ba_author, ba_comment
	where ba_blog.id = ? and ba_blog.aid = ba_author.id and ba_comment.bid = ba_blog.id
end