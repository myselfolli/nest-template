import { MigrationInterface, QueryRunner } from "typeorm";

export class Changes1729515008484 implements MigrationInterface {
    name = 'Changes1729515008484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "t_user" ("id" SERIAL NOT NULL, "email" text NOT NULL, "password" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_1d0b42896fa20240f9ffcc8012a" UNIQUE ("email"), CONSTRAINT "PK_6a6708d647ac5da9ab8271cfede" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "t_user"`);
    }

}
