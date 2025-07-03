// src/components/layout/Layout.jsx

import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  Container,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  NavLink, // We can use this for future nav links
} from 'reactstrap';

const Layout = () => {
  // State to manage the open/closed state of the navbar on small screens
  const [isOpen, setIsOpen] = useState(false);

  // Function to toggle the navbar's state
  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="App">
      {/* This Navbar will now appear on every page */}
      <Navbar color="dark" dark expand="md" fixed="top">
        <Container>
          {/* The NavbarBrand is a great place for your main logo/title.
              We wrap it in React Router's Link so it navigates home. */}
          <NavbarBrand tag={Link} to="/">
            Druid Video Portal
          </NavbarBrand>

          {/* This is the hamburger menu button that appears on smaller screens */}
          <NavbarToggler onClick={toggle} />

          {/* This Collapse component contains the navigation links.
              It collapses on small screens and is controlled by the 'isOpen' state. */}
          <Collapse isOpen={isOpen} navbar>
            {/* 'ms-auto' pushes the nav items to the right on medium screens and up */}
            <Nav className="ms-auto" navbar>
              {/* --- Future Navigation Links Would Go Here --- */}
              <NavItem>
                {/* Use tag={Link} to make it a React Router link for seamless navigation */}
                <NavLink tag={Link} to="/collections">
                  My Collections
                </NavLink>
              </NavItem>
              <NavItem>
                {/* For now, a placeholder link. Later this could be "My Account" or "Login" */}
                <NavLink href="#" disabled>
                  (Placeholder Link)
                </NavLink>
              </NavItem>
              {/* Example of another link:
              <NavItem>
                <NavLink tag={Link} to="/about">
                  About
                </NavLink>
              </NavItem>
              */}
            </Nav>
          </Collapse>
        </Container>
      </Navbar>

      {/* We add some top padding to our main container to prevent content
          from being hidden underneath the fixed navbar. */}
      <Container style={{ paddingTop: '80px' }}>
        <main>
          <Outlet />
        </main>
      </Container>
    </div>
  );
};

export default Layout;