import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import Show from "./Show";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const API_URL = "https://www.omdbapi.com/?apikey=35f704b1";
const App = () => {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [Errormsg, setErrormsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setselectedId] = useState(null);
  const controller = new AbortController();
  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem("watched");
    return JSON.parse(storedValue);
  });

  const searchMovies = async () => {
    try {
      setIsLoading(true);
      setErrormsg("");
      const response = await fetch(`${API_URL}&s=${query}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Something is wrong xD");

      const data = await response.json();
      if (data.Response === "False") throw new Error("Movie not found");
      setMovies(data.Search);
      console.log(data.Search);
      setErrormsg("");
    } catch (err) {
      if (err.name !== "AbortError") {
        setErrormsg(err.message);
      }
    } finally {
      setIsLoading(false);
    }
    if (query.length <= 2) {
      setMovies([]);
      setErrormsg("");
      return;
    }
  };

  useEffect(() => {
    searchMovies();
    return function () {
      controller.abort();
    };
  }, [query]);

  function handleSelectedMovie(id) {
    setselectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setselectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);

    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
    // we will rather use this in useEffect
  }

  function handleDeleteWatchedMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main movies={movies}>
        <Box movies={movies}>
          {isLoading && <Loader />}
          {!isLoading && !Errormsg && (
            <MovieList
              movies={movies}
              handleSelectedMovie={handleSelectedMovie}
            />
          )}
          {Errormsg && <Errormessage message={Errormsg} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              handleCloseMovie={handleCloseMovie}
              handleAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedList
                watched={watched}
                handleDeleteWatchedMovie={handleDeleteWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
      {/* <StarRating
        maxRating={5}
        messages={["Poor", "average", "good", "best", "outstanding"]}
      />
      <StarRating maxRating={4} defaultRating={3} />
      <Show /> */}
    </>
  );
};

export default App;

//components

//nav bar
const NavBar = ({ children }) => {
  return <nav className="nav-bar">{children}</nav>;
};

//Logo component
const Logo = () => {
  return (
    <>
      <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>
    </>
  );
};

//search component
const Search = ({ query, setQuery }) => {
  const inputEl = useRef(null);

  useEffect(
    function () {
      function callback(e) {
        if (document.activeElement === inputEl.current) return;

        if (e.code === "Enter") {
          inputEl.current.focus();
          setQuery("");
        }
      }
      document.addEventListener("keydown", callback);
      return () => document.addEventListener("keydown", callback);
    },
    [setQuery]
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
};

//numresults
const NumResults = ({ movies }) => {
  return (
    <p className="num-results">
      {/* Found <strong>{movies.length}</strong> results */}
      Found <strong>{movies.length}</strong> results
    </p>
  );
};

//loader

const Loader = () => {
  return <p className="loader">Loading....</p>;
};

//error message
const Errormessage = ({ message }) => {
  return <p className="error">🥲{message}</p>;
};

//main
const Main = ({ children }) => {
  return <main className="main">{children}</main>;
};

//main left side box

const Box = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "-" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
};

//Movies list
const MovieList = ({ movies, handleSelectedMovie }) => {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectedMovie={handleSelectedMovie}
        />
      ))}
    </ul>
  );
};

//movie
const Movie = ({ movie, handleSelectedMovie }) => {
  return (
    <>
      <li key={movie.imdbID} onClick={() => handleSelectedMovie(movie.imdbID)}>
        <img src={movie.Poster} alt={`${movie.Title} poster`} />
        <h3>{movie.Title}</h3>
        <div>
          <p>
            <span>🗓</span>
            <span>{movie.Year}</span>
          </p>
        </div>
      </li>
    </>
  );
};

//main right side box

// const WatchedBox = () => {
//   const [isOpen2, setIsOpen2] = useState(true);
//   const [watched, setWatched] = useState(tempWatchedData);

//   return (
//     <>
//       <div className="box">
//         <button
//           className="btn-toggle"
//           onClick={() => setIsOpen2((open) => !open)}
//         >
//           {isOpen2 ? "–" : "+"}
//         </button>
//         {isOpen2 && (
//           <>
//             <WatchedSummary watched={watched} />

//             <WatchedList watched={watched} />
//           </>
//         )}
//       </div>
//     </>
//   );
// };

//selectedmovie

function MovieDetails({
  selectedId,
  watched,
  handleCloseMovie,
  handleAddWatched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setuserRating] = useState("");

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current = countRef.current + 1;
    },
    [userRating]
  );

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };

    handleAddWatched(newWatchedMovie);
    handleCloseMovie();
  }

  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true);
      const response = await fetch(`${API_URL}&i=${selectedId}`);
      if (!response.ok) throw new Error("Something is wrong xD");

      const data = await response.json();
      console.log(data);
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedId]);

  useEffect(() => {
    document.title = `${movie.Title}`;
    return function () {
      document.title = "Movie info";
    };
  }, [movie.Title]);

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          handleCloseMovie();
          console.log("why");
        }
      }
      document.addEventListener("keydown", callback);
      // return function () {
      //   document.removeEventListener("keydown", callback);
      // };
    },
    [handleCloseMovie]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button
              className="btn-back"
              onClick={() => {
                handleAdd();
              }}
            >
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>⭐️ {imdbRating}</p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setuserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to List
                    </button>
                  )}{" "}
                </>
              ) : (
                <p>
                  You have already Rated {watchedUserRating}⭐️ to this movie
                </p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>{`Staring:${actors}`}</p>
            <p>Director:{director}</p>
          </section>
        </>
      )}
    </div>
  );
}

//watched summary

const WatchedSummary = ({ watched }) => {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <>
      <div className="summary">
        <h2>Movies you watched</h2>
        <div>
          <p>
            <span>#️⃣</span>
            <span>{watched.length} movies</span>
          </p>
          <p>
            <span>⭐️</span>
            <span>{avgImdbRating.toFixed(1)}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{avgUserRating.toFixed(1)}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{avgRuntime} min</span>
          </p>
        </div>
      </div>
    </>
  );
};

//watchedlist component
const WatchedList = ({ watched, handleDeleteWatchedMovie }) => {
  return (
    <>
      <ul className="list">
        {watched.map((movie) => (
          <WatchedMovie
            movie={movie}
            key={movie.imdbID}
            handleDeleteWatchedMovie={handleDeleteWatchedMovie}
          />
        ))}
      </ul>
    </>
  );
};

//watched movie

const WatchedMovie = ({ movie, handleDeleteWatchedMovie }) => {
  return (
    <>
      <li key={movie.imdbID}>
        <img src={movie.poster} alt={`${movie.title} poster`} />
        <h3>{movie.title}</h3>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>
          <button
            className="btn-delete"
            onClick={() => handleDeleteWatchedMovie(movie.imdbID)}
          >
            X
          </button>
        </div>
      </li>
    </>
  );
};
