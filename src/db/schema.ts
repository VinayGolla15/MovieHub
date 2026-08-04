import { pgTable, serial, text, integer, varchar, doublePrecision, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).default("user").notNull(), // 'user', 'admin'
  avatarUrl: text("avatar_url").default("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  synopsis: text("synopsis").notNull(),
  posterUrl: text("poster_url").notNull(),
  backdropUrl: text("backdrop_url").notNull(),
  rating: doublePrecision("rating").default(0).notNull(), // overall average rating
  director: varchar("director", { length: 100 }).notNull(),
  cast: text("cast").notNull(), // comma separated names
  genre: varchar("genre", { length: 255 }).notNull(), // comma separated genres e.g., 'Action, Sci-Fi'
  language: varchar("language", { length: 50 }).notNull(),
  releaseYear: integer("release_year").notNull(),
  trailerUrl: text("trailer_url").default("").notNull(),
  duration: varchar("duration", { length: 20 }).notNull(), // e.g. "148 mins"
  status: varchar("status", { length: 50 }).default("Popular").notNull(), // "Trending", "Popular", "Top Rated", "Upcoming"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  movieId: integer("movie_id").references(() => movies.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(), // 1 to 10
  reviewText: text("review_text").notNull(),
  status: varchar("status", { length: 20 }).default("approved").notNull(), // "approved", "pending", "flagged"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  movieId: integer("movie_id").references(() => movies.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  movieId: integer("movie_id").references(() => movies.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  favorites: many(favorites),
  watchlist: many(watchlist),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  reviews: many(reviews),
  favorites: many(favorites),
  watchlist: many(watchlist),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [reviews.movieId],
    references: [movies.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [favorites.movieId],
    references: [movies.id],
  }),
}));

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(users, {
    fields: [watchlist.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [watchlist.movieId],
    references: [movies.id],
  }),
}));
