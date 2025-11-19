import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedVehicles1763080674327 implements MigrationInterface {
    name = 'SeedVehicles1763080674327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`vehicles\` (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`licensePlate\` varchar(20) NOT NULL,
            \`brand\` varchar(50) NOT NULL,
            \`model\` varchar(50) NOT NULL,
            \`year\` int NOT NULL,
            \`type\` varchar(255) NOT NULL DEFAULT 'car',
            \`userId\` int NULL,
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            UNIQUE INDEX \`IDX_79a273823977d25c7523162cd5\` (\`licensePlate\`),
            PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB`);

        await queryRunner.query(`ALTER TABLE \`vehicles\` ADD CONSTRAINT \`FK_20f139b9d79f917ef735efacb00\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`vehicles\` DROP FOREIGN KEY \`FK_20f139b9d79f917ef735efacb00\``);
        await queryRunner.query(`DROP INDEX \`IDX_79a273823977d25c7523162cd5\` ON \`vehicles\``);
        await queryRunner.query(`DROP TABLE \`vehicles\``);
    }
}