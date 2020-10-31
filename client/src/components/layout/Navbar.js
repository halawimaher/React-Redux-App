import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
<nav className="navbar bg-dark">
      <h1>
        <Link href="/"><i className="fas fa-code"></i> CodiConnector</Link>
      </h1>
      <ul>
        <li><a href="!#">Gurus</a></li>
        <li><Link to="/register">Join the Community</Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </nav>
    )
}

export default Navbar;
