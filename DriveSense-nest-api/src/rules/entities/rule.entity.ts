import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { City } from '../../city/entities/city.entity';

@Entity('rules')
export class Rule {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    dayOfWeek: string; // Ejemplo: "Lunes", "Martes", etc.

    @Column()
    startTime: string; // Ejemplo: "06:00"

    @Column()
    endTime: string; // Ejemplo: "08:30"

    @Column('simple-array')
    restrictedDigits: string[]; // Ejemplo: ["1", "2", "3", "4"]

    @Column({ default: true })
    isActive: boolean; // columna para activar/desactivar la regla

    @ManyToOne(() => City, (city) => city.id, { onDelete: 'CASCADE' })
    city: City;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
