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

  public constructor(props?: ScenarioProps) {
    if(props) {
      this.name = props.name;
      this.description = props.description;
      this.loanLimit = props.loanLimit;
      this.extraLoanLimit = props.extraLoanLimit;
      this.bankRate = props.bankRate;
      this.extraBankRate = props.extraBankRate;
    }
  }
}

export interface ScenarioProps {
  name: string;
  description: string;
  loanLimit: number;
  extraLoanLimit: number;
  bankRate: number;
  extraBankRate: number;
}
