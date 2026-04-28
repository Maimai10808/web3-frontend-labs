import type {
  Operation,
  Order,
  OrderEvent,
  OrderStatus,
  SubmitTradeResponse,
} from "./types";

type OrderListener = (event: OrderEvent) => void;

const orders = new Map<string, Order>();
const listeners = new Set<OrderListener>();

function generateOrderId() {
  return `order_${Date.now()}_${crypto.randomUUID()}`;
}

function emitOrderEvent(event: OrderEvent) {
  for (const listener of listeners) {
    listener(event);
  }
}

function getExpiresAt(operation: Operation) {
  return operation.tradeData.deadline * 1000;
}

export function subscribeOrderEvents(listener: OrderListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function listOrders() {
  return Array.from(orders.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function getOrder(orderId: string) {
  return orders.get(orderId) ?? null;
}

export function createOrderFromOperation(params: {
  operation: Operation;
  signature: string;
}): SubmitTradeResponse {
  const now = Date.now();
  const orderId = generateOrderId();

  const order: Order = {
    orderId,
    clientOrderId: params.operation.clientOrderId,
    account: params.operation.account,
    market: params.operation.tradeData.market,
    side: params.operation.tradeData.side,
    amount: params.operation.tradeData.amount,
    price: params.operation.tradeData.price,
    filledAmount: "0",
    status: "pending",
    signature: params.signature,
    createdAt: now,
    updatedAt: now,
    expiresAt: getExpiresAt(params.operation),
  };

  orders.set(orderId, order);

  emitOrderEvent({
    type: "order.created",
    order,
    createdAt: Date.now(),
  });

  scheduleMockOrderLifecycle(orderId);

  return {
    orderId,
    status: order.status,
    order,
    receivedAt: Date.now(),
  };
}

export function updateOrderStatus(params: {
  orderId: string;
  status: OrderStatus;
  filledAmount?: string;
}) {
  const order = orders.get(params.orderId);

  if (!order) {
    return null;
  }

  const updatedOrder: Order = {
    ...order,
    status: params.status,
    filledAmount: params.filledAmount ?? order.filledAmount,
    updatedAt: Date.now(),
  };

  orders.set(params.orderId, updatedOrder);

  emitOrderEvent({
    type: "order.updated",
    order: updatedOrder,
    createdAt: Date.now(),
  });

  return updatedOrder;
}

export function cancelOrder(orderId: string) {
  const order = orders.get(orderId);

  if (!order) {
    return null;
  }

  if (order.status === "filled" || order.status === "cancelled") {
    return order;
  }

  return updateOrderStatus({
    orderId,
    status: "cancelled",
  });
}

function scheduleMockOrderLifecycle(orderId: string) {
  setTimeout(() => {
    const order = orders.get(orderId);

    if (!order || order.status !== "pending") {
      return;
    }

    if (Date.now() > order.expiresAt) {
      updateOrderStatus({
        orderId,
        status: "expired",
      });
      return;
    }

    updateOrderStatus({
      orderId,
      status: "accepted",
    });
  }, 800);

  setTimeout(() => {
    const order = orders.get(orderId);

    if (!order || order.status !== "accepted") {
      return;
    }

    if (Date.now() > order.expiresAt) {
      updateOrderStatus({
        orderId,
        status: "expired",
      });
      return;
    }

    updateOrderStatus({
      orderId,
      status: "matched",
    });
  }, 1800);

  setTimeout(() => {
    const order = orders.get(orderId);

    if (!order || order.status !== "matched") {
      return;
    }

    if (Date.now() > order.expiresAt) {
      updateOrderStatus({
        orderId,
        status: "expired",
      });
      return;
    }

    updateOrderStatus({
      orderId,
      status: "filled",
      filledAmount: order.amount,
    });
  }, 3500);
}
