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
  @Column({ default: 0, type: 'real' })
  bankRate: number;
  @Column({ default: 0, type: 'real' })
  extraBankRate: number;

  @Column({ default: 0 })
  deprecationFactor: number;
  @Column({ default: 0 })
  machineCost: number;

  @Column({ default: 0, type: 'real' })
  ratingProfitEffect: number;
  @Column({ default: 0, type: 'real' })
  ratingDemandEffect: number;
  @Column({ default: 0, type: 'real' })
  ratingSupplyEffect: number;
  @Column({ default: 0, type: 'real' })
  ratingEfficiencyEffect: number;
  @Column({ default: 0, type: 'real' })
  ratingMarketingPartEffect: number;
  @Column({ default: 0, type: 'real' })
  ratingGrowEffect: number;

  @Column({ default: 0, type: 'real' })
  sharePriceEffect: number;
  @Column({ default: 0, type: 'real' })
  shareMarketingEffect: number;
  @Column({ default: 0, type: 'real' })
  shareNirEffect: number;

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
