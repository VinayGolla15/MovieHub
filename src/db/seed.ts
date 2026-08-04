import { db } from "./index";
import { users, movies, reviews, favorites, watchlist } from "./schema";
import * as bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Clear existing tables
  // We do raw deletes
  await db.delete(reviews);
  await db.delete(favorites);
  await db.delete(watchlist);
  await db.delete(movies);
  await db.delete(users);

  console.log("Cleared existing tables.");

  // Create Users
  const passwordHash = await bcrypt.hash("password123", 10);

  const [adminUser] = await db.insert(users).values({
    username: "admin",
    email: "admin@cinemahub.com",
    passwordHash: passwordHash,
    role: "admin",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
  }).returning();

  const [aliceUser] = await db.insert(users).values({
    username: "alice_movie_fan",
    email: "alice@gmail.com",
    passwordHash: passwordHash,
    role: "user",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
  }).returning();

  const [bobUser] = await db.insert(users).values({
    username: "bob_cinephile",
    email: "bob@gmail.com",
    passwordHash: passwordHash,
    role: "user",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
  }).returning();

  console.log("Seeded Users.");

  // Create Movies
  const moviesData = [
    {
      title: "Dune: Part Two",
      synopsis: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.",
      posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400",
      backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200",
      rating: 8.9,
      director: "Denis Villeneuve",
      cast: "Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem, Austin Butler, Florence Pugh",
      genre: "Sci-Fi, Adventure, Action",
      language: "English",
      releaseYear: 2024,
      trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
      duration: "166 mins",
      status: "Trending"
    },
    {
      title: "Inception",
      synopsis: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.",
      posterUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=400",
      backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200",
      rating: 9.2,
      director: "Christopher Nolan",
      cast: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy, Ken Watanabe, Cillian Murphy",
      genre: "Sci-Fi, Action, Thriller",
      language: "English",
      releaseYear: 2010,
      trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
      duration: "148 mins",
      status: "Top Rated"
    },
    {
      title: "Interstellar",
      synopsis: "When Earth becomes uninhabitable, a team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival, battling time, gravity, and the vast loneliness of the cosmos.",
      posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400",
      backdropUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1200",
      rating: 9.0,
      director: "Christopher Nolan",
      cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine, Casey Affleck",
      genre: "Sci-Fi, Drama, Adventure",
      language: "English",
      releaseYear: 2014,
      trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
      duration: "169 mins",
      status: "Popular"
    },
    {
      title: "The Dark Knight",
      synopsis: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
      posterUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=400",
      backdropUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200",
      rating: 9.5,
      director: "Christopher Nolan",
      cast: "Christian Bale, Heath Ledger, Aaron Eckhart, Maggie Gyllenhaal, Gary Oldman, Morgan Freeman",
      genre: "Action, Drama, Thriller",
      language: "English",
      releaseYear: 2008,
      trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
      duration: "152 mins",
      status: "Top Rated"
    },
    {
      title: "Parasite",
      synopsis: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan in this mind-bending modern masterpiece.",
      posterUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=400",
      backdropUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1200",
      rating: 9.1,
      director: "Bong Joon Ho",
      cast: "Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong, Choi Woo-shik, Park So-dam",
      genre: "Thriller, Drama, Comedy",
      language: "Korean",
      releaseYear: 2019,
      trailerUrl: "https://www.youtube.com/watch?v=5xH0HfJHsaY",
      duration: "132 mins",
      status: "Top Rated"
    },
    {
      title: "Everything Everywhere All at Once",
      synopsis: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
      posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400",
      backdropUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200",
      rating: 8.8,
      director: "Daniel Kwan, Daniel Scheinert",
      cast: "Michelle Yeoh, Stephanie Hsu, Ke Huy Quan, Jamie Lee Curtis, James Hong",
      genre: "Sci-Fi, Action, Comedy, Drama",
      language: "English",
      releaseYear: 2022,
      trailerUrl: "https://www.youtube.com/watch?v=wxN1T1uxQ2g",
      duration: "139 mins",
      status: "Popular"
    },
    {
      title: "Spider-Man: Beyond the Spider-Verse",
      synopsis: "Miles Morales faces his greatest trials yet as he navigates across the Multiverse to save those he loves from the Spot and the forces of the Spider-Society.",
      posterUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=400",
      backdropUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=1200",
      rating: 9.3,
      director: "Joaquim Dos Santos",
      cast: "Shameik Moore, Hailee Steinfeld, Oscar Isaac, Jake Johnson, Jason Schwartzman",
      genre: "Action, Sci-Fi, Adventure",
      language: "English",
      releaseYear: 2026,
      trailerUrl: "https://www.youtube.com/watch?v=g4Hbz2j0n08",
      duration: "145 mins",
      status: "Upcoming"
    },
    {
      title: "John Wick: Chapter 4",
      synopsis: "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.",
      posterUrl: "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?auto=format&fit=crop&q=80&w=400",
      backdropUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=1200",
      rating: 8.7,
      director: "Chad Stahelski",
      cast: "Keanu Reeves, Donnie Yen, Bill Skarsgård, Laurence Fishburne, Hiroyuki Sanada",
      genre: "Action, Thriller",
      language: "English",
      releaseYear: 2023,
      trailerUrl: "https://www.youtube.com/watch?v=qEVUtrk8_B4",
      duration: "169 mins",
      status: "Trending"
    },
    {
      title: "Nosferatu",
      synopsis: "A gothic tale of obsession between a haunted young woman and the terrifying vampire infatuated with her, causing untold horror in its wake.",
      posterUrl: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?auto=format&fit=crop&q=80&w=400",
      backdropUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1200",
      rating: 8.5,
      director: "Robert Eggers",
      cast: "Bill Skarsgård, Nicholas Hoult, Lily-Rose Depp, Aaron Taylor-Johnson, Willem Dafoe",
      genre: "Horror, Thriller, Drama",
      language: "English",
      releaseYear: 2025,
      trailerUrl: "https://www.youtube.com/watch?v=nunXwH07Wss",
      duration: "135 mins",
      status: "Upcoming"
    },
    {
      title: "Oppenheimer",
      synopsis: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb, illustrating the burden of nuclear power on a brilliant mind.",
      posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=400",
      backdropUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=1200",
      rating: 9.0,
      director: "Christopher Nolan",
      cast: "Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr., Florence Pugh",
      genre: "Drama, History, Thriller",
      language: "English",
      releaseYear: 2023,
      trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
      duration: "180 mins",
      status: "Top Rated"
    },
    {
      title: "Blade Runner 2049",
      synopsis: "A new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos, leading him to track down Rick Deckard.",
      posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400",
      backdropUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=1200",
      rating: 8.6,
      director: "Denis Villeneuve",
      cast: "Ryan Gosling, Harrison Ford, Ana de Armas, Sylvia Hoeks, Robin Wright",
      genre: "Sci-Fi, Mystery, Thriller",
      language: "English",
      releaseYear: 2017,
      trailerUrl: "https://www.youtube.com/watch?v=gCcx85zbxz4",
      duration: "164 mins",
      status: "Popular"
    },
    {
      title: "Anatomy of a Fall",
      synopsis: "A woman is suspected of murder after her husband's death in the snow in an isolated chalet. Their blind son faces a moral dilemma as the main witness.",
      posterUrl: "https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?auto=format&fit=crop&q=80&w=400",
      backdropUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200",
      rating: 8.2,
      director: "Justine Triet",
      cast: "Sandra Hüller, Swann Arlaud, Milo Machado Graner, Antoine Reinartz",
      genre: "Drama, Thriller, Crime",
      language: "French",
      releaseYear: 2023,
      trailerUrl: "https://www.youtube.com/watch?v=fTrsp5f9S_o",
      duration: "151 mins",
      status: "Trending"
    },
    {
      title: "Spirited Away",
      synopsis: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
      posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=400",
      backdropUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=1200",
      rating: 9.3,
      director: "Hayao Miyazaki",
      cast: "Rumi Hiiragi, Miyu Irino, Mari Natsuki, Takashi Naito, Yasuko Sawaguchi",
      genre: "Fantasy, Animation, Family",
      language: "Japanese",
      releaseYear: 2001,
      trailerUrl: "https://www.youtube.com/watch?v=ByXuk9QqQkk",
      duration: "125 mins",
      status: "Top Rated"
    },
    {
      title: "The Zone of Interest",
      synopsis: "The commandant of Auschwitz, Rudolf Höss, and his wife Hedwig, strive to build a dream life for their family in a house and garden next to the camp.",
      posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=400",
      backdropUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200",
      rating: 8.0,
      director: "Jonathan Glazer",
      cast: "Christian Friedel, Sandra Hüller, Johann Karthaus, Luis Noah Witte",
      genre: "Drama, History, War",
      language: "German",
      releaseYear: 2023,
      trailerUrl: "https://www.youtube.com/watch?v=r-vfg3Kkd5U",
      duration: "105 mins",
      status: "Popular"
    },
    {
      title: "Mickey 17",
      synopsis: "Mickey 17 is an 'Expendable'—a disposable employee on a human expedition sent to colonize the ice world Niflheim. After one iteration dies, a new body is regenerated with most of his memories intact.",
      posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400",
      backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200",
      rating: 8.4,
      director: "Bong Joon Ho",
      cast: "Robert Pattinson, Naomi Ackie, Toni Collette, Mark Ruffalo, Steven Yeun",
      genre: "Sci-Fi, Comedy, Drama",
      language: "English",
      releaseYear: 2025,
      trailerUrl: "https://www.youtube.com/watch?v=nNAnS9XpTFE",
      duration: "129 mins",
      status: "Upcoming"
    }
  ];

  const seededMovies = [];
  for (const movie of moviesData) {
    const [inserted] = await db.insert(movies).values(movie).returning();
    seededMovies.push(inserted);
  }

  console.log(`Seeded ${seededMovies.length} Movies.`);

  // Create some default reviews
  const reviewData = [
    {
      userId: aliceUser.id,
      movieId: seededMovies[0].id, // Dune Part Two
      rating: 9,
      reviewText: "Denis Villeneuve does it again! The visuals are absolutely jaw-dropping, and the sound design is incredible. Timothée and Zendaya have incredible chemistry. An absolute cinematic triumph!",
      status: "approved"
    },
    {
      userId: bobUser.id,
      movieId: seededMovies[0].id, // Dune Part Two
      rating: 10,
      reviewText: "Hands down the best sci-fi film of the decade. This is what the big screen was made for. I have watched it three times already and I am still in awe. Highly recommended!",
      status: "approved"
    },
    {
      userId: aliceUser.id,
      movieId: seededMovies[1].id, // Inception
      rating: 10,
      reviewText: "Mind-bending and emotionally resonant. The Hans Zimmer score is legendary. This film completely changed how I think about dreaming and cinema. Nolan's best work.",
      status: "approved"
    },
    {
      userId: bobUser.id,
      movieId: seededMovies[3].id, // The Dark Knight
      rating: 10,
      reviewText: "Heath Ledger's performance is legendary. A masterpiece that transcends the superhero genre entirely. Dark, gritty, and incredibly intense from start to finish.",
      status: "approved"
    },
    {
      userId: aliceUser.id,
      movieId: seededMovies[4].id, // Parasite
      rating: 9,
      reviewText: "A masterclass in genre-bending. One moment you're laughing, the next you are in sheer suspense. Bong Joon Ho deserves all the praise and Oscars he got.",
      status: "approved"
    }
  ];

  for (const rev of reviewData) {
    await db.insert(reviews).values(rev);
  }
  console.log("Seeded Reviews.");

  // Add some watchlists and favorites
  await db.insert(watchlist).values({
    userId: aliceUser.id,
    movieId: seededMovies[0].id, // Dune
  });

  await db.insert(watchlist).values({
    userId: aliceUser.id,
    movieId: seededMovies[6].id, // Beyond Spider-Verse
  });

  await db.insert(favorites).values({
    userId: aliceUser.id,
    movieId: seededMovies[1].id, // Inception
  });

  await db.insert(favorites).values({
    userId: bobUser.id,
    movieId: seededMovies[3].id, // Dark Knight
  });

  console.log("Seeded watchlists and favorites.");
  console.log("Database seeded successfully!");
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding database:", err);
    process.exit(1);
  });
