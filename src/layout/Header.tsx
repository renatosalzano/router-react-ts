import { NavLink } from "react-router";
import { Routes } from "../pages/routes";





function Header() {

  return (
    <header>
      Vite React Router
      <nav>
        <ul className="main-menu">
          <li>
            <NavLink to="/" title="home">home</NavLink>
          </li>
          <li>
            <NavLink to="/about" title="about">about</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header;