import { Link, Outlet } from "react-router-dom";
import List from "../components/List/List";

export default function Root() {
    return (
      <>
        <div id="sidebar">
          <h1></h1>
          <div>
            <form id="search-form" role="search">
              <input
                id="q"
                aria-label="Ricerca"
                placeholder="Ricerca"
                type="search"
                name="q"
              />
              <div
                id="search-spinner"
                aria-hidden
                hidden={true}
              />
              <div
                className="sr-only"
                aria-live="polite"
              ></div>
            </form>
            <form method="post">
              <button type="submit">Nuovo</button>
            </form>
          </div>
          <nav>
          <List />
            {/* <ul>
              <li>
                <Link to={`/la-preghiera/contacts/1`}>Your Name</Link>
              </li>
              <li>
                <Link to={`/la-preghiera/contacts/2`}>Your Friend</Link>
              </li>
            </ul> */}
          </nav>
        </div>
        <div id="detail">
        <Outlet />
      </div>
      </>
    );
  }
