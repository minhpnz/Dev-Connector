import React from "react";
import { Link } from "react-router-dom";
function Navbar() {
  return (
    <nav className="navbar bg-dark">
      <h1>
        <a href="index.html">
          <i className="fas fa-code"></i> DevConnector
        </a>
      </h1>
      <ul>
        <li>
          <a href="profiles.html">Developer</a>
        </li>
        <li>
          <Link to="register">Sign Up</Link>
        </li>
        <li>
          <Link to="login">Log in</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
