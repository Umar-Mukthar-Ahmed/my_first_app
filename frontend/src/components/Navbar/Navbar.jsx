import { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useSelector } from "react-redux";
import { signout } from "../../api/internal";
import { resetUser } from "../../store/userSlice";
import { useDispatch } from "react-redux";

function Navbar() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.user.auth);
  const [showNavbar, setShowNavbar] = useState(false);

  const handleSignout = async () => {
    await signout();
    dispatch(resetUser());
  };

  const handleShowNavbar = () => {
    setShowNavbar(!showNavbar);
  };

  // Close the sidebar when a link is clicked
  const closeSidebar = () => {
    setShowNavbar(false);
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <NavLink to="/" className={styles.logo}>
            BlogSpot
          </NavLink>

          {/* Animated Hamburger Menu */}
          <div
            className={`${styles.menuIcon} ${showNavbar && styles.open}`}
            onClick={handleShowNavbar}
          >
            <div className={styles.bar}></div>
            <div className={styles.bar}></div>
            <div className={styles.bar}></div>
          </div>

          <div className={`${styles.navElements} ${showNavbar && styles.active}`}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? styles.activeStyle : styles.inActiveStyle
              }
              onClick={closeSidebar} // Close sidebar when clicked
            >
              Home
            </NavLink>

            <NavLink
              to="crypto"
              className={({ isActive }) =>
                isActive ? styles.activeStyle : styles.inActiveStyle
              }
              onClick={closeSidebar} // Close sidebar when clicked
            >
              Cryptocurrencies
            </NavLink>

            <NavLink
              to="blogs"
              className={({ isActive }) =>
                isActive ? styles.activeStyle : styles.inActiveStyle
              }
              onClick={closeSidebar} // Close sidebar when clicked
            >
              Blogs
            </NavLink>

            <NavLink
              to="submit"
              className={({ isActive }) =>
                isActive ? styles.activeStyle : styles.inActiveStyle
              }
              onClick={closeSidebar} // Close sidebar when clicked
            >
              Submit a blog
            </NavLink>

            {isAuthenticated ? (
              <button
                className={styles.signOutButton}
                onClick={() => {
                  handleSignout();
                  closeSidebar(); // Close sidebar when clicked
                }}
              >
                Sign Out
              </button>
            ) : (
              <>
                <NavLink
                  to="login"
                  className={({ isActive }) =>
                    isActive ? styles.activeStyle : styles.inActiveStyle
                  }
                  onClick={closeSidebar} // Close sidebar when clicked
                >
                  <button className={styles.logInButton}>Log In</button>
                </NavLink>

                <NavLink
                  to="signup"
                  className={({ isActive }) =>
                    isActive ? styles.activeStyle : styles.inActiveStyle
                  }
                  onClick={closeSidebar} // Close sidebar when clicked
                >
                  <button className={styles.signUpButton}>Sign Up</button>
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className={styles.separator}></div>
    </>
  );
}

export default Navbar;