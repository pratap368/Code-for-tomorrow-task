import {DataSource} from "typeorm";
import "reflect-metadata";
import {User} from "./entities";
export const AppDataSource = new DataSource({
type:"mysql",
host:"localhost",
port:3306,
username:"root",
password:"",
database:"users",
entities:[User],
synchronize:true
});
