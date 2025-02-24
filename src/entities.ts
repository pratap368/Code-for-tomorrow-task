import { Entity,PrimaryGeneratedColumn,Column } from "typeorm";

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    email:string

    @Column()
    passwordHash:string
    
    @Column({ nullable: true, type: "text", default: null }) 
    sessionToken: string | null;
}
@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column("decimal", { precision: 10, scale: 2 }) 
    price: number;

    @Column({ type: "text", nullable: true })
    description: string;

}