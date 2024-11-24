export class PriceValue {
  private price: number;

  constructor(price: number) {
    this.price = price;
  }

  call() {
    return this.price;
  }
}
