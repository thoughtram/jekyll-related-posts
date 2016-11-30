## Generate meta data for related posts and videos

Invoke `index.js` with a parameter pointing to a directory that contains posts.

E.g `node index.js ../thoughtram-blog/_posts/`

It will generate sections `related_posts` and `related_videos` for each post. Generation of related videos can be skipped if the post head contains `no_related_videos:true`
