import { useState, useEffect } from "react";
import { getNews } from "../../api/external";
import styles from "./Home.module.css";
import Loader from "../../components/Loader/Loader";

function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async function newsApiCall() {
      try {
        const response = await getNews();
        if (response && response.length > 0) {
          setArticles(response);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCardClick = (url) => {
    window.open(url, "_blank");
  };

  if (loading) {
    return <Loader text="homepage" />;
  }

  if (error) {
    return <div className={styles.error}>Failed to load articles. Please try again later.</div>;
  }

  return (
    <>
      <div className={styles.header}>Latest Articles</div>
      <div className={styles.grid}>
        {articles.map((article) => (
          <div
            className={styles.card}
            key={article.url}
            onClick={() => handleCardClick(article.url)}
          >
            <img
              src={article.urlToImage || "https://via.placeholder.com/300"}
              alt={article.title}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300";
              }}
            />
            <h3>{article.title}</h3>
          </div>
        ))}
      </div>
    </>
  );
}

export default Home;