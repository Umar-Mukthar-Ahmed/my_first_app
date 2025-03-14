import { useState, useEffect } from "react";
import Loader from "../../components/Loader/Loader";
import { getAllBlogs } from "../../api/internal";
import styles from "./Blog.module.css";
import { useNavigate } from "react-router-dom";

function Blog() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState(null);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search input

  useEffect(() => {
    (async function getAllBlogsApiCall() {
      try {
        const response = await getAllBlogs();

        if (response.status === 200) {
          if (!response.data.blogs) {
            setBlogs(null);
          } else {
            // Sort blogs by newest first (based on createdAt field)
            setBlogs(response.data.blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
          }
        } else {
          setError(true);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError(true);
      }
    })();
  }, []);

  // Filter blogs based on search input
  const filteredBlogs = blogs?.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return <div className={styles.error}>Failed to load blogs. Please try again later.</div>;
  }

  if (blogs === null) {
    return <div className={styles.noBlogs}>No blogs available at the moment.</div>;
  }

  if (blogs.length === 0) {
    return <Loader text="Loading blogs..." />;
  }

  return (
    <div>
      {/* Search Bar - Separate from Blogs */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search blogs..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Blog Grid */}
      <div className={styles.blogsWrapper}>
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <div
              key={blog._id}
              className={styles.blog}
              onClick={() => navigate(`/blog/${blog._id}`)}
            >
              <h1>{blog.title}</h1>
              <img src={blog.photopath} alt={blog.title} />
              <p>{blog.content}</p>
            </div>
          ))
        ) : (
          <p className={styles.noBlogs}>No blogs match your search.</p>
        )}
      </div>
    </div>
  );

}

export default Blog;
