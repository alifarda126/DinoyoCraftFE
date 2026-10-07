declare module "midtrans-client" {
  interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface CreateTransactionParams {
    order_id: string;
    gross_amount: number;
    customer_details?: {
      first_name: string;
      last_name?: string;
      email: string;
      phone: string;
    };
    item_details?: Array<{
      id: string;
      price: number;
      quantity: number;
      name: string;
    }>;
    credit_card?: {
      secure?: boolean;
    };
  }

  interface TransactionResult {
    token?: string;
    redirect_url?: string;
    status_code?: string;
    transaction_status?: string;
    [key: string]: unknown;
  }

  namespace Midtrans {
    class Snap {
      constructor(options: SnapOptions);
      createTransaction(params: CreateTransactionParams): Promise<TransactionResult>;
      transaction: {
        status(orderId: string): Promise<TransactionResult>;
      };
    }
  }

  export = Midtrans;
}
