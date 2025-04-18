import { navigate, useParams } from "react-router";

import "./breadcrumb.css";

export const Breadcrumb = () => {

  const { location, slug } = useParams();

  function href(segment: string) {
    const output = location
      .slice(0, location.indexOf(segment) + 1)
    return output;
  }

  return (
    <nav className="breadcrumb">
      <ol>
        {slug.map((segment, index) => (
          <li key={segment + index}>
            {index < slug.length - 1 ? (
              <a
                href={href(segment)}
                target="_self"
                onClick={(ev) => {
                  ev.preventDefault();
                  const href = (ev.target as Element).getAttribute('href') as string;
                  navigate(href);
                }} >
                {segment}
              </a>
            ) : (
              <span>
                {segment}
              </span>
            )}

          </li>
        ))}
      </ol>
    </nav>
  )
}