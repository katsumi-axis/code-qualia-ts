export class User {
  private id: string;
  private name: string;
  private age: number;

  constructor(id: string, name: string, age: number) {
    this.id = id;
    this.name = name;
    this.age = age;
  }

  canAccessFeature(feature: string): boolean {
    if (feature === 'admin' && this.age < 18) {
      return false;
    }
    if (feature === 'premium' && \!this.isPremium()) {
      return false;
    }
    if (feature === 'beta' && \!this.isBetaTester()) {
      return false;
    }
    return true;
  }

  private isPremium(): boolean {
    return this.id.startsWith('premium_');
  }

  private isBetaTester(): boolean {
    return this.id.includes('beta');
  }
}
EOF < /dev/null