import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLogTable1763086827456 implements MigrationInterface {
    name = 'CreateLogTable1763086827456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user\` varchar(255) NOT NULL, \`vehiclePlate\` varchar(255) NOT NULL, \`result\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`cityId\` int NULL, \`vehicleId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD CONSTRAINT \`FK_b64ea732fe8fcaf88706e104107\` FOREIGN KEY (\`cityId\`) REFERENCES \`cities\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD CONSTRAINT \`FK_5c0c73e3331c274e13ae0cb9d73\` FOREIGN KEY (\`vehicleId\`) REFERENCES \`vehicles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`logs\` DROP FOREIGN KEY \`FK_5c0c73e3331c274e13ae0cb9d73\``);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP FOREIGN KEY \`FK_b64ea732fe8fcaf88706e104107\``);
        await queryRunner.query(`DROP TABLE \`logs\``);
    }

}
