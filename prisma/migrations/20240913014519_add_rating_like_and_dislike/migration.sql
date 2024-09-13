-- CreateTable
CREATE TABLE "RatingLikeDislike" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rating_id" INTEGER NOT NULL,
    "is_like" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RatingLikeDislike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RatingLikeDislike_user_id_rating_id_key" ON "RatingLikeDislike"("user_id", "rating_id");

-- AddForeignKey
ALTER TABLE "RatingLikeDislike" ADD CONSTRAINT "RatingLikeDislike_rating_id_fkey" FOREIGN KEY ("rating_id") REFERENCES "Rating"("rating_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingLikeDislike" ADD CONSTRAINT "RatingLikeDislike_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
