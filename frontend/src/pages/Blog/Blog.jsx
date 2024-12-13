import { useState, useEffect } from "react";
import Loader from "../../components/Loader/Loader";
import { getAllBlogs } from "../../api/internal";
import styles from "./Blog.module.css";
import { useNavigate } from "react-router-dom";

function Blog() {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    (async function getAllBlogsApiCall() {
      const response = await getAllBlogs();

      if (response.status === 200) {
        setBlogs(response.data.blogs);
      }
    })();

    setBlogs([]);
  }, []);

  if (blogs.length === 0) {
    return <Loader text="blogs" />;
  }
  return (
    <div className={styles.blogsWrapper}>
      {blogs.map((blog) => (
        <div
          id={blog._id}
          className={styles.blog}
          onClick={() => navigate(`/blog/${blog._id}`)}
        >
          <h1>{blog.title}</h1>
          <img src={blog.photo} />
          <p>{blog.content}</p>
        </div>
      ))}
    </div>
  );
}

export default Blog;

// import { useState, useEffect } from "react";
// import Loader from "../../components/Loader/Loader";
// import { getAllBlogs } from "../../api/internal";
// import styles from "./Blog.module.css";
// import { useNavigate } from "react-router-dom";

// function Blog() {
//   const navigate = useNavigate();

//   const [blogs, setBlogs] = useState([]);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     (async function getAllBlogsApiCall() {
//       try {
//         const response = await getAllBlogs();

//         if (response.status === 200) {
//           setBlogs(response.data.blogs);
//         } else {
//           setError(true);
//         }
//       } catch (error) {
//         console.error("Error fetching blogs:", error);
//         setError(true);
//       }
//     })();
//   }, []);

//   if (error) {
//     return <div className={styles.error}>Failed to load blogs. Please try again later.</div>;
//   }

//   if (blogs.length === 0) {
//     return <Loader text="blogs" />;
//   }

//   return (
//     <div className={styles.blogsWrapper}>
//       {blogs.map((blog) => (
//         <div
//           key={blog._id}
//           className={styles.blog}
//           onClick={() => navigate(`/blog/${blog._id}`)}
//         >
//           <h1>{blog.title}</h1>
//           <img src={blog.photopath} alt={blog.title} />
//           <p>{blog.content}</p>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default Blog;
