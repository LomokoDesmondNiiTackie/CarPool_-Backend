import { prisma } from "@shared/db/prisma";

export class BookingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'BookingError';
  }
}

export class RouteNotFoundError extends BookingError {
  constructor(busStopId: string) {
    super(
      `No route found for bus stop ${busStopId}`,
      'ROUTE_NOT_FOUND',
      404
    );
  }
}

const findRouteForBusStop = async (busStopId: string ): Promise<string> => {
  const routeBusStop = await prisma.routeBusStop.findFirst({
    where: {
      busStopId,
    },
    include: {
      route: true,
    },
  });

  if (!routeBusStop) {
    throw new RouteNotFoundError(busStopId);
  }

  return routeBusStop.route.id;
};

export {findRouteForBusStop}