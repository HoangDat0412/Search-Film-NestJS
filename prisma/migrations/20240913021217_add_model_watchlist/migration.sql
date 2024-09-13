-- CreateTable
CREATE TABLE "Watchlist" (
    "watchlist_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("watchlist_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_user_id_movie_id_key" ON "Watchlist"("user_id", "movie_id");

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "Movie"("movie_id") ON DELETE RESTRICT ON UPDATE CASCADE;
