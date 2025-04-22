import { NavLink } from "react-router";


function Header() {

  return (
    <header>
      Vite React Router
      <nav>
        <ul className="main-menu">
          <li>
            <NavLink to="/" title="home">Home</NavLink>
          </li>
          <li>
            <NavLink to="/about" title="about">About</NavLink>
          </li>
          <li>
            <NavLink to="/form" title="form">Form Example</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header;