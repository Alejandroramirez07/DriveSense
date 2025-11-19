import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    ManyToOne 
} from 'typeorm';
import { City } from '../../city/entities/city.entity'; 
import { Vehicle } from '../../vehicles/entities/vehicle.entity'; 

@Entity('logs')
export class Log {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    user: string;

    @Column({ nullable: true })
    method: string;

    @Column({ nullable: true })
    endpoint: string; 

    @Column('text', { nullable: true })
    body: string;

    @Column({ nullable: true })
    vehiclePlate: string; 

    @Column({ nullable: true })
    result: string; 

    @ManyToOne(() => City, { nullable: true })
    city: City;

    @ManyToOne(() => Vehicle, { nullable: true })
    vehicle: Vehicle;

    @CreateDateColumn()
    createdAt: Date;
}