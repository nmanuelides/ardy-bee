// English dictionary — the canonical shape. `es` must match this structure
// (enforced by the `Dictionary` type). Values are plain strings only (the dict
// is passed to a Client Component, so it must stay serializable); use `{name}`
// style placeholders and interpolate at the call site.

export const en = {
  nav: {
    movies: "Movies",
    actors: "Actors",
    rankings: "Rankings",
    forYou: "For You",
    primary: "Primary",
  },
  common: {
    signIn: "Sign in",
    signOut: "Sign out",
    seeMore: "See more",
    loading: "Loading…",
    loadingShort: "Loading",
    rating: "rating",
    ratings: "ratings",
    performance: "performance",
    performances: "performances",
  },
  theme: {
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
  },
  language: {
    label: "ES", // shown on the button: the language you'd switch TO
    switchAria: "Switch to Spanish",
  },
  // Browser-tab <title> strings.
  meta: {
    defaultTitle: "Ardy Bee — Rate the performance, not the movie",
    description:
      "Ardy Bee (ARDB) is the Actors Ratings Data Base: rate actor performances from 1 to 10, build your taste profile, and discover films where your favorites share the screen.",
    movies: "Movies · Ardy Bee",
    actors: "Actors · Ardy Bee",
    rankings: "Rankings · Ardy Bee",
    forYou: "For You · Ardy Bee",
  },
  home: {
    eyebrow: "ARDB · Actors Ratings Data Base",
    headlineLead: "Rate the",
    headlineEm: "performance",
    headlineTail: ", not the movie.",
    sub: "Score every actor's work from 1 to 10. The more you rate, the sharper your taste profile gets — and Ardy Bee surfaces films where your favorites share the screen.",
    startRating: "Start rating",
    exploreRankings: "Explore rankings",
    popularNow: "Popular now",
    upcoming: "Upcoming",
  },
  leaderboard: {
    title: "The leaderboard",
    topActors: "Top actors",
    topMovies: "Top movies",
    nothingRated: "Nothing rated yet",
    empty:
      "No performances rated yet — be the first to put an actor on the board.",
  },
  movies: {
    title: "Movies",
    lead: "Browse films and rate the performances inside them.",
    popular: "Popular",
    topRated: "Top rated",
    comingSoon: "Coming soon",
  },
  actors: {
    title: "Actors",
    lead: "Discover performers and rate their work across every film.",
    popularThisWeek: "Popular this week",
  },
  actor: {
    filmography: "Filmography",
  },
  rankings: {
    title: "Rankings",
    lead: "Ranked by a weighted score — a deep body of strong work outranks a single lucky 10. The more ratings, the more a score is trusted.",
    yourTop: "Your top performances",
    yourTopSub: "by the score you gave",
    yourScore: "your score",
    bestPerformances: "Best performances",
    bestPerformancesSub: "across the hive",
    topActors: "Top actors",
    bestMovies: "Best movies",
    bestMoviesSub: "by ensemble",
    weighted: "weighted",
    emptyMine:
      "You haven't rated anything yet. Open a movie and rate the cast!",
    emptyPerformances:
      "No performances ranked yet — be the first to rate one.",
    emptyActors:
      "No actors ranked yet — rate some performances to get the hive buzzing.",
    emptyMovies:
      "No movies ranked yet — rate a cast to put a film on the board.",
  },
  movie: {
    castHeading: "The cast — rate the performances",
    noCast: "No cast information available.",
    rateCast: "Rate the cast →",
    ardyRating: "Ardy rating · {n} performances rated",
    as: "as", // "as <character>"
  },
  search: {
    placeholder: "Search movies & actors…",
    aria: "Search movies and actors",
    noMatches: "No matches",
    actor: "Actor",
    movie: "Movie",
  },
  recommendations: {
    title: "For you",
    lead: "Movies where two or more of your favorite actors share the screen — drawn from the performances you've rated highest.",
    signInPrompt:
      "Sign in and rate a few performances to unlock recommendations.",
    needTwo:
      "Rate performances from at least two actors you love (a 7 or higher), and we'll find films where they co-star.",
    favoriteHintPre: "So far your favorite is",
    favoriteHintPost: "— rate one more great performance to get started.",
    browseRankings: "Browse rankings",
    yourFavorites: "Your favorites",
    noCoStars:
      "None of your favorites have shared the screen yet. Rate more performances to widen the net!",
    favoritesBadge: "favorites",
    favoriteBadge: "favorite",
    featuring: "Featuring",
  },
  rating: {
    rate: "Rate",
    remove: "Remove",
    removeAria: "Remove your rating",
    trackAria: "Rate this performance from 1 to 10",
    cellAria: "{n} out of {max}",
    labels: {
      stings: "Stings",
      rough: "Rough",
      shaky: "Shaky",
      solid: "Solid",
      strong: "Strong",
      stellar: "Stellar",
      honey: "Honey",
    },
  },
  auth: {
    welcomeBack: "Welcome back",
    loginSub: "Sign in to rate performances and track your favorite actors.",
    joinHive: "Join the hive",
    signupSub: "Create an account to start rating actor performances.",
    displayName: "Display name",
    email: "Email",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    submitLogin: "Sign in",
    submitSignup: "Create account",
    submitting: "One sec…",
    or: "or",
    google: "Continue with Google",
    newToArdy: "New to Ardy Bee?",
    createAccount: "Create an account",
    haveAccount: "Already have an account?",
  },
  footer: {
    attribution:
      "This product uses the TMDB API but is not endorsed or certified by TMDB.",
  },
  // TMDb returns department names in English; map the common ones.
  departments: {
    Acting: "Acting",
    Directing: "Directing",
    Writing: "Writing",
    Production: "Production",
    Crew: "Crew",
    Sound: "Sound",
    Camera: "Camera",
    Editing: "Editing",
    Art: "Art",
    "Visual Effects": "Visual Effects",
    Lighting: "Lighting",
    "Costume & Make-Up": "Costume & Make-Up",
  } as Record<string, string>,
};

export type Dictionary = typeof en;

