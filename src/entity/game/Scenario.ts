import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Scenario {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  loanLimit: number;
  @Column()
  extraLoanLimit: number;
  @Column()
  bankRate: number;
  @Column()
  extraBankRate: number;

  public constructor({ name, description, loanLimit, extraLoanLimit, bankRate, extraBankRate }) {
    this.name = name;
    this.description = description;
    this.loanLimit = loanLimit;
    this.extraLoanLimit = extraLoanLimit;
    this.bankRate = bankRate;
    this.extraBankRate = extraBankRate;
  }
}
