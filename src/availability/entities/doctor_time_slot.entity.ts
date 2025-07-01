import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('doctor_time_slots')
export class DoctorTimeSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  doctorId: number;

  @Column()
  date: string;

  @Column()
  start_time: string;

  @Column()
  end_time: string;

  @Column({ default: true })
  is_available: boolean;
}
