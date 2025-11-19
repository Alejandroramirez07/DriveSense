import { Log } from "../../logss/entities/log.entity";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,  UpdateDateColumn, OneToMany} from "typeorm";

@Entity('cities')
export class City {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ default: false })
    isActive: boolean; /// Whether the city has active traffic restrictions (pico y placa)

    @Column({ nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Log, (log) => log.city)
    logs: Log[];
}
