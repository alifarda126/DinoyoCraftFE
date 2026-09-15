declare module "midtrans-client" {
  namespace Midtrans {
    class Snap {
      constructor(options: {
        isProduction: boolean;
        serverKey: string;
        clientKey: string;
      });
      createTransaction(params: any): Promise<any>;
      transaction: {
        status(orderId: string): Promise<any>;
      };
    }
  }

  export = Midtrans;
}
