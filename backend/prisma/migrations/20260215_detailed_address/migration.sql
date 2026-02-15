-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "address",
ADD COLUMN     "zipCode" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
